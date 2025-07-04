// supabase/functions/task-assigner-ai/index.ts
// Edge Function IA pour l'assignation intelligente des tâches
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

interface TaskAssignmentRequest {
  taskTitle: string;
  taskDescription: string;
  requiredSkills?: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
  dueDate?: string;
  projectId: string;
}

interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  skills?: string[];
  currentWorkload?: number; // nombre de tâches en cours
  averageCompletionTime?: number; // en heures
  successRate?: number; // pourcentage de tâches terminées à temps
}

interface AIAssignmentSuggestion {
  suggestedAssigneeId: string;
  suggestedAssigneeName: string;
  confidence: number;
  reasoning: string;
  alternativeAssignees?: {
    assigneeId: string;
    assigneeName: string;
    confidence: number;
    reasoning: string;
  }[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const requestData: TaskAssignmentRequest = await req.json();
    
    console.log('Task Assigner AI:', { taskTitle: requestData.taskTitle, userId: user.id });

    // Récupérer la liste des employés disponibles avec leurs statistiques
    const { data: employees, error: employeesError } = await supabaseClient
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        role,
        companies (name)
      `)
      .neq('role', 'client')
      .eq('is_active', true);

    if (employeesError) {
      throw new Error(`Error fetching employees: ${employeesError.message}`);
    }

    if (!employees || employees.length === 0) {
      throw new Error('No available employees found');
    }

    // Calculer les statistiques de charge de travail pour chaque employé
    const employeeProfiles: EmployeeProfile[] = [];
    
    for (const employee of employees) {
      // Compter les tâches actives
      const { data: activeTasks, error: tasksError } = await supabaseClient
        .from('tasks')
        .select('id, status, estimated_hours, created_at, updated_at')
        .eq('assignee_id', employee.id)
        .in('status', ['todo', 'in_progress']);

      if (tasksError) {
        console.warn(`Error fetching tasks for employee ${employee.id}:`, tasksError);
      }

      // Calculer les statistiques de performance
      const { data: completedTasks, error: completedError } = await supabaseClient
        .from('tasks')
        .select('id, estimated_hours, actual_hours, due_date, updated_at')
        .eq('assignee_id', employee.id)
        .eq('status', 'done')
        .gte('updated_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // 90 derniers jours

      if (completedError) {
        console.warn(`Error fetching completed tasks for employee ${employee.id}:`, completedError);
      }

      const currentWorkload = activeTasks?.length || 0;
      const totalEstimatedHours = activeTasks?.reduce((sum, task) => 
        sum + (parseFloat(task.estimated_hours) || 0), 0) || 0;

      // Calculer le taux de réussite (tâches terminées à temps)
      const completedTasksCount = completedTasks?.length || 0;
      const onTimeTasks = completedTasks?.filter(task => {
        if (!task.due_date) return true;
        return new Date(task.updated_at) <= new Date(task.due_date);
      }).length || 0;
      
      const successRate = completedTasksCount > 0 ? (onTimeTasks / completedTasksCount) * 100 : 100;

      // Temps moyen de completion
      const averageCompletionTime = completedTasks?.length > 0 
        ? completedTasks.reduce((sum, task) => sum + (parseFloat(task.actual_hours) || parseFloat(task.estimated_hours) || 8), 0) / completedTasks.length
        : 8; // valeur par défaut

      employeeProfiles.push({
        id: employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        role: employee.role,
        currentWorkload,
        averageCompletionTime,
        successRate
      });
    }

    // Construire le prompt pour l'IA
    const employeeData = employeeProfiles.map(emp => 
      `- ${emp.name} (ID: ${emp.id}): ${emp.role}, ${emp.currentWorkload || 0} tâches actives, ${(emp.successRate || 100).toFixed(1)}% de réussite, ${(emp.averageCompletionTime || 8).toFixed(1)}h de completion moyenne`
    ).join('\n');

    const prompt = `
En tant qu'expert en gestion d'équipe et allocation de ressources, vous devez recommander le meilleur employé pour la tâche suivante :

**Tâche à assigner :**
- Titre : ${requestData.taskTitle}
- Description : ${requestData.taskDescription}
- Priorité : ${requestData.priority}
- Estimé : ${requestData.estimatedHours || 'non spécifié'} heures
- Échéance : ${requestData.dueDate || 'non spécifiée'}
- Compétences requises : ${requestData.requiredSkills?.join(', ') || 'non spécifiées'}

**Employés disponibles :**
${employeeData}

Analysez la charge de travail, les compétences et les performances de chaque employé pour recommander le meilleur assigné.

Retournez uniquement un JSON valide avec cette structure exacte :

{
  "suggestedAssigneeId": "id_de_l_employe",
  "suggestedAssigneeName": "nom_de_l_employe",
  "confidence": nombre_entre_0_et_100,
  "reasoning": "Explication détaillée du choix basée sur la charge de travail, les compétences et les performances",
  "alternativeAssignees": [
    {
      "assigneeId": "id_alternatif",
      "assigneeName": "nom_alternatif",
      "confidence": nombre_entre_0_et_100,
      "reasoning": "Explication du choix alternatif"
    }
  ]
}

Critères à considérer :
- Charge de travail actuelle (privilégier les moins chargés)
- Taux de réussite (privilégier les plus performants)
- Adéquation avec la priorité de la tâche
- Temps de completion moyen vs estimation
- Équilibre de la répartition des tâches
`;

    // Appel à l'API Gemini
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to get response from Gemini API');
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0] || !geminiData.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    let aiResponse = geminiData.candidates[0].content.parts[0].text;
    
    // Nettoyer la réponse pour extraire le JSON
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from AI response');
    }

    const assignmentSuggestion: AIAssignmentSuggestion = JSON.parse(jsonMatch[0]);

    // Valider que l'assigné suggéré existe
    const suggestedEmployee = employeeProfiles.find(emp => emp.id === assignmentSuggestion.suggestedAssigneeId);
    if (!suggestedEmployee) {
      throw new Error('Suggested assignee not found in available employees');
    }

    // Ajouter des métadonnées
    const enrichedSuggestion = {
      ...assignmentSuggestion,
      generatedAt: new Date().toISOString(),
      generatedFor: {
        taskTitle: requestData.taskTitle,
        userId: user.id
      },
      employeeStats: {
        totalAvailable: employeeProfiles.length,
        averageWorkload: employeeProfiles.reduce((sum, emp) => sum + (emp.currentWorkload || 0), 0) / employeeProfiles.length,
        averageSuccessRate: employeeProfiles.reduce((sum, emp) => sum + (emp.successRate || 100), 0) / employeeProfiles.length
      }
    };

    console.log('Task assignment suggestion generated:', {
      suggestedAssignee: assignmentSuggestion.suggestedAssigneeName,
      confidence: assignmentSuggestion.confidence
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: enrichedSuggestion,
        message: 'Task assignment suggestion generated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Task Assigner AI Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to generate task assignment suggestion'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

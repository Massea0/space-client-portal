// Edge Function pour la création en lot de tâches
// Permet d'éviter les appels séquentiels qui déclenchent les alertes de "boucle infinie"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaskBulkCreateRequest {
  projectId: string;
  tasks: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    customFields?: Record<string, any>;
  }[];
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialiser le client Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Vérifier l'authentification
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const requestData: TaskBulkCreateRequest = await req.json()

    if (!requestData.projectId || !requestData.tasks || requestData.tasks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'projectId and tasks array are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Vérifier que le projet existe et que l'utilisateur y a accès
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('id, name')
      .eq('id', requestData.projectId)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Préparer les tâches pour l'insertion en lot
    const now = new Date().toISOString()
    const tasksToInsert = requestData.tasks.map((task, index) => ({
      project_id: requestData.projectId,
      title: task.title,
      description: task.description || null,
      status: 'todo',
      priority: task.priority || 'medium',
      estimated_hours: task.estimatedHours || null,
      position: index, // Position basée sur l'ordre dans le tableau
      custom_fields: task.customFields || {},
      created_at: now,
      updated_at: now,
    }))

    // Insérer toutes les tâches en une seule requête
    const { data: insertedTasks, error: insertError } = await supabaseClient
      .from('tasks')
      .insert(tasksToInsert)
      .select('*')

    if (insertError) {
      console.error('Erreur insertion tâches:', insertError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create tasks', 
          details: insertError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Retourner le résultat avec statistiques
    return new Response(
      JSON.stringify({
        success: true,
        project: {
          id: project.id,
          name: project.name
        },
        tasksCreated: insertedTasks.length,
        tasks: insertedTasks,
        message: `${insertedTasks.length} tâches créées avec succès pour le projet "${project.name}"`
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erreur dans bulk-create-tasks:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

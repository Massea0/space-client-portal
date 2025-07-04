// supabase/functions/tasks-api/index.ts
// API CRUD pour la gestion des tâches avec support drag & drop
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

interface DbTask {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  assignee_id: string | null;
  due_date: string | null;
  priority: string;
  estimated_hours: string | null;
  actual_hours: string | null;
  position: number;
  custom_fields: any;
  created_at: string;
  updated_at: string;
  projects?: { name: string };
  users?: { first_name: string; last_name: string };
}

interface TaskCreatePayload {
  projectId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: string;
  estimatedHours?: number;
  customFields?: any;
}

interface TaskUpdatePayload {
  title?: string;
  description?: string;
  status?: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: string;
  estimatedHours?: number;
  actualHours?: number;
  position?: number;
  customFields?: any;
}

interface TaskReorderPayload {
  taskIds: string[];
  newPositions: number[];
}

const mapTaskFromDb = (dbTask: DbTask) => ({
  id: dbTask.id,
  projectId: dbTask.project_id,
  projectName: dbTask.projects?.name,
  title: dbTask.title,
  description: dbTask.description,
  status: dbTask.status,
  assigneeId: dbTask.assignee_id,
  assigneeName: dbTask.users ? `${dbTask.users.first_name} ${dbTask.users.last_name}` : null,
  dueDate: dbTask.due_date ? new Date(dbTask.due_date).toISOString() : null,
  priority: dbTask.priority,
  estimatedHours: dbTask.estimated_hours ? parseFloat(dbTask.estimated_hours) : null,
  actualHours: dbTask.actual_hours ? parseFloat(dbTask.actual_hours) : null,
  position: dbTask.position,
  customFields: dbTask.custom_fields || {},
  createdAt: new Date(dbTask.created_at).toISOString(),
  updatedAt: new Date(dbTask.updated_at).toISOString()
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get auth token from headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    console.log('Tasks API:', { method: req.method, pathSegments, userId: user.id });

    switch (req.method) {
      case 'GET':
        const projectId = url.searchParams.get('projectId');
        const taskId = pathSegments[pathSegments.length - 1];
        
        if (taskId && taskId !== 'tasks-api') {
          // GET /tasks/{id} - Récupérer une tâche spécifique
          const { data: task, error: getError } = await supabaseClient
            .from('tasks')
            .select(`
              *,
              projects:project_id (name),
              users:assignee_id (first_name, last_name)
            `)
            .eq('id', taskId)
            .single();

          if (getError) {
            throw new Error(`Error fetching task: ${getError.message}`);
          }

          if (!task) {
            return new Response(
              JSON.stringify({ error: 'Task not found' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, data: mapTaskFromDb(task) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (projectId) {
          // GET /tasks?projectId={id} - Récupérer les tâches d'un projet
          const { data: tasks, error: listError } = await supabaseClient
            .from('tasks')
            .select(`
              *,
              projects:project_id (name),
              users:assignee_id (first_name, last_name)
            `)
            .eq('project_id', projectId)
            .order('position', { ascending: true });

          if (listError) {
            throw new Error(`Error fetching project tasks: ${listError.message}`);
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              data: tasks.map(mapTaskFromDb),
              total: tasks.length 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // GET /tasks - Récupérer toutes les tâches de l'utilisateur
          const { data: tasks, error: listError } = await supabaseClient
            .from('tasks')
            .select(`
              *,
              projects:project_id (name),
              users:assignee_id (first_name, last_name)
            `)
            .order('updated_at', { ascending: false });

          if (listError) {
            throw new Error(`Error fetching tasks: ${listError.message}`);
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              data: tasks.map(mapTaskFromDb),
              total: tasks.length 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        const body = await req.json();
        
        if (body.action === 'reorder') {
          // POST /tasks avec action=reorder - Réorganiser les tâches
          const reorderPayload: TaskReorderPayload = body;
          
          const { error: reorderError } = await supabaseClient
            .rpc('reorder_tasks', {
              task_ids: reorderPayload.taskIds,
              new_positions: reorderPayload.newPositions
            });

          if (reorderError) {
            throw new Error(`Error reordering tasks: ${reorderError.message}`);
          }

          return new Response(
            JSON.stringify({ success: true, message: 'Tasks reordered successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // POST /tasks - Créer une nouvelle tâche
          const createPayload: TaskCreatePayload = body;
          
          // Obtenir la prochaine position pour la tâche
          const { data: maxPositionResult } = await supabaseClient
            .from('tasks')
            .select('position')
            .eq('project_id', createPayload.projectId)
            .order('position', { ascending: false })
            .limit(1);

          const nextPosition = (maxPositionResult?.[0]?.position || 0) + 1;

          const taskData = {
            project_id: createPayload.projectId,
            title: createPayload.title,
            description: createPayload.description || null,
            assignee_id: createPayload.assigneeId || null,
            due_date: createPayload.dueDate || null,
            priority: createPayload.priority || 'medium',
            estimated_hours: createPayload.estimatedHours || null,
            custom_fields: createPayload.customFields || {},
            position: nextPosition
          };

          const { data: newTask, error: createError } = await supabaseClient
            .from('tasks')
            .insert(taskData)
            .select(`
              *,
              projects:project_id (name),
              users:assignee_id (first_name, last_name)
            `)
            .single();

          if (createError) {
            throw new Error(`Error creating task: ${createError.message}`);
          }

          return new Response(
            JSON.stringify({ success: true, data: mapTaskFromDb(newTask) }),
            { 
              status: 201, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

      case 'PUT':
        // PUT /tasks/{id} - Mettre à jour une tâche
        const updateTaskId = pathSegments[pathSegments.length - 1];
        if (!updateTaskId || updateTaskId === 'tasks-api') {
          throw new Error('Task ID is required for update');
        }

        const updatePayload: TaskUpdatePayload = await req.json();
        
        const updateData: any = {};
        if (updatePayload.title !== undefined) updateData.title = updatePayload.title;
        if (updatePayload.description !== undefined) updateData.description = updatePayload.description;
        if (updatePayload.status !== undefined) updateData.status = updatePayload.status;
        if (updatePayload.assigneeId !== undefined) updateData.assignee_id = updatePayload.assigneeId;
        if (updatePayload.dueDate !== undefined) updateData.due_date = updatePayload.dueDate;
        if (updatePayload.priority !== undefined) updateData.priority = updatePayload.priority;
        if (updatePayload.estimatedHours !== undefined) updateData.estimated_hours = updatePayload.estimatedHours;
        if (updatePayload.actualHours !== undefined) updateData.actual_hours = updatePayload.actualHours;
        if (updatePayload.position !== undefined) updateData.position = updatePayload.position;
        if (updatePayload.customFields !== undefined) updateData.custom_fields = updatePayload.customFields;

        const { data: updatedTask, error: updateError } = await supabaseClient
          .from('tasks')
          .update(updateData)
          .eq('id', updateTaskId)
          .select(`
            *,
            projects:project_id (name),
            users:assignee_id (first_name, last_name)
          `)
          .single();

        if (updateError) {
          throw new Error(`Error updating task: ${updateError.message}`);
        }

        return new Response(
          JSON.stringify({ success: true, data: mapTaskFromDb(updatedTask) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // DELETE /tasks/{id} - Supprimer une tâche
        const deleteTaskId = pathSegments[pathSegments.length - 1];
        if (!deleteTaskId || deleteTaskId === 'tasks-api') {
          throw new Error('Task ID is required for deletion');
        }

        const { error: deleteError } = await supabaseClient
          .from('tasks')
          .delete()
          .eq('id', deleteTaskId);

        if (deleteError) {
          throw new Error(`Error deleting task: ${deleteError.message}`);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Task deleted successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      default:
        return new Response(
          JSON.stringify({ error: 'Method not allowed' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

  } catch (error) {
    console.error('Tasks API Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

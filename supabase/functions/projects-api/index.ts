// supabase/functions/projects-api/index.ts
// API CRUD pour la gestion des projets avec support de l'IA
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

interface DbProject {
  id: string;
  name: string;
  description: string | null;
  client_company_id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: string | null;
  owner_id: string | null;
  custom_fields: any;
  created_at: string;
  updated_at: string;
  companies?: { name: string };
  users?: { first_name: string; last_name: string };
  tasks?: any[];
}

interface ProjectCreatePayload {
  name: string;
  description?: string;
  clientCompanyId: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  ownerId?: string;
  customFields?: any;
}

interface ProjectUpdatePayload {
  name?: string;
  description?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  ownerId?: string;
  customFields?: any;
}

const mapProjectFromDb = (dbProject: DbProject) => ({
  id: dbProject.id,
  name: dbProject.name,
  description: dbProject.description,
  clientCompanyId: dbProject.client_company_id,
  clientCompanyName: dbProject.companies?.name,
  status: dbProject.status,
  startDate: dbProject.start_date ? new Date(dbProject.start_date).toISOString() : null,
  endDate: dbProject.end_date ? new Date(dbProject.end_date).toISOString() : null,
  budget: dbProject.budget ? parseFloat(dbProject.budget) : null,
  ownerId: dbProject.owner_id,
  ownerName: dbProject.users ? `${dbProject.users.first_name} ${dbProject.users.last_name}` : null,
  customFields: dbProject.custom_fields || {},
  createdAt: new Date(dbProject.created_at).toISOString(),
  updatedAt: new Date(dbProject.updated_at).toISOString(),
  tasksCount: (dbProject.tasks || []).length,
  completedTasksCount: (dbProject.tasks || []).filter(t => t.status === 'done').length,
  progressPercentage: (dbProject.tasks || []).length > 0 
    ? Math.round(((dbProject.tasks || []).filter(t => t.status === 'done').length / (dbProject.tasks || []).length) * 100)
    : 0
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
    const projectId = pathSegments[pathSegments.length - 1];
    
    console.log('Projects API:', { method: req.method, pathSegments, projectId, userId: user.id });

    switch (req.method) {
      case 'GET':
        if (projectId && projectId !== 'projects-api') {
          // GET /projects/{id} - Récupérer un projet spécifique
          const { data: project, error: getError } = await supabaseClient
            .from('projects')
            .select(`
              *,
              companies:client_company_id (name),
              users:owner_id (first_name, last_name),
              tasks (id, status)
            `)
            .eq('id', projectId)
            .single();

          if (getError) {
            throw new Error(`Error fetching project: ${getError.message}`);
          }

          if (!project) {
            return new Response(
              JSON.stringify({ error: 'Project not found' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          return new Response(
            JSON.stringify({ success: true, data: mapProjectFromDb(project) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          // GET /projects - Récupérer tous les projets
          const { data: projects, error: listError } = await supabaseClient
            .from('projects')
            .select(`
              *,
              companies:client_company_id (name),
              users:owner_id (first_name, last_name),
              tasks (id, status)
            `)
            .order('updated_at', { ascending: false });

          if (listError) {
            throw new Error(`Error fetching projects: ${listError.message}`);
          }

          return new Response(
            JSON.stringify({ 
              success: true, 
              data: projects.map(mapProjectFromDb),
              total: projects.length 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

      case 'POST':
        // POST /projects - Créer un nouveau projet
        const createPayload: ProjectCreatePayload = await req.json();
        
        const projectData = {
          name: createPayload.name,
          description: createPayload.description || null,
          client_company_id: createPayload.clientCompanyId,
          start_date: createPayload.startDate || null,
          end_date: createPayload.endDate || null,
          budget: createPayload.budget || null,
          owner_id: createPayload.ownerId || null,
          custom_fields: createPayload.customFields || {}
        };

        const { data: newProject, error: createError } = await supabaseClient
          .from('projects')
          .insert(projectData)
          .select(`
            *,
            companies:client_company_id (name),
            users:owner_id (first_name, last_name)
          `)
          .single();

        if (createError) {
          throw new Error(`Error creating project: ${createError.message}`);
        }

        return new Response(
          JSON.stringify({ success: true, data: mapProjectFromDb(newProject) }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );

      case 'PUT':
        // PUT /projects/{id} - Mettre à jour un projet
        if (!projectId || projectId === 'projects-api') {
          throw new Error('Project ID is required for update');
        }

        const updatePayload: ProjectUpdatePayload = await req.json();
        
        const updateData: any = {};
        if (updatePayload.name !== undefined) updateData.name = updatePayload.name;
        if (updatePayload.description !== undefined) updateData.description = updatePayload.description;
        if (updatePayload.status !== undefined) updateData.status = updatePayload.status;
        if (updatePayload.startDate !== undefined) updateData.start_date = updatePayload.startDate;
        if (updatePayload.endDate !== undefined) updateData.end_date = updatePayload.endDate;
        if (updatePayload.budget !== undefined) updateData.budget = updatePayload.budget;
        if (updatePayload.ownerId !== undefined) updateData.owner_id = updatePayload.ownerId;
        if (updatePayload.customFields !== undefined) updateData.custom_fields = updatePayload.customFields;

        const { data: updatedProject, error: updateError } = await supabaseClient
          .from('projects')
          .update(updateData)
          .eq('id', projectId)
          .select(`
            *,
            companies:client_company_id (name),
            users:owner_id (first_name, last_name),
            tasks (id, status)
          `)
          .single();

        if (updateError) {
          throw new Error(`Error updating project: ${updateError.message}`);
        }

        return new Response(
          JSON.stringify({ success: true, data: mapProjectFromDb(updatedProject) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      case 'DELETE':
        // DELETE /projects/{id} - Supprimer un projet
        if (!projectId || projectId === 'projects-api') {
          throw new Error('Project ID is required for deletion');
        }

        const { error: deleteError } = await supabaseClient
          .from('projects')
          .delete()
          .eq('id', projectId);

        if (deleteError) {
          throw new Error(`Error deleting project: ${deleteError.message}`);
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Project deleted successfully' }),
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
    console.error('Projects API Error:', error);
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

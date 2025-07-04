import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // SQL de création des tables projects et tasks
    const migrationSQL = `
      -- Création de la table public.projects
      CREATE TABLE IF NOT EXISTS public.projects (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          client_company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
          status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
          start_date TIMESTAMPTZ,
          end_date TIMESTAMPTZ,
          budget NUMERIC(12, 2),
          owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Création de la table public.tasks
      CREATE TABLE IF NOT EXISTS public.tasks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')),
          assignee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          due_date TIMESTAMPTZ,
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          estimated_hours NUMERIC(6, 2),
          actual_hours NUMERIC(6, 2),
          position INTEGER DEFAULT 0,
          custom_fields JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Index
      CREATE INDEX IF NOT EXISTS idx_projects_client_company_id ON public.projects(client_company_id);
      CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
      CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

      -- Triggers pour updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_projects_updated_at 
          BEFORE UPDATE ON public.projects 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      CREATE TRIGGER update_tasks_updated_at 
          BEFORE UPDATE ON public.tasks 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      -- RLS
      ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
      ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

      -- Service role policy
      CREATE POLICY IF NOT EXISTS "Service role can manage all projects" ON public.projects
          FOR ALL USING (auth.role() = 'service_role');

      CREATE POLICY IF NOT EXISTS "Service role can manage all tasks" ON public.tasks
          FOR ALL USING (auth.role() = 'service_role');
    `;

    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql: migrationSQL 
    })

    if (error) {
      console.error('Migration error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Migration applied successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

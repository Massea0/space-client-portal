-- Migration: Création des tables pour le système de gestion de projet
-- Date: 2025-07-03
-- Description: Tables projects et tasks pour la gestion de projet inspirée de Notion/Twenty

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
    position INTEGER DEFAULT 0, -- Pour l'ordre dans les vues Kanban/Liste
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_projects_client_company_id ON public.projects(client_company_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at);

CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON public.tasks(position);

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

-- Activation des politiques RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour la table projects
-- Les clients ne peuvent voir que leurs propres projets
CREATE POLICY "Clients can view their own projects" ON public.projects
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'client' 
            AND company_id = projects.client_company_id
        )
    );

-- Les clients peuvent créer des projets pour leur entreprise
CREATE POLICY "Clients can create projects for their company" ON public.projects
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'client' 
            AND company_id = NEW.client_company_id
        )
    );

-- Les clients peuvent modifier leurs projets non terminés
CREATE POLICY "Clients can update their own projects" ON public.projects
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'client' 
            AND company_id = projects.client_company_id
        )
        AND status NOT IN ('completed', 'cancelled')
    );

-- Les administrateurs et managers ont accès complet
CREATE POLICY "Admins can manage all projects" ON public.projects
    FOR ALL USING (
        auth.uid() IN (
            SELECT id FROM public.users 
            WHERE role = 'admin'
        )
    );

-- Service role a accès complet
CREATE POLICY "Service role can manage all projects" ON public.projects
    FOR ALL USING (auth.role() = 'service_role');

-- Politiques RLS pour la table tasks
-- Les utilisateurs peuvent voir les tâches des projets auxquels ils ont accès
CREATE POLICY "Users can view tasks for accessible projects" ON public.tasks
    FOR SELECT USING (
        project_id IN (
            SELECT p.id FROM public.projects p
            WHERE (
                -- Clients : leurs projets
                (auth.uid() IN (
                    SELECT u.id FROM public.users u 
                    WHERE u.role = 'client' 
                    AND u.company_id = p.client_company_id
                ))
                OR
                -- Assigné à la tâche
                (auth.uid() = tasks.assignee_id)
                OR
                -- Propriétaire du projet
                (auth.uid() = p.owner_id)
                OR
                -- Administrateurs
                (auth.uid() IN (
                    SELECT u.id FROM public.users u 
                    WHERE u.role = 'admin'
                ))
            )
        )
    );

-- Les utilisateurs peuvent créer des tâches pour les projets accessibles
CREATE POLICY "Users can create tasks for accessible projects" ON public.tasks
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT p.id FROM public.projects p
            WHERE (
                (auth.uid() IN (
                    SELECT u.id FROM public.users u 
                    WHERE u.role = 'client' 
                    AND u.company_id = p.client_company_id
                ))
                OR
                (auth.uid() = p.owner_id)
                OR
                (auth.uid() IN (
                    SELECT u.id FROM public.users u 
                    WHERE u.role = 'admin'
                ))
            )
        )
    );

-- Les utilisateurs peuvent modifier les tâches selon leurs droits
CREATE POLICY "Users can update accessible tasks" ON public.tasks
    FOR UPDATE USING (
        project_id IN (
            SELECT p.id FROM public.projects p
            WHERE (
                (auth.uid() IN (
                    SELECT u.id FROM public.users u 
                    WHERE u.role = 'client' 
                    AND u.company_id = p.client_company_id
                ))
                OR
                (auth.uid() = tasks.assignee_id)
                OR
                (auth.uid() = p.owner_id)
                OR
                (auth.uid() IN (
                    SELECT u.id FROM public.users u 
                    WHERE u.role = 'admin'
                ))
            )
        )
    );

-- Suppression limitée aux admins et propriétaires
CREATE POLICY "Admins and owners can delete tasks" ON public.tasks
    FOR DELETE USING (
        project_id IN (
            SELECT p.id FROM public.projects p
            WHERE (
                (auth.uid() = p.owner_id)
                OR
                (auth.uid() IN (
                    SELECT u.id FROM public.users u 
                    WHERE u.role = 'admin'
                ))
            )
        )
    );

-- Service role a accès complet
CREATE POLICY "Service role can manage all tasks" ON public.tasks
    FOR ALL USING (auth.role() = 'service_role');

-- Fonction helper pour réorganiser les tâches
CREATE OR REPLACE FUNCTION reorder_tasks(
    task_ids UUID[],
    new_positions INTEGER[]
) RETURNS BOOLEAN AS $$
DECLARE
    i INTEGER;
BEGIN
    -- Vérifier que les arrays ont la même taille
    IF array_length(task_ids, 1) != array_length(new_positions, 1) THEN
        RAISE EXCEPTION 'task_ids and new_positions arrays must have the same length';
    END IF;
    
    -- Mettre à jour les positions
    FOR i IN 1..array_length(task_ids, 1) LOOP
        UPDATE public.tasks 
        SET position = new_positions[i], updated_at = NOW()
        WHERE id = task_ids[i];
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour la documentation
COMMENT ON TABLE public.projects IS 'Table pour la gestion des projets avec support des champs personnalisés type Notion';
COMMENT ON TABLE public.tasks IS 'Table pour la gestion des tâches avec support drag & drop et assignation';
COMMENT ON COLUMN public.projects.custom_fields IS 'Champs personnalisés flexibles au format JSON pour étendre les données projet';
COMMENT ON COLUMN public.tasks.custom_fields IS 'Champs personnalisés flexibles au format JSON pour étendre les données tâche';
COMMENT ON COLUMN public.tasks.position IS 'Position pour réorganisation drag & drop dans les vues Kanban et liste';
COMMENT ON FUNCTION reorder_tasks IS 'Fonction helper pour réorganiser l''ordre des tâches en batch';

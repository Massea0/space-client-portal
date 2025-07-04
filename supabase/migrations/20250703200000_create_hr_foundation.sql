-- Migration: Création de la foundation RH Ultimate avec support branches/filiales
-- Date: 2025-07-03 20:00:00
-- Description: Tables de base pour système RH grandiose avec architecture SaaS

-- ============================================================================
-- 1. TABLE BRANCHES/FILIALES
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL, -- Code court pour identification (ex: "PAR", "DAK", "ABJ")
    description TEXT,
    
    -- Localisation et contact
    country TEXT NOT NULL DEFAULT 'SN',
    region TEXT, -- Région/État
    city TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    
    -- Hiérarchie
    parent_branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    is_headquarters BOOLEAN DEFAULT false,
    level INTEGER DEFAULT 1, -- 1=Siège, 2=Filiale, 3=Agence
    
    -- Gestion
    director_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    hr_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Configuration locale
    timezone TEXT DEFAULT 'Africa/Dakar',
    currency_code TEXT DEFAULT 'XOF',
    language_code TEXT DEFAULT 'fr',
    local_regulations JSONB DEFAULT '{}', -- Réglementations locales
    
    -- Métriques et budgets
    employee_capacity INTEGER DEFAULT 100,
    annual_budget NUMERIC(15, 2),
    cost_center_code TEXT,
    
    -- Statut et métadonnées
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'closed', 'planning')),
    opening_date DATE,
    closing_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    -- Contraintes
    UNIQUE(code),
    UNIQUE(name)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_branches_parent ON public.branches(parent_branch_id);
CREATE INDEX IF NOT EXISTS idx_branches_country ON public.branches(country);
CREATE INDEX IF NOT EXISTS idx_branches_status ON public.branches(status);
CREATE INDEX IF NOT EXISTS idx_branches_director ON public.branches(director_id);
CREATE INDEX IF NOT EXISTS idx_branches_hr_manager ON public.branches(hr_manager_id);

-- ============================================================================
-- 2. TABLE DÉPARTEMENTS (avec support branches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL, -- Code département (ex: "IT", "HR", "SALES")
    description TEXT,
    
    -- Hiérarchie et rattachement
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 1, -- Niveau hiérarchique
    
    -- Gestion
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    assistant_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Budget et objectifs
    annual_budget NUMERIC(12, 2),
    cost_center_code TEXT,
    objectives JSONB DEFAULT '[]', -- Objectifs annuels
    kpis JSONB DEFAULT '{}', -- KPIs et métriques
    
    -- Configuration
    max_employees INTEGER DEFAULT 50,
    overtime_allowed BOOLEAN DEFAULT true,
    remote_work_allowed BOOLEAN DEFAULT false,
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'restructuring', 'merged')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(branch_id, code),
    UNIQUE(branch_id, name)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_departments_branch ON public.departments(branch_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON public.departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON public.departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_departments_status ON public.departments(status);

-- ============================================================================
-- 3. TABLE POSITIONS/POSTES (avec grilles salariales par région)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT NOT NULL, -- Code poste standardisé
    description TEXT,
    
    -- Rattachement
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    
    -- Hiérarchie et niveau
    level INTEGER NOT NULL DEFAULT 1, -- 1=Junior, 2=Medior, 3=Senior, 4=Lead, 5=Manager
    seniority_min_years INTEGER DEFAULT 0,
    reports_to_position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    
    -- Grille salariale (adaptée par région)
    salary_min NUMERIC(10, 2),
    salary_max NUMERIC(10, 2),
    salary_currency TEXT DEFAULT 'XOF',
    salary_frequency TEXT DEFAULT 'monthly' 
        CHECK (salary_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
    
    -- Avantages et bénéfices
    benefits JSONB DEFAULT '{}', -- Transport, logement, assurance, etc.
    bonus_eligible BOOLEAN DEFAULT false,
    commission_eligible BOOLEAN DEFAULT false,
    
    -- Compétences requises
    required_skills JSONB DEFAULT '[]', -- Compétences techniques
    required_certifications JSONB DEFAULT '[]', -- Certifications obligatoires
    required_education TEXT, -- Niveau d'éducation minimum
    required_experience_years INTEGER DEFAULT 0,
    
    -- Évolution de carrière
    career_path JSONB DEFAULT '[]', -- Postes d'évolution possibles
    promotion_criteria JSONB DEFAULT '{}', -- Critères de promotion
    
    -- Configuration emploi
    employment_type TEXT DEFAULT 'full_time' 
        CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'consultant')),
    remote_work_allowed BOOLEAN DEFAULT false,
    travel_required BOOLEAN DEFAULT false,
    travel_percentage INTEGER DEFAULT 0,
    
    -- Statut et capacité
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'archived', 'draft')),
    max_headcount INTEGER DEFAULT 1, -- Nombre maximum d'employés sur ce poste
    current_headcount INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(department_id, code),
    CHECK (salary_min <= salary_max),
    CHECK (travel_percentage >= 0 AND travel_percentage <= 100),
    CHECK (current_headcount <= max_headcount)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_positions_department ON public.positions(department_id);
CREATE INDEX IF NOT EXISTS idx_positions_branch ON public.positions(branch_id);
CREATE INDEX IF NOT EXISTS idx_positions_level ON public.positions(level);
CREATE INDEX IF NOT EXISTS idx_positions_status ON public.positions(status);
CREATE INDEX IF NOT EXISTS idx_positions_reports_to ON public.positions(reports_to_position_id);

-- ============================================================================
-- 4. TABLE EMPLOYÉS (table principale)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Référence utilisateur (optionnelle si employé n'a pas accès système)
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Identification employé
    employee_number TEXT NOT NULL, -- Matricule unique
    badge_number TEXT, -- Numéro de badge/carte
    
    -- Informations personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    preferred_name TEXT, -- Nom d'usage
    gender TEXT CHECK (gender IN ('M', 'F', 'Other', 'Prefer_not_to_say')),
    date_of_birth DATE,
    nationality TEXT,
    
    -- Contact
    personal_email TEXT,
    work_email TEXT,
    personal_phone TEXT,
    work_phone TEXT,
    emergency_contact JSONB DEFAULT '{}', -- Contact d'urgence
    
    -- Adresse
    address JSONB DEFAULT '{}', -- Adresse complète structurée
    
    -- Rattachement organisationnel
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    
    -- Hiérarchie
    manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    reports_count INTEGER DEFAULT 0, -- Nombre de personnes sous sa responsabilité
    
    -- Emploi
    hire_date DATE NOT NULL,
    start_date DATE NOT NULL, -- Date de début effective (peut différer de hire_date)
    end_date DATE, -- Date de fin si terminé
    probation_end_date DATE, -- Fin de période d'essai
    
    -- Statut emploi
    employment_status TEXT NOT NULL DEFAULT 'active'
        CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave', 'suspended')),
    employment_type TEXT NOT NULL DEFAULT 'full_time'
        CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'consultant')),
    
    -- Salaire et compensation
    current_salary NUMERIC(10, 2),
    salary_currency TEXT DEFAULT 'XOF',
    salary_frequency TEXT DEFAULT 'monthly',
    last_salary_review_date DATE,
    next_salary_review_date DATE,
    
    -- Performance et compétences
    performance_score NUMERIC(3, 2) DEFAULT 0, -- Score de 0 à 5
    skills JSONB DEFAULT '[]', -- Compétences actuelles avec niveaux
    certifications JSONB DEFAULT '[]', -- Certifications obtenues
    languages JSONB DEFAULT '[]', -- Langues parlées avec niveaux
    
    -- Congés et absences
    vacation_days_total INTEGER DEFAULT 30, -- Jours de congés annuels
    vacation_days_used INTEGER DEFAULT 0,
    sick_days_used INTEGER DEFAULT 0,
    
    -- Préférences et configuration
    work_preferences JSONB DEFAULT '{}', -- Préférences de travail
    timezone TEXT DEFAULT 'Africa/Dakar',
    
    -- Données IA et analytics
    ai_insights JSONB DEFAULT '{}', -- Insights générés par IA
    performance_trends JSONB DEFAULT '{}', -- Tendances de performance
    career_recommendations JSONB DEFAULT '[]', -- Recommandations de carrière IA
    
    -- Audit et métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    last_login_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    
    -- Contraintes
    UNIQUE(employee_number),
    UNIQUE(badge_number),
    UNIQUE(work_email),
    CHECK (vacation_days_used <= vacation_days_total),
    CHECK (performance_score >= 0 AND performance_score <= 5),
    CHECK (hire_date <= start_date),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_employees_user ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch ON public.employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON public.employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_number ON public.employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON public.employees(hire_date);
CREATE INDEX IF NOT EXISTS idx_employees_last_name ON public.employees(last_name);
CREATE INDEX IF NOT EXISTS idx_employees_work_email ON public.employees(work_email);

-- ============================================================================
-- 5. FONCTIONS ET TRIGGERS
-- ============================================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_hr_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_branches_updated_at 
    BEFORE UPDATE ON branches FOR EACH ROW 
    EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments FOR EACH ROW 
    EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_positions_updated_at 
    BEFORE UPDATE ON positions FOR EACH ROW 
    EXECUTE FUNCTION update_hr_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees FOR EACH ROW 
    EXECUTE FUNCTION update_hr_updated_at_column();

-- Fonction pour calculer automatiquement reports_count
CREATE OR REPLACE FUNCTION update_manager_reports_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Décrémenter l'ancien manager
    IF OLD.manager_id IS NOT NULL THEN
        UPDATE employees 
        SET reports_count = reports_count - 1 
        WHERE id = OLD.manager_id;
    END IF;
    
    -- Incrémenter le nouveau manager
    IF NEW.manager_id IS NOT NULL THEN
        UPDATE employees 
        SET reports_count = reports_count + 1 
        WHERE id = NEW.manager_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour maintenir reports_count
CREATE TRIGGER update_manager_reports_count_trigger
    AFTER UPDATE OF manager_id ON employees
    FOR EACH ROW EXECUTE FUNCTION update_manager_reports_count();

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Politiques pour BRANCHES
CREATE POLICY "Super admins can do everything on branches" ON public.branches
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "HR managers can view branches" ON public.branches
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('hr_manager', 'admin')
        )
    );

-- Politiques pour DEPARTMENTS
CREATE POLICY "Super admins can do everything on departments" ON public.departments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "HR managers can manage departments" ON public.departments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('hr_manager', 'admin')
        )
    );

CREATE POLICY "Managers can view their departments" ON public.departments
    FOR SELECT TO authenticated
    USING (
        manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM employees 
            WHERE employees.user_id = auth.uid() 
            AND employees.department_id = departments.id
        )
    );

-- Politiques pour POSITIONS
CREATE POLICY "Super admins can do everything on positions" ON public.positions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "HR managers can manage positions" ON public.positions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('hr_manager', 'admin')
        )
    );

-- Politiques pour EMPLOYEES
CREATE POLICY "Super admins can do everything on employees" ON public.employees
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'super_admin'
        )
    );

CREATE POLICY "HR managers can manage employees" ON public.employees
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('hr_manager', 'admin')
        )
    );

CREATE POLICY "Managers can view their team" ON public.employees
    FOR SELECT TO authenticated
    USING (
        manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM employees managers
            WHERE managers.user_id = auth.uid() 
            AND employees.manager_id = managers.id
        )
    );

CREATE POLICY "Employees can view their own data" ON public.employees
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

-- ============================================================================
-- 7. DONNÉES DE TEST (Optionnel - à supprimer en production)
-- ============================================================================

-- Insérer le siège social par défaut
INSERT INTO public.branches (name, code, country, city, is_headquarters, level, status)
VALUES ('Siège Social', 'HQ', 'SN', 'Dakar', true, 1, 'active')
ON CONFLICT (code) DO NOTHING;

-- Insérer départements de base
INSERT INTO public.departments (name, code, branch_id)
SELECT 'Direction Générale', 'DG', b.id FROM branches b WHERE b.code = 'HQ'
ON CONFLICT (branch_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, branch_id)
SELECT 'Ressources Humaines', 'RH', b.id FROM branches b WHERE b.code = 'HQ'
ON CONFLICT (branch_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, branch_id)
SELECT 'Technologies', 'IT', b.id FROM branches b WHERE b.code = 'HQ'
ON CONFLICT (branch_id, code) DO NOTHING;

-- ============================================================================
-- COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.branches IS 'Branches et filiales de l''entreprise avec support hiérarchique';
COMMENT ON TABLE public.departments IS 'Départements avec rattachement aux branches et hiérarchie';
COMMENT ON TABLE public.positions IS 'Postes avec grilles salariales adaptées par région';
COMMENT ON TABLE public.employees IS 'Table principale des employés avec données complètes et IA';

COMMENT ON COLUMN public.employees.ai_insights IS 'Insights générés par IA Gemini pour cet employé';
COMMENT ON COLUMN public.employees.performance_trends IS 'Tendances de performance calculées par IA';
COMMENT ON COLUMN public.employees.career_recommendations IS 'Recommandations de carrière générées par IA';

-- ============================================================================
-- SCRIPT DE MIGRATION RH SÉCURISÉ - MYSPACE
-- ============================================================================
-- Date: 4 juillet 2025
-- Objectif: Application sécurisée du module RH avec vérifications
-- À exécuter APRÈS l'audit si les tables RH n'existent pas
-- ============================================================================

-- ÉTAPE 1: VÉRIFICATIONS PRÉLIMINAIRES
-- ============================================================================

DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
BEGIN
    -- Vérifier si les tables RH existent déjà
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name IN ('branches', 'departments', 'positions', 'employees');
    
    IF table_count > 0 THEN
        RAISE NOTICE '⚠️ Attention: % tables RH déjà présentes. Arrêt pour éviter les conflits.', table_count;
        RAISE EXCEPTION 'Tables RH déjà existantes. Utilisez le script d''audit pour vérifier l''état.';
    END IF;
    
    -- Vérifier qu'il y a au moins un utilisateur
    SELECT COUNT(*) INTO user_count FROM users WHERE is_active = true;
    
    IF user_count = 0 THEN
        RAISE EXCEPTION 'Aucun utilisateur actif trouvé. Créez d''abord un utilisateur administrateur.';
    END IF;
    
    RAISE NOTICE '✅ Vérifications préliminaires réussies. Début de la migration RH...';
END $$;

-- ============================================================================
-- ÉTAPE 2: CRÉATION DES TABLES RH DE BASE
-- ============================================================================

-- Table BRANCHES (Filiales)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    
    -- Localisation
    country TEXT NOT NULL DEFAULT 'SN',
    region TEXT,
    city TEXT NOT NULL,
    address TEXT,
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    
    -- Hiérarchie
    parent_branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    is_headquarters BOOLEAN DEFAULT false,
    level INTEGER DEFAULT 1,
    
    -- Gestion
    director_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    hr_manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Configuration
    timezone TEXT DEFAULT 'Africa/Dakar',
    currency_code TEXT DEFAULT 'XOF',
    language_code TEXT DEFAULT 'fr',
    
    -- Capacité et budget
    employee_capacity INTEGER DEFAULT 100,
    annual_budget NUMERIC(15, 2),
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'closed', 'planning')),
    opening_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Table DEPARTMENTS
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    
    -- Rattachement
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    parent_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    level INTEGER DEFAULT 1,
    
    -- Gestion
    manager_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Budget
    annual_budget NUMERIC(12, 2),
    cost_center_code TEXT,
    
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

-- Table POSITIONS
CREATE TABLE IF NOT EXISTS public.positions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    
    -- Rattachement
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    
    -- Niveau et hiérarchie
    level INTEGER NOT NULL DEFAULT 1,
    seniority_min_years INTEGER DEFAULT 0,
    reports_to_position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL,
    
    -- Salaire
    salary_min NUMERIC(10, 2),
    salary_max NUMERIC(10, 2),
    salary_currency TEXT DEFAULT 'XOF',
    salary_frequency TEXT DEFAULT 'monthly' 
        CHECK (salary_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
    
    -- Compétences et formation
    required_skills JSONB DEFAULT '[]',
    required_education TEXT,
    required_experience_years INTEGER DEFAULT 0,
    
    -- Type d'emploi
    employment_type TEXT DEFAULT 'full_time' 
        CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'consultant')),
    remote_work_allowed BOOLEAN DEFAULT false,
    
    -- Capacité
    status TEXT NOT NULL DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'archived', 'draft')),
    max_headcount INTEGER DEFAULT 1,
    current_headcount INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(department_id, code),
    CHECK (salary_min <= salary_max),
    CHECK (current_headcount <= max_headcount)
);

-- Table EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Référence utilisateur
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Identification
    employee_number TEXT NOT NULL UNIQUE,
    badge_number TEXT UNIQUE,
    
    -- Informations personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    preferred_name TEXT,
    gender TEXT CHECK (gender IN ('M', 'F', 'Other', 'Prefer_not_to_say')),
    date_of_birth DATE,
    nationality TEXT,
    
    -- Contact
    personal_email TEXT,
    work_email TEXT UNIQUE,
    personal_phone TEXT,
    work_phone TEXT,
    emergency_contact JSONB DEFAULT '{}',
    address JSONB DEFAULT '{}',
    
    -- Rattachement organisationnel
    branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE RESTRICT,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
    position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE RESTRICT,
    manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    
    -- Emploi
    hire_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    probation_end_date DATE,
    
    -- Statut
    employment_status TEXT NOT NULL DEFAULT 'active'
        CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave', 'suspended')),
    employment_type TEXT NOT NULL DEFAULT 'full_time'
        CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern', 'consultant')),
    
    -- Salaire
    current_salary NUMERIC(10, 2),
    salary_currency TEXT DEFAULT 'XOF',
    
    -- Performance
    performance_score NUMERIC(3, 2) DEFAULT 0,
    skills JSONB DEFAULT '[]',
    
    -- Congés
    vacation_days_total INTEGER DEFAULT 30,
    vacation_days_used INTEGER DEFAULT 0,
    
    -- Préférences
    work_preferences JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'Africa/Dakar',
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id),
    
    -- Contraintes
    CHECK (vacation_days_used <= vacation_days_total),
    CHECK (performance_score >= 0 AND performance_score <= 5),
    CHECK (hire_date <= start_date),
    CHECK (end_date IS NULL OR end_date >= start_date)
);

-- ============================================================================
-- ÉTAPE 3: CRÉATION DES INDEX POUR PERFORMANCES
-- ============================================================================

-- Index pour branches
CREATE INDEX IF NOT EXISTS idx_branches_parent ON public.branches(parent_branch_id);
CREATE INDEX IF NOT EXISTS idx_branches_country ON public.branches(country);
CREATE INDEX IF NOT EXISTS idx_branches_status ON public.branches(status);

-- Index pour departments
CREATE INDEX IF NOT EXISTS idx_departments_branch ON public.departments(branch_id);
CREATE INDEX IF NOT EXISTS idx_departments_parent ON public.departments(parent_department_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager ON public.departments(manager_id);

-- Index pour positions
CREATE INDEX IF NOT EXISTS idx_positions_department ON public.positions(department_id);
CREATE INDEX IF NOT EXISTS idx_positions_branch ON public.positions(branch_id);
CREATE INDEX IF NOT EXISTS idx_positions_level ON public.positions(level);

-- Index pour employees
CREATE INDEX IF NOT EXISTS idx_employees_user ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_branch ON public.employees(branch_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON public.employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager ON public.employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_number ON public.employees(employee_number);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(employment_status);

-- ============================================================================
-- ÉTAPE 4: ACTIVATION DU ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Politiques de base pour super admins
CREATE POLICY "Super admins full access branches" ON public.branches
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admins full access departments" ON public.departments
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admins full access positions" ON public.positions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );

CREATE POLICY "Super admins full access employees" ON public.employees
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('super_admin', 'admin')
        )
    );

-- ============================================================================
-- ÉTAPE 5: INSERTION DES DONNÉES INITIALES
-- ============================================================================

-- Insérer le siège social
INSERT INTO public.branches (name, code, country, city, is_headquarters, level, status)
VALUES ('Siège Social', 'HQ', 'SN', 'Dakar', true, 1, 'active')
ON CONFLICT (code) DO NOTHING;

-- Insérer les départements de base
INSERT INTO public.departments (name, code, branch_id, description)
SELECT 
    'Direction Générale', 
    'DG', 
    b.id,
    'Direction générale de l''entreprise'
FROM branches b 
WHERE b.code = 'HQ'
ON CONFLICT (branch_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, branch_id, description)
SELECT 
    'Ressources Humaines', 
    'RH', 
    b.id,
    'Gestion des ressources humaines'
FROM branches b 
WHERE b.code = 'HQ'
ON CONFLICT (branch_id, code) DO NOTHING;

INSERT INTO public.departments (name, code, branch_id, description)
SELECT 
    'Technologies', 
    'IT', 
    b.id,
    'Département informatique et technologies'
FROM branches b 
WHERE b.code = 'HQ'
ON CONFLICT (branch_id, code) DO NOTHING;

-- ============================================================================
-- ÉTAPE 6: VALIDATION FINALE
-- ============================================================================

DO $$
DECLARE
    branches_count INTEGER;
    departments_count INTEGER;
    positions_count INTEGER;
    employees_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO branches_count FROM branches;
    SELECT COUNT(*) INTO departments_count FROM departments;
    SELECT COUNT(*) INTO positions_count FROM positions;
    SELECT COUNT(*) INTO employees_count FROM employees;
    
    RAISE NOTICE '✅ Migration RH terminée avec succès!';
    RAISE NOTICE '📊 Statistiques:';
    RAISE NOTICE '   - Branches créées: %', branches_count;
    RAISE NOTICE '   - Départements créés: %', departments_count;
    RAISE NOTICE '   - Positions créées: %', positions_count;
    RAISE NOTICE '   - Employés créés: %', employees_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Prochaines étapes:';
    RAISE NOTICE '   1. Créer des positions dans chaque département';
    RAISE NOTICE '   2. Ajouter des employés';
    RAISE NOTICE '   3. Tester l''interface RH dans l''application';
    RAISE NOTICE '   4. Configurer les rôles et permissions avancés';
END $$;

-- ============================================================================
-- COMMENTAIRES FINAUX
-- ============================================================================

COMMENT ON TABLE public.branches IS 'Branches et filiales avec support international';
COMMENT ON TABLE public.departments IS 'Départements organisationnels par branche';
COMMENT ON TABLE public.positions IS 'Postes avec grilles salariales adaptées';
COMMENT ON TABLE public.employees IS 'Employés avec données complètes et liens hiérarchiques';

-- Fin de la migration RH sécurisée
-- Version: 1.0
-- Date: 4 juillet 2025

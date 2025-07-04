# 🔧 RAPPORT 2: ÉTAT TECHNIQUE & BASE DE DONNÉES
*Architecture Backend - Supabase PostgreSQL Complete*

---

## 🗄️ **ARCHITECTURE BASE DE DONNÉES**

### Configuration Supabase
```env
VITE_SUPABASE_URL=https://qlqgyrfqiflnqknbtycw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (client Supabase configuré)
```

### Base URL & Environment
```bash
Development: localhost:8080
Production: SaaS deployment via Vite
Database: PostgreSQL 15 (Supabase)
Storage: Supabase Storage (files, images)
Auth: Supabase Auth (JWT + RLS)
```

---

## 📊 **SCHÉMA COMPLET DES TABLES**

### 1. Core Business Tables

#### **Companies** (Clients)
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Users** (Utilisateurs système)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'client' 
        CHECK (role IN ('admin', 'client', 'hr_manager', 'hr_specialist')),
    company_id UUID REFERENCES companies(id),
    
    -- Profile
    avatar_url TEXT,
    phone TEXT,
    preferences JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Business Module Tables

#### **Devis** (Quotes)
```sql
CREATE TABLE devis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT UNIQUE NOT NULL,           -- DEV-2025-001
    company_id UUID NOT NULL REFERENCES companies(id),
    object TEXT NOT NULL,                  -- Objet du devis
    amount NUMERIC(12, 2) NOT NULL,        -- Montant total
    status TEXT DEFAULT 'draft' 
        CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    validated_at TIMESTAMPTZ,
    
    -- Content
    notes TEXT,
    rejection_reason TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Devis Items**
```sql
CREATE TABLE devis_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    devis_id UUID NOT NULL REFERENCES devis(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    order_index INTEGER DEFAULT 0
);
```

#### **Invoices** (Factures)
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT UNIQUE NOT NULL,           -- INV-2025-001
    devis_id UUID REFERENCES devis(id),    -- Lien avec devis
    company_id UUID NOT NULL REFERENCES companies(id),
    
    -- Amounts
    amount NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(10, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL,
    
    -- Status & Dates
    status TEXT DEFAULT 'draft' 
        CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Payment
    payment_method TEXT,
    payment_reference TEXT,
    payment_amount NUMERIC(12, 2),
    
    -- Content
    notes TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

#### **Invoice Items**
```sql
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    order_index INTEGER DEFAULT 0
);
```

### 3. Support Module Tables

#### **Ticket Categories**
```sql
CREATE TABLE ticket_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    icon TEXT DEFAULT 'MessageSquare',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Tickets**
```sql
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    number TEXT UNIQUE NOT NULL,           -- TIC-2025-001
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Classification
    category_id UUID REFERENCES ticket_categories(id),
    priority TEXT DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' 
        CHECK (status IN ('open', 'in_progress', 'waiting', 'closed')),
    
    -- Relations
    company_id UUID NOT NULL REFERENCES companies(id),
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    
    -- Dates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    estimated_resolution TIMESTAMPTZ,
    actual_resolution TIMESTAMPTZ
);
```

#### **Ticket Messages**
```sql
CREATE TABLE ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,     -- Message interne équipe
    attachments JSONB DEFAULT '[]',        -- Fichiers joints
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. HR Module Tables (COMPLET)

#### **Branches** (Filiales/Bureaux)
```sql
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,             -- HQ-DKR, SUC-THI
    description TEXT,
    
    -- Location
    country TEXT NOT NULL DEFAULT 'SN',
    region TEXT,
    city TEXT NOT NULL,
    address JSONB,                         -- Adresse structurée
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    
    -- Hierarchy
    parent_branch_id UUID REFERENCES branches(id),
    is_headquarters BOOLEAN DEFAULT false,
    level INTEGER DEFAULT 1,
    
    -- Management
    director_id UUID REFERENCES users(id),
    hr_manager_id UUID REFERENCES users(id),
    
    -- Configuration
    timezone TEXT DEFAULT 'Africa/Dakar',
    currency_code TEXT DEFAULT 'XOF',
    language_code TEXT DEFAULT 'fr',
    local_regulations JSONB DEFAULT '{}',
    
    -- Metrics
    employee_capacity INTEGER DEFAULT 100,
    annual_budget NUMERIC(15, 2),
    cost_center_code TEXT,
    
    -- Status
    status TEXT DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'closed', 'planning')),
    opening_date DATE,
    closing_date DATE,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

#### **Departments** (Départements)
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,                    -- IT, HR, SALES
    description TEXT,
    
    -- Hierarchy
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    parent_department_id UUID REFERENCES departments(id),
    level INTEGER DEFAULT 1,
    
    -- Management
    manager_id UUID REFERENCES users(id),
    assistant_manager_id UUID REFERENCES users(id),
    
    -- Budget & Objectives
    annual_budget NUMERIC(12, 2),
    cost_center_code TEXT,
    objectives JSONB DEFAULT '[]',
    kpis JSONB DEFAULT '{}',
    
    -- Configuration
    max_employees INTEGER DEFAULT 50,
    overtime_allowed BOOLEAN DEFAULT true,
    remote_work_allowed BOOLEAN DEFAULT false,
    
    -- Status
    status TEXT DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'restructuring', 'merged')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Positions** (Postes)
```sql
CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    code TEXT NOT NULL,                    -- DEV-SR, MKT-MG
    description TEXT,
    
    -- Relations
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id),
    
    -- Job Details
    level INTEGER NOT NULL,                -- 1=Junior, 5=Director
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    salary_currency TEXT DEFAULT 'XOF',
    
    -- Requirements
    required_skills JSONB DEFAULT '[]',
    required_experience_years INTEGER DEFAULT 0,
    required_education TEXT,
    required_languages JSONB DEFAULT '[]',
    
    -- Employment
    employment_type TEXT DEFAULT 'full_time' 
        CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
    remote_work_allowed BOOLEAN DEFAULT false,
    travel_required BOOLEAN DEFAULT false,
    
    -- Reporting
    reports_to_position_id UUID REFERENCES positions(id),
    number_of_reports INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'active' 
        CHECK (status IN ('active', 'inactive', 'filled', 'recruiting')),
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Employees** (Employés) - Table Centrale
```sql
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_number TEXT UNIQUE NOT NULL,  -- EMP001, EMP002
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    middle_name TEXT,
    preferred_name TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('M', 'F', 'Other', 'Prefer not to say')),
    nationality TEXT DEFAULT 'SN',
    
    -- Contact Information
    work_email TEXT UNIQUE,
    personal_email TEXT,
    personal_phone TEXT,
    work_phone TEXT,
    emergency_contact JSONB,               -- Contact d'urgence structuré
    address JSONB,                         -- Adresse structurée
    
    -- Employment Details
    company_id UUID REFERENCES companies(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    position_id UUID NOT NULL REFERENCES positions(id),
    manager_id UUID REFERENCES employees(id), -- Auto-référence hiérarchique
    
    -- Employment Status
    hire_date DATE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    employment_status TEXT DEFAULT 'active' 
        CHECK (employment_status IN ('active', 'inactive', 'terminated', 'on_leave', 'retired')),
    employment_type TEXT DEFAULT 'full_time' 
        CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
    
    -- Compensation
    current_salary NUMERIC(12, 2),
    salary_currency TEXT DEFAULT 'XOF',
    salary_frequency TEXT DEFAULT 'monthly' 
        CHECK (salary_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'yearly')),
    
    -- Performance & Development
    performance_score NUMERIC(3, 1),       -- Note /5.0
    last_review_date DATE,
    next_review_date DATE,
    career_level INTEGER DEFAULT 1,
    skills JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    
    -- Time Off & Benefits
    vacation_days_total INTEGER DEFAULT 25,
    vacation_days_used INTEGER DEFAULT 0,
    sick_days_total INTEGER DEFAULT 10,
    
    -- Documents & Compliance
    work_permit_required BOOLEAN DEFAULT false,
    work_permit_expiry DATE,
    contract_type TEXT,
    probation_end_date DATE,
    
    -- System Integration
    user_id UUID REFERENCES users(id),     -- Lien avec compte utilisateur
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);
```

---

## 🔐 **SÉCURITÉ & PERMISSIONS (RLS)**

### Row Level Security Configuration

#### Politiques Actuelles (Post-Fix)
```sql
-- Employees: Lecture pour tous authentifiés
CREATE POLICY "employees_read_authenticated" ON employees
    FOR SELECT TO authenticated USING (true);

-- Employees: Écriture pour admins/RH uniquement
CREATE POLICY "employees_write_admin_hr" ON employees
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'hr_manager', 'hr_specialist')
        )
    );

-- Branches, Departments, Positions: Lecture libre
CREATE POLICY "branches_read_all" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "departments_read_all" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "positions_read_all" ON positions FOR SELECT TO authenticated USING (true);
```

#### Rôles Système
```typescript
enum UserRole {
  ADMIN = 'admin',                 // Accès total
  HR_MANAGER = 'hr_manager',       // Gestion RH complète
  HR_SPECIALIST = 'hr_specialist', // RH opérationnel
  CLIENT = 'client'                // Client standard
}
```

---

## 📈 **ÉTAT DES DONNÉES**

### Données de Test Actuelles

#### Branches (3 branches)
- **Siège Social** (Dakar) - HQ-DKR
- **Succursale Thiès** - SUC-THI  
- **Bureau Saint-Louis** - BUR-STL

#### Départements (5 départements)
- **Développement** (DEV) - 500K budget
- **Marketing** (MKT) - 300K budget
- **Support Client** (SUP) - 200K budget
- **Ressources Humaines** (RH) - 150K budget
- **Finance** (FIN) - 250K budget

#### Positions (10 positions)
- Développeur Senior/Junior, Tech Lead
- Manager/Chargé Marketing
- Manager/Agent Support
- Manager RH, Comptable

#### Employés (8 employés complets)
- **EMP001** Jean Dupont - Développeur Senior
- **EMP002** Marie Martin - Manager Marketing
- **EMP003** Pierre Durand - Agent Support
- **EMP004** Claire Moreau - Développeur Senior
- **EMP005** Thomas Bernard - Chargé Marketing
- **EMP006** Aminata Diallo - Développeur Junior
- **EMP007** Mamadou Fall - Manager RH
- **EMP008** Fatou Ndoye - Comptable

---

## 🔄 **MIGRATIONS & VERSIONING**

### Système de Migrations
```bash
supabase/migrations/
├── 20250703200000_create_hr_foundation.sql (✅ APPLIQUÉ)
├── 20250703210000_add_rls_policies.sql (✅ APPLIQUÉ)
└── 20250703220000_insert_test_data.sql (✅ APPLIQUÉ)
```

### Scripts d'Import
- **SCRIPT_UNIQUE_COMPLET_RH_CORRIGE.sql** (✅ Données complètes)
- **CORRECTION_URGENTE_RLS_RECURSION.sql** (✅ Fix RLS)
- **VERIFICATION_POST_CORRECTION_RLS.sql** (✅ Tests validation)

---

## ⚡ **PERFORMANCE & OPTIMISATION**

### Index Database
```sql
-- Index critiques pour performance
CREATE INDEX idx_employees_branch_dept ON employees(branch_id, department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_number ON employees(employee_number);

-- Index pour recherche
CREATE INDEX idx_employees_name ON employees USING gin(to_tsvector('french', first_name || ' ' || last_name));
```

### Cache Strategy
- **React Query** pour cache client (5min TTL)
- **Supabase Realtime** pour updates live
- **Local Storage** pour preferences utilisateur

---

## 🔌 **INTÉGRATIONS EXTERNES**

### Payment System
```env
# DExchange (Paiement mobile Sénégal)
DEXCHANGE_API_URL_PRODUCTION=https://api-m.dexchange.sn/api/v1
DEXCHANGE_API_URL_SANDBOX=https://api-s.dexchange.sn/api/v1
DEXCHANGE_ENVIRONMENT=sandbox
```

### File Storage
- **Supabase Storage** pour fichiers (CVs, contrats, factures)
- **Bucket structure**: company-files, employee-docs, invoices

### Email System
- **Transactional**: Via Supabase Edge Functions
- **Templates**: Relances, notifications, rapports

---

## 🚀 **TECHNOLOGIES STACK**

### Frontend
```json
{
  "framework": "React 18 + TypeScript",
  "ui": "shadcn/ui + TailwindCSS",
  "state": "React Query + Context",
  "animations": "Framer Motion",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts + React Flow",
  "build": "Vite"
}
```

### Backend
```json
{
  "database": "PostgreSQL 15 (Supabase)",
  "auth": "Supabase Auth + JWT",
  "storage": "Supabase Storage",
  "realtime": "Supabase Realtime",
  "functions": "Supabase Edge Functions"
}
```

---

**✅ Base de données prête pour production avec 8 employés de test et système RLS sécurisé**

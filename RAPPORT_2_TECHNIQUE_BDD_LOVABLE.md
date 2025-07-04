# 🔧 RAPPORT 2: ÉTAT TECHNIQUE & BASE DE DONNÉES
## Destiné à Lovable Dev - Ingénieur IA

---

## 📊 **ARCHITECTURE DE LA BASE DE DONNÉES**

### **🏗️ Structure des Tables (Supabase PostgreSQL)**

#### **Table: `branches` (Succursales)**
```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL UNIQUE,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(2) NOT NULL,
  address JSONB,
  phone VARCHAR(20),
  email VARCHAR(255),
  timezone VARCHAR(50) DEFAULT 'UTC',
  is_headquarters BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **Table: `departments` (Départements)**
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  branch_id UUID REFERENCES branches(id),
  annual_budget DECIMAL(15,2),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **Table: `positions` (Postes)**
```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  branch_id UUID REFERENCES branches(id),
  level INTEGER,
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  required_skills JSONB,
  employment_type VARCHAR(20),
  remote_work_allowed BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### **Table: `employees` (Employés) - CENTRALE**
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  preferred_name VARCHAR(100),
  
  -- Contact
  work_email VARCHAR(255) UNIQUE,
  personal_email VARCHAR(255),
  personal_phone VARCHAR(20),
  work_phone VARCHAR(20),
  
  -- Relations organisationnelles
  branch_id UUID REFERENCES branches(id),
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  manager_id UUID REFERENCES employees(id),
  
  -- Emploi
  hire_date DATE,
  start_date DATE,
  employment_status VARCHAR(20) DEFAULT 'active',
  employment_type VARCHAR(20),
  
  -- Salaire & Performance
  current_salary DECIMAL(12,2),
  salary_currency VARCHAR(3) DEFAULT 'XOF',
  performance_score DECIMAL(3,2),
  
  -- Congés
  vacation_days_total INTEGER DEFAULT 25,
  vacation_days_used INTEGER DEFAULT 0,
  
  -- Données personnelles (JSONB pour flexibilité)
  emergency_contact JSONB,
  address JSONB,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 🔐 **CONFIGURATION RLS (Row Level Security)**

### **Politiques Actuelles (Corrigées)**
```sql
-- Employés: Lecture pour tous authentifiés
CREATE POLICY "employees_read_authenticated" ON employees
    FOR SELECT TO authenticated USING (true);

-- Employés: Écriture pour admins/RH seulement
CREATE POLICY "employees_write_admin_hr" ON employees
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'hr_manager', 'hr_specialist')
        )
    );

-- Tables référentielles: Lecture libre pour authentifiés
CREATE POLICY "branches_read_all" ON branches FOR SELECT TO authenticated USING (true);
CREATE POLICY "departments_read_all" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "positions_read_all" ON positions FOR SELECT TO authenticated USING (true);
```

### **Statut RLS**
- ✅ **RLS activé** sur toutes les tables
- ✅ **Politiques simples** et non-récursives
- ✅ **Sécurité par rôles** (admin, hr_manager, hr_specialist)

---

## 📈 **DONNÉES ACTUELLES (État réel)**

### **Statistiques Globales**
- **Branches**: 3 (Dakar HQ, Thiès, Saint-Louis)
- **Départements**: 5 (Dev, Marketing, Support, RH, Finance)
- **Positions**: 10 (différents niveaux hiérarchiques)
- **Employés**: 8 (données test réalistes)

### **Données Employés Existantes**
| Matricule | Nom | Département | Poste | Statut | Salaire |
|-----------|-----|-------------|--------|--------|---------|
| EMP001 | Jean Dupont | Développement | Développeur Senior | Active | 550,000 XOF |
| EMP002 | Marie Martin | Marketing | Manager Marketing | Active | 580,000 XOF |
| EMP003 | Pierre Durand | Support Client | Agent Support | Active | 280,000 XOF |
| EMP004 | Claire Moreau | Développement | Développeur Senior | Active | 520,000 XOF |
| EMP005 | Thomas Bernard | Marketing | Chargé Marketing | Active | 320,000 XOF |
| EMP006 | Aminata Diallo | Développement | Développeur Junior | Active | 280,000 XOF |
| EMP007 | Mamadou Fall | Ressources Humaines | Manager RH | Active | 620,000 XOF |
| EMP008 | Fatou Ndoye | Finance | Comptable | Active | 380,000 XOF |

### **Relations Hiérarchiques**
- **Marie Martin** supervise Thomas Bernard
- **Jean Dupont** supervise Aminata Diallo
- Structure managériale fonctionnelle

---

## 🔌 **ENDPOINTS API (Supabase REST)**

### **Configuration Supabase**
- **URL Projet**: `https://qlqgyrfqiflnqknbtycw.supabase.co`
- **API URL**: `https://qlqgyrfqiflnqknbtycw.supabase.co/rest/v1/`
- **Clé Publique**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (à confirmer)

### **Endpoints Employés**
```typescript
// Base URL
const API_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co/rest/v1';

// GET - Liste tous les employés
GET /employees
Headers: {
  'apikey': 'YOUR_SUPABASE_ANON_KEY',
  'Authorization': 'Bearer USER_JWT_TOKEN'
}

// GET - Employé avec relations
GET /employees?select=*,branches(*),departments(*),positions(*),manager:employees!manager_id(first_name,last_name)

// GET - Employé spécifique
GET /employees?id=eq.{employee_id}&select=*

// POST - Créer employé
POST /employees
Body: {
  "employee_number": "EMP009",
  "first_name": "Nouveau",
  "last_name": "Employé",
  "work_email": "nouveau@example.com",
  "branch_id": "uuid",
  "department_id": "uuid",
  "position_id": "uuid"
}

// PATCH - Modifier employé
PATCH /employees?id=eq.{employee_id}
Body: { "field": "new_value" }

// DELETE - Soft delete (recommandé)
PATCH /employees?id=eq.{employee_id}
Body: { "employment_status": "inactive" }
```

### **Endpoints Référentiels**
```typescript
// Branches
GET /branches?select=*&order=name

// Départements avec branche
GET /departments?select=*,branches(name)&order=name

// Positions avec département et branche
GET /positions?select=*,departments(name),branches(name)&order=title

// Hiérarchie complète
GET /employees?select=id,first_name,last_name,subordinates:employees!manager_id(id,first_name,last_name)
```

### **Requêtes Complexes (Exemples)**
```typescript
// Employés d'un département
GET /employees?department_id=eq.{dept_id}&select=*,positions(title)

// Recherche par nom
GET /employees?or=(first_name.ilike.*search*,last_name.ilike.*search*)

// Statistiques par département
GET /departments?select=id,name,employees(count)

// Employés avec manager
GET /employees?select=*,manager:employees!manager_id(first_name,last_name)&employment_status=eq.active
```

---

## 🛠️ **CONFIGURATION TECHNIQUE**

### **Client Supabase (TypeScript)**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const supabaseKey = 'your_supabase_anon_key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});
```

### **Types TypeScript (Générés)**
```typescript
export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string;
          employee_number: string;
          first_name: string;
          last_name: string;
          work_email: string | null;
          branch_id: string | null;
          department_id: string | null;
          position_id: string | null;
          manager_id: string | null;
          employment_status: string;
          current_salary: number | null;
          performance_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          employee_number: string;
          first_name: string;
          last_name: string;
          work_email?: string | null;
          // ... autres champs optionnels
        };
        Update: {
          first_name?: string;
          last_name?: string;
          // ... champs modifiables
        };
      };
      // ... autres tables
    };
  };
}
```

---

## 🔒 **AUTHENTIFICATION & AUTORISATION**

### **Rôles Utilisateurs**
```typescript
// Rôles définis dans auth.users.raw_user_meta_data
type UserRole = 'admin' | 'hr_manager' | 'hr_specialist' | 'employee' | 'manager';

// Permissions par rôle
const permissions = {
  admin: ['read', 'write', 'delete', 'manage_all'],
  hr_manager: ['read', 'write', 'manage_hr'],
  hr_specialist: ['read', 'write_limited', 'manage_employees'],
  manager: ['read', 'write_team'],
  employee: ['read_self']
};
```

### **Middleware Auth (Exemple)**
```typescript
export const withAuth = (requiredRole?: UserRole) => {
  return async (req, res, next) => {
    const user = await supabase.auth.getUser();
    const userRole = user.data.user?.user_metadata?.role;
    
    if (!user.data.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    if (requiredRole && !hasPermission(userRole, requiredRole)) {
      return res.status(403).json({ error: 'Permission refusée' });
    }
    
    next();
  };
};
```

---

## 📊 **PERFORMANCE & OPTIMISATION**

### **Index Base de Données**
```sql
-- Index pour recherches fréquentes
CREATE INDEX idx_employees_email ON employees(work_email);
CREATE INDEX idx_employees_number ON employees(employee_number);
CREATE INDEX idx_employees_status ON employees(employment_status);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(manager_id);

-- Index composés pour requêtes complexes
CREATE INDEX idx_employees_active_dept ON employees(department_id, employment_status) 
WHERE employment_status = 'active';
```

### **Stratégies de Cache**
- **React Query** pour cache côté client (5 min TTL)
- **Supabase Realtime** pour mises à jour live
- **Pagination** avec curseur pour grandes listes
- **Prefetch** des données liées (départements, positions)

---

## 🚨 **POINTS D'ATTENTION**

### **Sécurité**
- ✅ **RLS activé** et testé
- ⚠️ **Clés API** à sécuriser en production
- ✅ **Validation côté serveur** via Supabase
- ⚠️ **Données sensibles** (salaires) à protéger finement

### **Données**
- ✅ **8 employés test** disponibles
- ✅ **Relations** correctement définies
- ⚠️ **Photos employés** à implémenter (Supabase Storage)
- ⚠️ **Historique** des modifications à prévoir

### **Performance**
- ✅ **Base optimisée** pour < 1000 employés
- ⚠️ **Pagination** requise si croissance
- ⚠️ **Cache** à implémenter pour requêtes lourdes

---

## 🎯 **RECOMMANDATIONS TECHNIQUES**

### **Immédiat**
1. **Générer types TypeScript** depuis Supabase CLI
2. **Implémenter cache** avec React Query
3. **Ajouter validations** Zod/Yup côté client
4. **Configurer realtime** pour mises à jour live

### **Court terme**
1. **Upload photos** avec Supabase Storage
2. **Audit trail** pour traçabilité
3. **Soft delete** au lieu de suppression
4. **Backup automatique** des données

### **Moyen terme**
1. **Migration** vers Edge Functions si logique complexe
2. **Monitoring** performances avec Supabase Analytics
3. **Tests** automatisés API et base
4. **Documentation** API avec OpenAPI

---

**🔧 Base de données opérationnelle et optimisée pour développement immédiat !**

# 🔌 RAPPORT 3: ENDPOINTS & INTÉGRATION API
*Guide Technique Complet - Supabase API + Services*

---

## 🌐 **CONFIGURATION SUPABASE**

### URLs & Clés d'Accès
```typescript
// Configuration client (src/lib/supabaseClient.ts)
const supabaseUrl = "https://qlqgyrfqiflnqknbtycw.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Headers requis pour toutes les requêtes
const headers = {
  'apikey': supabaseAnonKey,
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
}
```

### Authentification
```typescript
// Login endpoint
POST https://qlqgyrfqiflnqknbtycw.supabase.co/auth/v1/token?grant_type=password
Body: { email, password }

// User profile
GET https://qlqgyrfqiflnqknbtycw.supabase.co/auth/v1/user
Header: Authorization: Bearer {jwt_token}
```

---

## 📊 **ENDPOINTS PRINCIPAUX**

### 1. Business Module APIs

#### **Companies (Clients)**
```typescript
// GET tous les clients
GET /rest/v1/companies?select=*

// GET client par ID
GET /rest/v1/companies?id=eq.{id}&select=*

// POST nouveau client
POST /rest/v1/companies
Body: {
  name: string,
  email: string,
  phone?: string,
  address?: string
}

// PATCH update client
PATCH /rest/v1/companies?id=eq.{id}
Body: { name, email, phone, address }

// DELETE client
DELETE /rest/v1/companies?id=eq.{id}
```

#### **Devis (Quotes)**
```typescript
// GET tous les devis avec relations
GET /rest/v1/devis?select=*,companies(name),devis_items(*)

// GET devis par statut
GET /rest/v1/devis?status=eq.approved&select=*,companies(name)

// POST nouveau devis
POST /rest/v1/devis
Body: {
  number: string,
  company_id: UUID,
  object: string,
  amount: number,
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired',
  valid_until: Date,
  notes?: string
}

// POST items du devis
POST /rest/v1/devis_items
Body: {
  devis_id: UUID,
  description: string,
  quantity: number,
  unit_price: number,
  total: number
}

// PATCH statut devis
PATCH /rest/v1/devis?id=eq.{id}
Body: { status: 'approved', validated_at: Date }
```

#### **Invoices (Factures)**
```typescript
// GET factures avec filtres
GET /rest/v1/invoices?select=*,companies(name),invoice_items(*)&status=in.(sent,paid)

// GET factures en retard
GET /rest/v1/invoices?status=eq.overdue&select=*,companies(name)

// POST nouvelle facture
POST /rest/v1/invoices
Body: {
  number: string,
  company_id: UUID,
  devis_id?: UUID,
  amount: number,
  tax_amount: number,
  total_amount: number,
  issue_date: Date,
  due_date: Date,
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
}

// PATCH paiement facture
PATCH /rest/v1/invoices?id=eq.{id}
Body: {
  status: 'paid',
  paid_date: Date,
  payment_method: string,
  payment_reference: string,
  payment_amount: number
}
```

### 2. Support Module APIs

#### **Tickets**
```typescript
// GET tickets avec filtres avancés
GET /rest/v1/tickets?select=*,companies(name),ticket_categories(name,color),users!created_by(first_name,last_name)&status=neq.closed

// GET tickets par priorité
GET /rest/v1/tickets?priority=eq.high&select=*,companies(name)

// POST nouveau ticket
POST /rest/v1/tickets
Body: {
  number: string,
  subject: string,
  description: string,
  category_id: UUID,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  company_id: UUID,
  created_by: UUID
}

// PATCH assignation ticket
PATCH /rest/v1/tickets?id=eq.{id}
Body: {
  assigned_to: UUID,
  status: 'in_progress',
  estimated_resolution: Date
}

// POST message ticket
POST /rest/v1/ticket_messages
Body: {
  ticket_id: UUID,
  user_id: UUID,
  message: string,
  is_internal: boolean,
  attachments: Array<{url: string, name: string, type: string}>
}
```

#### **Ticket Categories**
```typescript
// GET toutes les catégories actives
GET /rest/v1/ticket_categories?is_active=eq.true&select=*

// POST nouvelle catégorie
POST /rest/v1/ticket_categories
Body: {
  name: string,
  description: string,
  color: string,
  icon: string
}
```

### 3. HR Module APIs (COMPLET)

#### **Branches (Filiales)**
```typescript
// GET toutes les branches avec hiérarchie
GET /rest/v1/branches?select=*,parent_branch:branches!parent_branch_id(name),director:users!director_id(first_name,last_name)

// GET branches actives par pays
GET /rest/v1/branches?status=eq.active&country=eq.SN&select=*

// POST nouvelle branche
POST /rest/v1/branches
Body: {
  name: string,
  code: string,
  country: string,
  city: string,
  address: object,
  phone: string,
  email: string,
  parent_branch_id?: UUID,
  is_headquarters: boolean,
  annual_budget?: number,
  status: 'active' | 'inactive' | 'closed' | 'planning'
}
```

#### **Departments (Départements)**
```typescript
// GET départements avec relations
GET /rest/v1/departments?select=*,branches(name,city),manager:users!manager_id(first_name,last_name),employees_count:employees(count)

// GET départements par branche
GET /rest/v1/departments?branch_id=eq.{id}&status=eq.active&select=*

// POST nouveau département
POST /rest/v1/departments
Body: {
  name: string,
  code: string,
  description: string,
  branch_id: UUID,
  manager_id?: UUID,
  annual_budget?: number,
  max_employees: number,
  remote_work_allowed: boolean
}
```

#### **Positions (Postes)**
```typescript
// GET positions avec critères
GET /rest/v1/positions?select=*,departments(name),branches(name),employees_count:employees(count)

// GET positions disponibles
GET /rest/v1/positions?status=eq.active&select=*,departments(name,code),branches(name)

// POST nouvelle position
POST /rest/v1/positions
Body: {
  title: string,
  code: string,
  description: string,
  department_id: UUID,
  branch_id: UUID,
  level: number,
  salary_min: number,
  salary_max: number,
  required_skills: Array<string>,
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship',
  remote_work_allowed: boolean
}
```

#### **Employees (Employés) - API Centrale**
```typescript
// GET employés avec relations complètes
GET /rest/v1/employees?select=*,branches(name,city),departments(name,code),positions(title),manager:employees!manager_id(first_name,last_name,employee_number)

// GET employés par département
GET /rest/v1/employees?department_id=eq.{id}&employment_status=eq.active&select=*,positions(title)

// GET employés par manager
GET /rest/v1/employees?manager_id=eq.{id}&select=*,positions(title),departments(name)

// GET recherche employés
GET /rest/v1/employees?or=(first_name.ilike.*{query}*,last_name.ilike.*{query}*,employee_number.ilike.*{query}*)&select=*

// POST nouvel employé
POST /rest/v1/employees
Body: {
  employee_number: string,
  first_name: string,
  last_name: string,
  work_email: string,
  personal_phone: string,
  branch_id: UUID,
  department_id: UUID,
  position_id: UUID,
  manager_id?: UUID,
  hire_date: Date,
  start_date: Date,
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'retired',
  employment_type: 'full_time' | 'part_time' | 'contract' | 'internship',
  current_salary: number,
  performance_score?: number,
  vacation_days_total: number,
  address: object,
  emergency_contact: object
}

// PATCH mise à jour employé
PATCH /rest/v1/employees?id=eq.{id}
Body: {
  performance_score: number,
  current_salary: number,
  department_id: UUID,
  position_id: UUID,
  employment_status: string
}

// GET statistiques RH
GET /rest/v1/employees?select=count()&employment_status=eq.active
GET /rest/v1/employees?select=avg(performance_score)&employment_status=eq.active
GET /rest/v1/employees?select=department_id,count()&group=department_id
```

---

## 🔍 **REQUÊTES COMPLEXES & ANALYTICS**

### 1. Dashboard Business
```typescript
// Métriques CA mensuel
GET /rest/v1/invoices?status=eq.paid&issue_date=gte.{startMonth}&issue_date=lt.{endMonth}&select=sum(total_amount)

// Pipeline devis par statut
GET /rest/v1/devis?select=status,count(),sum(amount)&group=status

// Top clients par chiffre d'affaires
GET /rest/v1/invoices?status=eq.paid&select=company_id,companies(name),sum(total_amount)&group=company_id,companies(name)&order=sum.desc&limit=10

// Tickets par priorité et statut
GET /rest/v1/tickets?select=priority,status,count()&group=priority,status
```

### 2. Analytics RH
```typescript
// Répartition employés par département
GET /rest/v1/employees?employment_status=eq.active&select=department_id,departments(name),count()&group=department_id,departments(name)

// Performance moyenne par département
GET /rest/v1/employees?employment_status=eq.active&select=department_id,departments(name),avg(performance_score)&group=department_id,departments(name)

// Évolution des embauches par mois
GET /rest/v1/employees?select=date_trunc('month',hire_date),count()&group=date_trunc('month',hire_date)&order=date_trunc

// Employés par manager avec effectifs
GET /rest/v1/employees?manager_id=not.is.null&select=manager_id,manager:employees!manager_id(first_name,last_name),count()&group=manager_id,manager(first_name,last_name)

// Pyramide des âges
GET /rest/v1/employees?employment_status=eq.active&select=extract(year,age(date_of_birth)),count()&group=extract(year,age(date_of_birth))
```

### 3. Recherche Avancée
```typescript
// Recherche globale employés
GET /rest/v1/employees?or=(first_name.ilike.%{query}%,last_name.ilike.%{query}%,employee_number.ilike.%{query}%,work_email.ilike.%{query}%)&select=*,departments(name),positions(title)

// Filtres combinés employés
GET /rest/v1/employees?department_id=in.({dept_ids})&employment_status=eq.active&performance_score=gte.4&select=*,positions(title)

// Recherche avec pagination
GET /rest/v1/employees?offset={offset}&limit={limit}&order=last_name.asc&select=*,departments(name)
```

---

## 🚀 **SERVICES API TYPESCRIPT**

### 1. Structure des Services
```typescript
// src/services/api.ts - Structure actuelle
export const employeeSupabaseApi = {
  async list(params?: EmployeeListParams): Promise<Employee[]> {
    // GET avec filtres, pagination, recherche
  },
  
  async getById(id: string): Promise<Employee> {
    // GET employé par ID avec relations
  },
  
  async create(data: CreateEmployeeData): Promise<Employee> {
    // POST nouvel employé avec validation
  },
  
  async update(id: string, data: UpdateEmployeeData): Promise<Employee> {
    // PATCH mise à jour employé
  },
  
  async delete(id: string): Promise<void> {
    // DELETE employé (soft delete recommandé)
  },
  
  async search(query: string): Promise<Employee[]> {
    // Recherche textuelle avancée
  },
  
  async getByDepartment(departmentId: string): Promise<Employee[]> {
    // Employés par département
  },
  
  async getDirectReports(managerId: string): Promise<Employee[]> {
    // Subordonnés directs d'un manager
  }
};
```

### 2. Types TypeScript
```typescript
// Types de base
interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  work_email: string;
  employment_status: EmploymentStatus;
  employment_type: EmploymentType;
  current_salary?: number;
  performance_score?: number;
  hire_date: string;
  
  // Relations
  branch_id: string;
  department_id: string;
  position_id: string;
  manager_id?: string;
  
  // Relations peuplées
  branch?: Branch;
  department?: Department;
  position?: Position;
  manager?: Employee;
  
  // Métadonnées
  created_at: string;
  updated_at: string;
}

// Paramètres de requête
interface EmployeeListParams {
  offset?: number;
  limit?: number;
  department_id?: string;
  branch_id?: string;
  employment_status?: EmploymentStatus;
  search?: string;
  order_by?: 'last_name' | 'hire_date' | 'performance_score';
  order_direction?: 'asc' | 'desc';
}
```

### 3. Gestion d'Erreurs
```typescript
// Wrapper avec gestion d'erreurs
export const apiCall = async <T>(
  operation: () => Promise<T>
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (error.code === '42P17') {
      throw new Error('Erreur de sécurité RLS détectée');
    }
    if (error.code === 'PGRST116') {
      throw new Error('Données non trouvées');
    }
    throw new Error(`Erreur API: ${error.message}`);
  }
};
```

---

## 🔐 **AUTHENTIFICATION & SÉCURITÉ**

### Headers d'Authentification
```typescript
// Token JWT dans headers
const authHeaders = {
  'Authorization': `Bearer ${session.access_token}`,
  'apikey': supabaseAnonKey,
  'Content-Type': 'application/json'
};

// Récupération du token utilisateur
const { data: session } = await supabase.auth.getSession();
const userToken = session?.access_token;
```

### Politiques RLS (Row Level Security)
```sql
-- Exemples de politiques actives
CREATE POLICY "employees_read_authenticated" ON employees
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "employees_write_admin_hr" ON employees
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' IN ('admin', 'hr_manager', 'hr_specialist')
    );
```

---

## 📊 **REAL-TIME & SUBSCRIPTIONS**

### Supabase Realtime
```typescript
// Écoute des changements employés en temps réel
const subscription = supabase
  .from('employees')
  .on('*', (payload) => {
    console.log('Changement employé:', payload);
    // Actualiser cache React Query
    queryClient.invalidateQueries(['employees']);
  })
  .subscribe();

// Subscription aux tickets pour support live
const ticketSubscription = supabase
  .from('tickets')
  .on('INSERT', (payload) => {
    // Nouveau ticket créé
    showNotification('Nouveau ticket créé');
  })
  .subscribe();
```

---

## 📦 **INTÉGRATIONS TIERCES**

### DExchange (Paiements)
```typescript
// Endpoint paiement DExchange
POST https://api-s.dexchange.sn/api/v1/payment/init
Headers: {
  'Authorization': 'Bearer {DEXCHANGE_API_KEY}',
  'Content-Type': 'application/json'
}
Body: {
  amount: number,
  currency: 'XOF',
  callback_url: 'https://votresite.com/api/payment/callback',
  return_url: 'https://votresite.com/payment/success',
  customer_email: string,
  order_id: string
}
```

### File Upload (Supabase Storage)
```typescript
// Upload CV/documents employés
const { data, error } = await supabase.storage
  .from('employee-docs')
  .upload(`${employeeId}/cv.pdf`, file);

// URL publique temporaire
const { data: { publicUrl } } = supabase.storage
  .from('employee-docs')
  .getPublicUrl(`${employeeId}/cv.pdf`);
```

---

## 🔧 **OUTILS DE DÉVELOPPEMENT**

### Testing Endpoints
```bash
# Test authentification
curl -X POST https://qlqgyrfqiflnqknbtycw.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'

# Test GET employés
curl -X GET "https://qlqgyrfqiflnqknbtycw.supabase.co/rest/v1/employees?select=*" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Monitoring & Logs
- **Supabase Dashboard**: Logs en temps réel
- **React Query DevTools**: Cache et network
- **Browser DevTools**: Network et performance

---

**🎯 APIs prêtes pour intégration complète avec Lovable Dev**

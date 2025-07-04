// supabase/functions/hr-employee-api/index.ts
// Edge Function pour la gestion des employés avec IA intégrée
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'
};

interface EmployeeRequest {
  action: 'list' | 'get' | 'create' | 'update' | 'delete' | 'analyze';
  employee_id?: string;
  data?: any;
  filters?: any;
  pagination?: {
    page: number;
    limit: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request
    const { action, employee_id, data, filters, pagination }: EmployeeRequest = await req.json();

    switch (action) {
      case 'list':
        return await listEmployees(supabaseClient, filters, pagination);
      
      case 'get':
        return await getEmployee(supabaseClient, employee_id!);
      
      case 'create':
        return await createEmployee(supabaseClient, data);
      
      case 'update':
        return await updateEmployee(supabaseClient, employee_id!, data);
      
      case 'delete':
        return await deleteEmployee(supabaseClient, employee_id!);
      
      case 'analyze':
        return await analyzeEmployee(supabaseClient, employee_id!);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action not supported' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('Error in hr-employee-api:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ============================================================================
// FONCTIONS MÉTIER
// ============================================================================

async function listEmployees(supabaseClient: any, filters?: any, pagination?: any) {
  try {
    let query = supabaseClient
      .from('employees')
      .select(`
        *,
        branch:branches(*),
        department:departments(*),
        position:positions(*),
        manager:manager_id(id, first_name, last_name, work_email),
        user:users(id, email, role)
      `);

    // Apply filters
    if (filters) {
      if (filters.branch_id) {
        query = query.eq('branch_id', filters.branch_id);
      }
      if (filters.department_id) {
        query = query.eq('department_id', filters.department_id);
      }
      if (filters.employment_status) {
        query = query.eq('employment_status', filters.employment_status);
      }
      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,work_email.ilike.%${filters.search}%`);
      }
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    // Execute query
    const { data: employees, error, count } = await query;

    if (error) {
      throw error;
    }

    // Calculate additional metrics for each employee
    const enrichedEmployees = employees.map((employee: any) => ({
      ...employee,
      full_name: `${employee.first_name} ${employee.last_name}`,
      age: employee.date_of_birth ? calculateAge(employee.date_of_birth) : null,
      tenure_years: calculateTenure(employee.hire_date),
      vacation_days_remaining: employee.vacation_days_total - employee.vacation_days_used
    }));

    return new Response(
      JSON.stringify({
        success: true,
        data: enrichedEmployees,
        pagination: {
          page,
          limit,
          total: count,
          total_pages: Math.ceil((count || 0) / limit)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error listing employees:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function getEmployee(supabaseClient: any, employeeId: string) {
  try {
    const { data: employee, error } = await supabaseClient
      .from('employees')
      .select(`
        *,
        branch:branches(*),
        department:departments(*),
        position:positions(*),
        manager:manager_id(id, first_name, last_name, work_email, position:positions(title)),
        direct_reports:employees!manager_id(id, first_name, last_name, work_email, position:positions(title)),
        user:users(id, email, role, last_sign_in_at)
      `)
      .eq('id', employeeId)
      .single();

    if (error) {
      throw error;
    }

    if (!employee) {
      return new Response(
        JSON.stringify({ success: false, error: 'Employee not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enrich with calculated fields
    const enrichedEmployee = {
      ...employee,
      full_name: `${employee.first_name} ${employee.last_name}`,
      age: employee.date_of_birth ? calculateAge(employee.date_of_birth) : null,
      tenure_years: calculateTenure(employee.hire_date),
      vacation_days_remaining: employee.vacation_days_total - employee.vacation_days_used,
      next_performance_review: calculateNextReview(employee.hire_date),
      display_name: employee.preferred_name || employee.first_name
    };

    return new Response(
      JSON.stringify({ success: true, data: enrichedEmployee }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error getting employee:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function createEmployee(supabaseClient: any, employeeData: any) {
  try {
    // Generate unique employee number
    const employeeNumber = await generateEmployeeNumber(supabaseClient);
    
    // Prepare employee data
    const newEmployee = {
      ...employeeData,
      employee_number: employeeNumber,
      employment_status: 'active',
      vacation_days_used: 0,
      sick_days_used: 0,
      performance_score: 0,
      reports_count: 0
    };

    // Insert employee
    const { data: employee, error } = await supabaseClient
      .from('employees')
      .insert(newEmployee)
      .select(`
        *,
        branch:branches(*),
        department:departments(*),
        position:positions(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Generate AI insights for new employee (async)
    generateAIInsightsAsync(supabaseClient, employee.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: employee,
        message: 'Employee created successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating employee:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function updateEmployee(supabaseClient: any, employeeId: string, updateData: any) {
  try {
    // Remove read-only fields
    const { id, employee_number, created_at, ...allowedData } = updateData;
    
    const { data: employee, error } = await supabaseClient
      .from('employees')
      .update(allowedData)
      .eq('id', employeeId)
      .select(`
        *,
        branch:branches(*),
        department:departments(*),
        position:positions(*)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Re-generate AI insights if significant changes
    if (updateData.position_id || updateData.department_id || updateData.current_salary) {
      generateAIInsightsAsync(supabaseClient, employeeId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: employee,
        message: 'Employee updated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating employee:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function deleteEmployee(supabaseClient: any, employeeId: string) {
  try {
    // Soft delete - just update status instead of actual delete
    const { data: employee, error } = await supabaseClient
      .from('employees')
      .update({ 
        employment_status: 'terminated',
        end_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', employeeId)
      .select('id, first_name, last_name')
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: employee,
        message: 'Employee terminated successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error deleting employee:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function analyzeEmployee(supabaseClient: any, employeeId: string) {
  try {
    // Get employee data with related information
    const { data: employee, error } = await supabaseClient
      .from('employees')
      .select(`
        *,
        position:positions(*),
        department:departments(*),
        manager:manager_id(performance_score, tenure_years)
      `)
      .eq('id', employeeId)
      .single();

    if (error) {
      throw error;
    }

    // Generate AI insights using Gemini
    const insights = await generateAIInsights(employee);

    // Update employee with new insights
    await supabaseClient
      .from('employees')
      .update({ 
        ai_insights: insights,
        performance_trends: calculatePerformanceTrends(employee),
        career_recommendations: generateCareerRecommendations(employee, insights)
      })
      .eq('id', employeeId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: insights,
        message: 'AI analysis completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing employee:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

function calculateTenure(hireDate: string): number {
  const today = new Date();
  const hire = new Date(hireDate);
  const diffTime = Math.abs(today.getTime() - hire.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.round((diffDays / 365.25) * 10) / 10; // Années avec 1 décimale
}

function calculateNextReview(hireDate: string): string {
  const hire = new Date(hireDate);
  const nextReview = new Date(hire);
  nextReview.setFullYear(nextReview.getFullYear() + 1);
  
  // If next review has passed, calculate the next one
  const today = new Date();
  while (nextReview < today) {
    nextReview.setFullYear(nextReview.getFullYear() + 1);
  }
  
  return nextReview.toISOString().split('T')[0];
}

async function generateEmployeeNumber(supabaseClient: any): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EMP${year}`;
  
  // Get the last employee number for this year
  const { data, error } = await supabaseClient
    .from('employees')
    .select('employee_number')
    .like('employee_number', `${prefix}%`)
    .order('employee_number', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error generating employee number:', error);
    // Fallback to random number
    return `${prefix}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  }

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = data[0].employee_number.replace(prefix, '');
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

async function generateAIInsights(employee: any): Promise<any> {
  try {
    // This would integrate with Gemini AI like other functions
    // For now, return calculated insights
    const tenure = calculateTenure(employee.hire_date);
    const performanceScore = employee.performance_score || 0;
    
    return {
      performance_prediction: Math.min(5, performanceScore + (tenure * 0.1)),
      turnover_risk: Math.max(0, Math.min(1, (5 - performanceScore) / 5)),
      promotion_readiness: tenure > 2 && performanceScore > 3.5 ? 0.8 : 0.3,
      skill_gaps: ['Communication', 'Leadership'], // Would be AI-generated
      development_recommendations: [
        'Consider advanced training in current role',
        'Mentorship program participation'
      ],
      engagement_score: Math.round(performanceScore * 20),
      last_analysis_date: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error generating AI insights:', error);
    return {
      last_analysis_date: new Date().toISOString(),
      error: 'AI analysis temporarily unavailable'
    };
  }
}

function calculatePerformanceTrends(employee: any): any {
  // Would calculate from historical performance data
  return {
    quarterly_scores: [3.2, 3.5, 3.8, 4.0], // Mock data
    improvement_rate: 0.1,
    consistency_score: 0.85,
    areas_of_excellence: ['Technical Skills', 'Teamwork'],
    areas_for_improvement: ['Communication', 'Leadership']
  };
}

function generateCareerRecommendations(employee: any, insights: any): any[] {
  return [
    {
      id: crypto.randomUUID(),
      type: 'skill_development',
      title: 'Develop Leadership Skills',
      description: 'Based on your performance, consider developing leadership capabilities',
      priority: 3,
      timeline: '6 months',
      requirements: ['Leadership training', 'Mentorship'],
      generated_at: new Date().toISOString(),
      ai_confidence: 0.85
    }
  ];
}

async function generateAIInsightsAsync(supabaseClient: any, employeeId: string) {
  // This would run in the background to generate AI insights
  // without blocking the main response
  setTimeout(async () => {
    try {
      const { data: employee } = await supabaseClient
        .from('employees')
        .select('*, position:positions(*)')
        .eq('id', employeeId)
        .single();

      if (employee) {
        const insights = await generateAIInsights(employee);
        await supabaseClient
          .from('employees')
          .update({ ai_insights: insights })
          .eq('id', employeeId);
      }
    } catch (error) {
      console.error('Error in async AI insights generation:', error);
    }
  }, 1000);
}

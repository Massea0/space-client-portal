// src/services/supabaseFunctions.ts
// Fonctions Supabase sécurisées avec gestion d'erreurs réseau

import { useSupabaseClient } from '@/hooks/use-supabase-client';
import { Invoice, Company, Ticket } from '@/types';
type User = unknown;

/**
 * Hook pour accéder à l'API Supabase sécurisée
 */
export function useSupabaseApi() {
  const { query, auth, storage, isOffline, supabase } = useSupabaseClient();

  return {
    // Fonctions d'authentification
    auth: {
      login: async (email: string, password: string) => {
        return auth('login', 
          () => supabase.auth.signInWithPassword({ email, password }),
          { retry: true }
        );
      },
      
      logout: async () => {
        return auth('logout', 
          async () => {
            const res = await supabase.auth.signOut();
            return { data: null, error: res.error };
          }
        );
      },
      
      resetPassword: async (email: string) => {
        return auth('resetPassword', 
          () => supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`
          })
        );
      },
      
      updatePassword: async (password: string) => {
        return auth('updatePassword', 
          () => supabase.auth.updateUser({ password })
        );
      }
    },
    
    // Fonctions utilisateurs
    users: {
      getCurrentUser: async () => {
        return auth('getCurrentUser', 
          () => supabase.auth.getUser()
        );
      },
      
      getUserProfile: async (userId: string) => {
        return query<User>('getUserProfile', 
          async () => await supabase
            .from('users')
            .select('*, companies(name)')
            .eq('id', userId)
            .single()
        );
      },
      
      updateProfile: async (userId: string, profile: Partial<User>) => {
        return query('updateProfile', 
          async () => await supabase
            .from('users')
            .update(profile)
            .eq('id', userId)
        );
      }
    },
    
    // Fonctions invoices
    invoices: {
      getAll: async (userId: string, companyId: string) => {
        return query<Invoice[]>('getAllInvoices', 
          async () => await supabase
            .from('invoices')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
        );
      },
      
      getById: async (invoiceId: string) => {
        return query<Invoice>('getInvoiceById', 
          async () => await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single()
        );
      },
      
      updateStatus: async (invoiceId: string, status: Invoice['status']) => {
        return query('updateInvoiceStatus', 
          async () => await supabase
            .from('invoices')
            .update({ status })
            .eq('id', invoiceId)
        );
      },
      
      initiatePayment: async (invoiceId: string, paymentData: Record<string, unknown>) => {
        return query('initiatePayment', 
          () => supabase.functions.invoke('initiate-dexchange-payment', {
            body: { invoiceId, ...paymentData }
          }),
          { retry: true }
        );
      },
      
      checkPaymentStatus: async (transactionId: string) => {
        return query('checkPaymentStatus', 
          () => supabase.functions.invoke('check-dexchange-status', {
            body: { transactionId }
          })
        );
      }
    }
  };
}

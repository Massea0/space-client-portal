// src/services/hr/employeeApi.ts
// Service API pour la gestion des employés - Connecté à Supabase

import { employeeSupabaseApi } from './supabaseApi';

// Réexporter l'API Supabase comme API principale
export const employeeApi = employeeSupabaseApi;

export default employeeApi;
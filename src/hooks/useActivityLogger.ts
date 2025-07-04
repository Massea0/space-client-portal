// Hook personnalisé pour le logging d'activité client
// Mission 3: Support Prédictif et Tickets Proactifs
// Fichier: /src/hooks/useActivityLogger.ts

import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'

type ActivityType = 
  | 'page_view'
  | 'faq_search' 
  | 'form_error'
  | 'service_access'
  | 'login_attempt'
  | 'login_failed'
  | 'support_search'
  | 'ticket_view'
  | 'error_occurred'
  | 'timeout_occurred'

interface ActivityDetails {
  page?: string
  action?: string
  query?: string
  error_message?: string
  form_type?: string
  duration?: number
  [key: string]: any
}

export const useActivityLogger = () => {
  const { user } = useAuth()

  const logActivity = async (
    activityType: ActivityType, 
    details: ActivityDetails = {}
  ) => {
    // Ne log que si l'utilisateur est authentifié
    if (!user) {
      console.log('⚠️ Pas de logging - utilisateur non authentifié')
      return
    }

    try {
      console.log(`📊 Logging activité: ${activityType}`, details)

      const { data, error } = await supabase.functions.invoke('log-client-activity', {
        body: {
          activity_type: activityType,
          details: {
            ...details,
            url: window.location.href,
            referrer: document.referrer,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            user_agent_info: navigator.userAgent.slice(0, 200) // Limité pour éviter les gros payloads
          }
        }
      })

      if (error) {
        console.error('❌ Erreur logging activité:', error)
      } else {
        console.log('✅ Activité loggée:', data)
      }

      return { data, error }
    } catch (err) {
      console.error('❌ Exception logging activité:', err)
      return { data: null, error: err }
    }
  }

  // Helpers pour les activités communes
  const logPageView = (page: string, additionalDetails?: ActivityDetails) => {
    return logActivity('page_view', { page, ...additionalDetails })
  }

  const logSearch = (query: string, context: string = 'general') => {
    return logActivity('faq_search', { query, context })
  }

  const logFormError = (formType: string, errorMessage: string, additionalDetails?: ActivityDetails) => {
    return logActivity('form_error', { 
      form_type: formType, 
      error_message: errorMessage,
      ...additionalDetails 
    })
  }

  const logServiceAccess = (serviceName: string, action: string = 'access') => {
    return logActivity('service_access', { 
      service_name: serviceName, 
      action 
    })
  }

  const logTicketView = (ticketId: string, action: string = 'view') => {
    return logActivity('ticket_view', { 
      ticket_id: ticketId, 
      action 
    })
  }

  const logError = (errorType: string, errorMessage: string, context?: string) => {
    return logActivity('error_occurred', { 
      error_type: errorType,
      error_message: errorMessage,
      context
    })
  }

  const logTimeout = (operation: string, duration: number) => {
    return logActivity('timeout_occurred', { 
      operation,
      duration_ms: duration
    })
  }

  return {
    logActivity,
    logPageView,
    logSearch,
    logFormError,
    logServiceAccess,
    logTicketView,
    logError,
    logTimeout
  }
}

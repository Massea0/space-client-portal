// Composant pour afficher les tickets proactifs suggérés
// Mission 3: Support Prédictif et Tickets Proactifs
// Fichier: /src/components/support/ProactiveTickets.tsx

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Bot, 
  Clock,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/context/AuthContext'

interface ProactiveTicket {
  id: string
  subject: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  created_at: string
  proactive_analysis: {
    confidence: number
    reasoning: string
    trigger_reason: string
    created_by_ai: boolean
  }
}

export const ProactiveTickets: React.FC = () => {
  const { user } = useAuth()
  const [proactiveTickets, setProactiveTickets] = useState<ProactiveTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [processingTickets, setProcessingTickets] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProactiveTickets()
  }, [user])

  const fetchProactiveTickets = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Récupération des tickets proactifs en statut 'suggested'
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('is_proactive', true)
        .eq('status', 'suggested')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Erreur récupération tickets proactifs:', error)
        return
      }

      setProactiveTickets(data || [])
    } catch (err) {
      console.error('❌ Exception récupération tickets proactifs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptTicket = async (ticketId: string) => {
    setProcessingTickets(prev => new Set(prev).add(ticketId))

    try {
      // Mise à jour du statut du ticket en 'open'
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'open',
          accepted_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) {
        console.error('❌ Erreur acceptation ticket:', error)
        return
      }

      console.log('✅ Ticket proactif accepté:', ticketId)
      
      // Retrait du ticket de la liste
      setProactiveTickets(prev => prev.filter(ticket => ticket.id !== ticketId))
      
    } catch (err) {
      console.error('❌ Exception acceptation ticket:', err)
    } finally {
      setProcessingTickets(prev => {
        const newSet = new Set(prev)
        newSet.delete(ticketId)
        return newSet
      })
    }
  }

  const handleRejectTicket = async (ticketId: string) => {
    setProcessingTickets(prev => new Set(prev).add(ticketId))

    try {
      // Mise à jour du statut du ticket en 'rejected'
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'rejected',
          rejected_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) {
        console.error('❌ Erreur rejet ticket:', error)
        return
      }

      console.log('✅ Ticket proactif rejeté:', ticketId)
      
      // Retrait du ticket de la liste
      setProactiveTickets(prev => prev.filter(ticket => ticket.id !== ticketId))
      
    } catch (err) {
      console.error('❌ Exception rejet ticket:', err)
    } finally {
      setProcessingTickets(prev => {
        const newSet = new Set(prev)
        newSet.delete(ticketId)
        return newSet
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'default'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': 
      case 'high': 
        return <AlertTriangle className="h-4 w-4" />
      default: 
        return <Clock className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Bot className="h-8 w-8 animate-pulse mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Analyse des problèmes potentiels...</p>
        </div>
      </div>
    )
  }

  if (proactiveTickets.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Excellent ! Aucun problème détecté par notre système d'analyse prédictive.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Assistance Proactive</h3>
        <Badge variant="outline" className="text-xs">
          {proactiveTickets.length} suggestion{proactiveTickets.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {proactiveTickets.map((ticket) => (
        <Card key={ticket.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base">{ticket.subject}</CardTitle>
                  <Badge 
                    variant={getPriorityColor(ticket.priority)}
                    className="text-xs"
                  >
                    {getPriorityIcon(ticket.priority)}
                    {ticket.priority}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Détecté le {formatTimestamp(ticket.created_at)} • 
                  Confiance IA: {Math.round(ticket.proactive_analysis.confidence * 100)}% •
                  Catégorie: {ticket.category}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {ticket.description}
              </p>

              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Analyse IA:
                </p>
                <p className="text-xs text-muted-foreground">
                  {ticket.proactive_analysis.reasoning}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptTicket(ticket.id)}
                  disabled={processingTickets.has(ticket.id)}
                  className="flex-1"
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Ouvrir ce ticket
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectTicket(ticket.id)}
                  disabled={processingTickets.has(ticket.id)}
                  className="flex-1"
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Pas maintenant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <Alert>
        <Bot className="h-4 w-4" />
        <AlertDescription>
          Ces suggestions sont générées automatiquement par notre IA en analysant votre activité. 
          Notre équipe se tient prête à vous aider !
        </AlertDescription>
      </Alert>
    </div>
  )
}

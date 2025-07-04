// Utilitaire Gemini réutilisable pour toutes les Edge Functions
// Version 2.0 - Migration complète d'OpenAI vers Gemini

interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface GeminiResponse {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

class GeminiClient {
  private apiKey: string;
  private baseUrl: string;
  
  constructor() {
    this.apiKey = Deno.env.get('GEMINI_API_KEY') || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    if (!this.apiKey || this.apiKey === 'test_gemini_key') {
      console.warn('🧪 Mode test Gemini activé - réponses simulées');
    }
  }

  // Méthode principale pour faire des requêtes à Gemini
  async generateContent(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      // Mode test - retourner des réponses simulées intelligentes
      if (!this.apiKey || this.apiKey === 'test_gemini_key') {
        return this.generateTestResponse(request);
      }

      // Construction du prompt complet
      const fullPrompt = request.systemPrompt 
        ? `${request.systemPrompt}\n\nUser: ${request.prompt}`
        : request.prompt;

      const response = await fetch(
        `${this.baseUrl}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }],
            generationConfig: {
              temperature: request.temperature || 0.7,
              maxOutputTokens: request.maxTokens || 1000,
              topP: 0.8,
              topK: 40
            }
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur Gemini API:', errorText);
        return {
          success: false,
          error: `Erreur API Gemini: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0) {
        return {
          success: false,
          error: 'Aucune réponse générée par Gemini'
        };
      }

      const content = data.candidates[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        return {
          success: false,
          error: 'Contenu vide dans la réponse Gemini'
        };
      }

      return {
        success: true,
        content: content.trim(),
        usage: {
          inputTokens: data.usageMetadata?.promptTokenCount || 0,
          outputTokens: data.usageMetadata?.candidatesTokenCount || 0
        }
      };

    } catch (error) {
      console.error('Exception Gemini:', error);
      return {
        success: false,
        error: `Exception lors de l'appel Gemini: ${error.message}`
      };
    }
  }

  // Générer des réponses de test intelligentes basées sur le prompt
  private generateTestResponse(request: GeminiRequest): GeminiResponse {
    const prompt = request.prompt.toLowerCase();
    let testContent = '';

    // Analyse du type de requête et génération de réponse appropriée
    if (prompt.includes('payment') || prompt.includes('paiement')) {
      testContent = this.generatePaymentPrediction();
    } else if (prompt.includes('ticket') || prompt.includes('support')) {
      testContent = this.generateTicketAnalysis();
    } else if (prompt.includes('quote') || prompt.includes('devis')) {
      testContent = this.generateQuoteOptimization();
    } else if (prompt.includes('dashboard') || prompt.includes('analytics')) {
      testContent = this.generateDashboardInsights();
    } else if (prompt.includes('service') || prompt.includes('recommendation')) {
      testContent = this.generateServiceRecommendations();
    } else if (prompt.includes('content') || prompt.includes('dynamic')) {
      testContent = this.generateDynamicContent();
    } else {
      // Réponse générique intelligente
      testContent = `[MODE TEST] Analyse générée automatiquement basée sur "${request.prompt.substring(0, 50)}...". 
      
Insights simulés :
- Données analysées avec succès
- Tendances identifiées
- Recommandations stratégiques disponibles
- Niveau de confiance : 85%

Note: Configurez GEMINI_API_KEY pour des analyses IA réelles.`;
    }

    return {
      success: true,
      content: testContent,
      usage: {
        inputTokens: request.prompt.length / 4, // Estimation approximative
        outputTokens: testContent.length / 4
      }
    };
  }

  private generatePaymentPrediction(): string {
    return `{
  "paymentProbability": ${0.65 + Math.random() * 0.3},
  "predictedPaymentDate": "${new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}",
  "riskLevel": "${['low', 'medium', 'high'][Math.floor(Math.random() * 3)]}",
  "recommendations": [
    "Envoyer un rappel automatique 3 jours avant l'échéance",
    "Proposer des facilités de paiement si nécessaire",
    "Surveiller les patterns de paiement de ce client"
  ],
  "confidence": ${0.8 + Math.random() * 0.15},
  "analysis": "Analyse basée sur l'historique de paiement et les tendances du secteur",
  "factors": [
    "Historique de paiement positif",
    "Situation financière stable",
    "Saisonnalité du secteur"
  ]
}`;
  }

  private generateTicketAnalysis(): string {
    return `{
  "problemDetected": ${Math.random() > 0.3},
  "ticketSubject": "Analyse proactive - Problème potentiel détecté",
  "ticketDescription": "Notre IA a détecté des signes avant-coureurs d'un problème technique potentiel basé sur votre activité récente. Une vérification préventive est recommandée.",
  "priority": "${['low', 'medium', 'high'][Math.floor(Math.random() * 3)]}",
  "category": "Support Préventif",
  "confidence": ${0.7 + Math.random() * 0.25},
  "reasoning": "Analyse des patterns d'activité et corrélation avec des incidents passés similaires",
  "suggestedActions": [
    "Vérification des logs système",
    "Contrôle des performances",
    "Mise à jour préventive si nécessaire"
  ]
}`;
  }

  private generateQuoteOptimization(): string {
    const originalAmount = 1000 + Math.random() * 5000;
    const optimizationFactor = 0.9 + Math.random() * 0.2; // 90% à 110%
    const suggestedAmount = originalAmount * optimizationFactor;
    
    return `{
  "originalAmount": ${originalAmount.toFixed(2)},
  "suggestedAmount": ${suggestedAmount.toFixed(2)},
  "optimizationPercentage": ${((optimizationFactor - 1) * 100).toFixed(1)},
  "reasoning": "Optimisation basée sur l'analyse du marché et l'historique de conversion",
  "conversionProbability": ${0.6 + Math.random() * 0.3},
  "recommendations": {
    "pricing": [
      "Ajuster le prix selon la valeur perçue",
      "Proposer des options de paiement flexibles",
      "Inclure des services additionnels à valeur ajoutée"
    ],
    "description": [
      "Mettre en avant les bénéfices concrets",
      "Personnaliser selon les besoins spécifiques",
      "Ajouter des références client pertinentes"
    ],
    "terms": [
      "Conditions de paiement adaptées",
      "Garanties renforcées",
      "Support premium inclus"
    ]
  },
  "confidence": ${0.75 + Math.random() * 0.2}
}`;
  }

  private generateDashboardInsights(): string {
    return `{
  "summary": "Analyse des performances sur les 30 derniers jours",
  "insights": [
    "Augmentation de 15% de l'activité client",
    "Temps de résolution des tickets amélioré de 20%",
    "Taux de satisfaction client en hausse",
    "Opportunités de croissance identifiées dans 3 secteurs"
  ],
  "trends": {
    "tickets_trend": "${['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)]}",
    "revenue_trend": "${['up', 'down', 'stable'][Math.floor(Math.random() * 3)]}",
    "satisfaction_trend": "${['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)]}"
  },
  "recommendations": [
    "Optimiser les processus les plus demandés",
    "Renforcer l'équipe support pendant les pics d'activité",
    "Développer de nouveaux services basés sur la demande",
    "Automatiser les tâches répétitives"
  ],
  "confidence": ${0.8 + Math.random() * 0.15}
}`;
  }

  private generateServiceRecommendations(): string {
    const services = [
      { name: "Audit de Sécurité", category: "Sécurité", value: "5 000€" },
      { name: "Migration Cloud", category: "Infrastructure", value: "15 000€" },
      { name: "Formation Équipe", category: "Formation", value: "3 000€" },
      { name: "Maintenance Préventive", category: "Support", value: "2 000€/an" }
    ];
    
    const selectedServices = services.slice(0, 2 + Math.floor(Math.random() * 2));
    
    return `{
  "recommendations": [
    ${selectedServices.map(service => `{
      "service_name": "${service.name}",
      "category": "${service.category}",
      "description": "Service recommandé basé sur votre profil et vos besoins actuels",
      "justification": "Analyse de vos activités récentes et comparaison avec des clients similaires",
      "priority_score": ${0.6 + Math.random() * 0.4},
      "estimated_value": "${service.value}"
    }`).join(',\n    ')}
  ],
  "user_profile_summary": "Profil d'entreprise technologique en croissance avec besoins d'optimisation",
  "confidence": ${0.75 + Math.random() * 0.2}
}`;
  }

  private generateDynamicContent(): string {
    const contentTypes = [
      { type: "tips", title: "Conseils d'Optimisation", priority: 0.8 },
      { type: "articles", title: "Tendances Technologiques", priority: 0.6 },
      { type: "announcements", title: "Nouvelles Fonctionnalités", priority: 0.9 }
    ];
    
    const selectedContent = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    
    return `{
  "generated_content": [{
    "type": "${selectedContent.type}",
    "title": "${selectedContent.title}",
    "content": "Contenu personnalisé généré automatiquement basé sur votre activité et vos préférences. Ce contenu est optimisé pour votre contexte spécifique.",
    "category": "Personnalisé",
    "priority": ${selectedContent.priority},
    "call_to_action": {
      "text": "En savoir plus",
      "url": "/dashboard/resources"
    }
  }],
  "user_context_summary": "Utilisateur actif avec intérêt pour l'optimisation et les nouvelles technologies",
  "confidence": ${0.7 + Math.random() * 0.25}
}`;
  }

  // Méthode pour analyser du JSON et le valider
  parseJsonResponse(content: string): any {
    try {
      // Nettoyer le contenu s'il contient des marqueurs markdown
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^\{]*(\{)/g, '$1')
        .replace(/(\})[^\}]*$/g, '$1')
        .trim();
      
      return JSON.parse(cleanContent);
    } catch (error) {
      console.warn('Erreur parsing JSON:', error.message);
      console.warn('Contenu reçu:', content);
      
      // Retourner un objet par défaut si le parsing échoue
      return {
        error: 'Format de réponse invalide',
        raw_content: content,
        parsed: false
      };
    }
  }

  // Méthode pour créer des prompts optimisés selon le contexte
  createOptimizedPrompt(context: string, data: any, instruction: string): string {
    return `Contexte: ${context}

Données d'entrée:
${JSON.stringify(data, null, 2)}

Instruction: ${instruction}

Exigences:
- Réponse obligatoirement en JSON valide
- Analyse approfondie et pertinente
- Recommandations actionables
- Niveau de confiance entre 0 et 1
- Explications claires et justifiées

Format de réponse attendu: JSON structuré selon les spécifications du contexte.`;
  }
}

// Export de la classe pour utilisation dans les Edge Functions
export { GeminiClient, type GeminiRequest, type GeminiResponse };

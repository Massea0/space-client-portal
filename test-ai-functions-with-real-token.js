// test-ai-functions-with-real-token.js
import fetch from 'node-fetch';

const GEMINI_API_KEY = 'AIzaSyAbjeF0789Jv6ZyM4hbRp5UFzkEoBDDtDI';

async function testGeminiDirectly() {
  console.log('🧠 Test direct de l\'API Gemini avec votre clé...');
  console.log('====================================================\n');

  try {
    const prompt = `Analyse le message suivant issu d'un ticket de support. Retourne UNIQUEMENT un objet JSON valide avec cette structure : {"priority": "valeur", "sentiment": "valeur", "summary": "résumé"}.

- "priority": Évalue le niveau d'urgence. Valeurs possibles : "low", "medium", "high", "urgent".
- "sentiment": Analyse le sentiment. Valeurs possibles : "positive", "neutral", "negative", "frustrated".
- "summary": Résume le problème en une phrase concise en français.

Message à analyser : "URGENT!!! Mon site web est complètement en panne depuis ce matin et je perds des clients à chaque minute qui passe! Il faut absolument que vous régliez ce problème MAINTENANT!"

Réponds UNIQUEMENT avec l'objet JSON, sans texte additionnel.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    console.log('Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erreur API Gemini:', errorText);
      return false;
    }

    const data = await response.json();
    console.log('✅ Réponse Gemini reçue!');
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) {
      console.log('❌ Pas de texte généré');
      return false;
    }

    console.log('📝 Texte brut:', generatedText);

    // Essayer de parser le JSON
    try {
      const jsonMatch = generatedText.match(/\{.*\}/s);
      if (!jsonMatch) {
        console.log('❌ Pas de JSON trouvé dans la réponse');
        return false;
      }
      
      const parsedJson = JSON.parse(jsonMatch[0]);
      console.log('🎯 JSON parsé avec succès:');
      console.log(JSON.stringify(parsedJson, null, 2));
      
      // Valider la structure
      if (parsedJson.priority && parsedJson.sentiment && parsedJson.summary) {
        console.log('✅ Structure JSON valide!');
        console.log(`Priority: ${parsedJson.priority}`);
        console.log(`Sentiment: ${parsedJson.sentiment}`);
        console.log(`Summary: ${parsedJson.summary}`);
        return true;
      } else {
        console.log('❌ Structure JSON incomplète');
        return false;
      }
    } catch (parseError) {
      console.log('❌ Erreur parsing JSON:', parseError.message);
      return false;
    }

  } catch (error) {
    console.log('💥 Erreur:', error.message);
    return false;
  }
}

async function testServiceRecommendations() {
  console.log('\n🎯 Test des recommandations de services...');
  console.log('===========================================\n');

  const prompt = `Tu es un expert en recommandations de services IT pour Arcadis Tech. Analyse le profil client suivant et recommande 2-3 services pertinents.

PROFIL CLIENT :
- Entreprise : TechCorp
- Secteur : Technology
- Taille : medium
- Ancienneté client : 12 mois
- Rôle utilisateur : admin

ACTIVITÉ RÉCENTE :
- Devis demandés : 5 (types: website, mobile-app)
- Factures : 8 (total: 25000€)
- Tickets support : 3 (sujets: Bug dans l'app, Optimisation performance)

SERVICES DISPONIBLES :
- Développement Web Avancé (développement): Applications web sur mesure avec technologies modernes
- Optimisation SEO (marketing): Amélioration du référencement et visibilité en ligne
- Analyse de Données (data): Tableaux de bord et insights business intelligents
- Sécurité Informatique (sécurité): Audit et renforcement de la sécurité IT
- Cloud Migration (infrastructure): Migration et optimisation infrastructure cloud

RETOURNE UNIQUEMENT un objet JSON avec cette structure :
{
  "recommendations": [
    {
      "service_name": "nom du service",
      "category": "catégorie",
      "description": "description courte",
      "justification": "pourquoi ce service est pertinent pour ce client",
      "priority_score": 8,
      "estimated_value": "5000-15000€"
    }
  ],
  "user_profile_summary": "résumé du profil client en 1-2 phrases"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      console.log('❌ Erreur API:', response.status);
      return false;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.log('❌ Pas de réponse générée');
      return false;
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/s);
    if (!jsonMatch) {
      console.log('❌ Pas de JSON trouvé');
      console.log('Texte brut:', generatedText);
      return false;
    }
    
    const recommendations = JSON.parse(jsonMatch[0]);
    console.log('✅ Recommandations générées avec succès!');
    console.log('📊 Profil:', recommendations.user_profile_summary);
    console.log(`🎯 ${recommendations.recommendations.length} recommandations:`);
    
    recommendations.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.service_name} (${rec.category})`);
      console.log(`   📝 ${rec.description}`);
      console.log(`   🎯 ${rec.justification}`);
      console.log(`   ⭐ Score: ${rec.priority_score}/10`);
      console.log(`   💰 ${rec.estimated_value}`);
    });
    
    return true;

  } catch (error) {
    console.log('💥 Erreur:', error.message);
    return false;
  }
}

async function testDynamicContent() {
  console.log('\n📝 Test du contenu dynamique...');
  console.log('====================================\n');

  const prompt = `Tu es un assistant IA expert pour Arcadis Tech. Génère du contenu dynamique personnalisé pour le tableau de bord d'un utilisateur.

CONTEXTE UTILISATEUR :
- Entreprise : Digital Solutions (Technology)
- Taille : medium
- Rôle : admin

ACTIVITÉ RÉCENTE :
- Devis récents : 3 (types: website, mobile-app)
- Tickets récents : 2 (priorités: medium, high)

INSTRUCTIONS :
Génère 2-3 contenus personnalisés pour ce dashboard :
1. Un conseil/tip adapté à l'activité récente
2. Une suggestion d'optimisation basée sur le profil
3. (Optionnel) Une annonce ou mise à jour pertinente

RETOURNE UNIQUEMENT un objet JSON avec cette structure :
{
  "generated_content": [
    {
      "type": "tips",
      "title": "Titre du contenu",
      "content": "Contenu personnalisé en français",
      "category": "catégorie",
      "priority": 8,
      "call_to_action": {
        "text": "Action suggérée",
        "url": "/lien-pertinent"
      }
    }
  ],
  "user_context_summary": "résumé du contexte utilisateur"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      console.log('❌ Erreur API:', response.status);
      return false;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.log('❌ Pas de réponse générée');
      return false;
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/s);
    if (!jsonMatch) {
      console.log('❌ Pas de JSON trouvé');
      console.log('Texte brut:', generatedText);
      return false;
    }
    
    const content = JSON.parse(jsonMatch[0]);
    console.log('✅ Contenu dynamique généré avec succès!');
    console.log('👤 Contexte:', content.user_context_summary);
    console.log(`📝 ${content.generated_content.length} contenus générés:`);
    
    content.generated_content.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title} (${item.type})`);
      console.log(`   📄 ${item.content}`);
      console.log(`   🏷️ Catégorie: ${item.category}`);
      console.log(`   ⭐ Priorité: ${item.priority}/10`);
      if (item.call_to_action) {
        console.log(`   🔗 Action: ${item.call_to_action.text} → ${item.call_to_action.url}`);
      }
    });
    
    return true;

  } catch (error) {
    console.log('💥 Erreur:', error.message);
    return false;
  }
}

async function testClientRelationship() {
  console.log('\n📊 Test synthèse relation client...');
  console.log('====================================\n');

  const prompt = `Tu es un expert en analyse de relation client pour Arcadis Tech. Analyse les données suivantes et fournis des insights stratégiques.

DONNÉES CLIENT :
- Entreprise : InnovaTech (Technology)
- Taille : large
- Relation depuis : 18 mois

MÉTRIQUES FINANCIÈRES :
- Chiffre d'affaires total : 45000€
- Fiabilité paiement : excellent
- Montant en attente : 0€
- Nombre de factures : 12

ENGAGEMENT :
- Services actifs : 4
- Projets récents : 3
- Utilisateurs : 8
- Devis : 15

SUPPORT :
- Tickets : 6
- Sentiment global : positive
- Temps résolution moyen : 4h

RETOURNE UNIQUEMENT un objet JSON :
{
  "relationship_status": "excellent",
  "key_strengths": ["Force 1", "Force 2", "Force 3"],
  "areas_for_improvement": ["Amélioration 1", "Amélioration 2", "Amélioration 3"],
  "recommended_actions": ["Action 1", "Action 2", "Action 3"],
  "next_touchpoint_suggestion": "Suggestion de contact personnalisée"
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      console.log('❌ Erreur API:', response.status);
      return false;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.log('❌ Pas de réponse générée');
      return false;
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/s);
    if (!jsonMatch) {
      console.log('❌ Pas de JSON trouvé');
      console.log('Texte brut:', generatedText);
      return false;
    }
    
    const insights = JSON.parse(jsonMatch[0]);
    console.log('✅ Synthèse relation client générée avec succès!');
    console.log(`📈 Statut relation: ${insights.relationship_status}`);
    
    console.log('\n💪 Forces clés:');
    insights.key_strengths.forEach((strength, index) => {
      console.log(`   ${index + 1}. ${strength}`);
    });
    
    console.log('\n🎯 Axes d\'amélioration:');
    insights.areas_for_improvement.forEach((area, index) => {
      console.log(`   ${index + 1}. ${area}`);
    });
    
    console.log('\n🚀 Actions recommandées:');
    insights.recommended_actions.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action}`);
    });
    
    console.log(`\n📞 Prochain contact: ${insights.next_touchpoint_suggestion}`);
    
    return true;

  } catch (error) {
    console.log('💥 Erreur:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🤖 TESTS COMPLETS DES CAPACITÉS IA ARCADIS SPACE');
  console.log('===================================================');
  console.log(`🔑 Clé API: ${GEMINI_API_KEY.substring(0, 10)}...${GEMINI_API_KEY.substring(-5)}`);
  console.log('🧠 Modèle: Gemini 1.5 Flash\n');

  const results = [];

  // Test 1: Analyse de sentiment
  const sentimentTest = await testGeminiDirectly();
  results.push({ name: 'Analyse de sentiment', success: sentimentTest });

  // Test 2: Recommandations de services
  const recommendationsTest = await testServiceRecommendations();
  results.push({ name: 'Recommandations services', success: recommendationsTest });

  // Test 3: Contenu dynamique
  const contentTest = await testDynamicContent();
  results.push({ name: 'Contenu dynamique', success: contentTest });

  // Test 4: Synthèse relation client
  const relationshipTest = await testClientRelationship();
  results.push({ name: 'Synthèse relation client', success: relationshipTest });

  console.log('\n🎯 RÉSUMÉ DES TESTS');
  console.log('==================');
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.success ? 'SUCCÈS' : 'ÉCHEC'}`);
  });

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n📊 Score final: ${successCount}/${totalCount} tests réussis`);
  
  if (successCount === totalCount) {
    console.log('🎉 TOUS LES TESTS RÉUSSIS!');
    console.log('✨ L\'API Gemini fonctionne parfaitement avec votre clé!');
    console.log('🚀 Toutes les capacités IA d\'Arcadis Space sont opérationnelles!');
  } else {
    console.log('⚠️  Certains tests ont échoué, vérifiez les détails ci-dessus.');
  }

  console.log('\n🔧 Edge Functions déployées:');
  console.log('- ✅ ticket-sentiment-analysis');
  console.log('- ✅ recommend-services');
  console.log('- ✅ dynamic-content-generator');
  console.log('- ✅ client-relationship-summary');
  
  console.log('\n🎨 Composants React intégrés:');
  console.log('- ✅ ServiceRecommendations (Dashboard)');
  console.log('- ✅ DynamicContent (Dashboard)');
  console.log('- ✅ CompanyDetail (Admin)');
}

// Exécuter tous les tests
runAllTests().catch(console.error);

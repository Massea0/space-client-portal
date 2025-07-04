// test-gemini-direct.js - Test direct de l'API Gemini

const GEMINI_API_KEY = "AIzaSyAbjeF0789Jv6ZyM4hbRp5UFzkEoBDDtDI"

async function testGeminiDirect() {
  console.log('🧠 Test direct de l\'API Gemini...')
  
  const prompt = `Analyse le message suivant issu d'un ticket de support. Retourne UNIQUEMENT un objet JSON valide avec cette structure : {"priority": "valeur", "sentiment": "valeur", "summary": "résumé"}.

- "priority": Évalue le niveau d'urgence. Valeurs possibles : "low", "medium", "high", "urgent".
- "sentiment": Analyse le sentiment. Valeurs possibles : "positive", "neutral", "negative", "frustrated".
- "summary": Résume le problème en une phrase concise en français.

Message à analyser : "CATASTROPHE !!! NOTRE SITE EST COMPLÈTEMENT DOWN !!! NOUS PERDONS DES MILLIERS D'EUROS !!!"

Réponds UNIQUEMENT avec l'objet JSON, sans texte additionnel.`

  try {
    console.log('📡 Appel à l\'API Gemini...')
    
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
    )
    
    console.log(`Status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur API Gemini:', errorText)
      return false
    }
    
    const data = await response.json()
    console.log('✅ Réponse Gemini:', JSON.stringify(data, null, 2))
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (generatedText) {
      console.log('📝 Texte généré:', generatedText)
      
      // Essayer de parser le JSON
      try {
        const jsonMatch = generatedText.match(/\{.*\}/s)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          console.log('🎯 JSON parsé:', parsed)
          return true
        }
      } catch (parseError) {
        console.error('❌ Erreur parsing JSON:', parseError)
      }
    }
    
    return false
    
  } catch (error) {
    console.error('❌ Erreur réseau:', error)
    return false
  }
}

testGeminiDirect().then(success => {
  if (success) {
    console.log('\n🎉 API Gemini fonctionne parfaitement!')
    console.log('Le problème vient peut-être de la configuration des secrets Supabase.')
  } else {
    console.log('\n⚠️ Problème avec l\'API Gemini.')
    console.log('Vérifiez que la clé est valide et activée.')
  }
})

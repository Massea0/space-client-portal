// optimize-ai-payment-prediction.js
// Script d'optimisation pour améliorer les performances de l'AI Payment Prediction

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class PaymentPredictionOptimizer {
  constructor() {
    this.cacheStore = new Map()
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      avgResponseTime: 0,
      errors: 0
    }
  }

  // Test de performance de base
  async testCurrentPerformance() {
    console.log('\n🔍 Test de Performance Actuelle')
    console.log('=' .repeat(50))

    const startTime = Date.now()
    
    try {
      // Tester avec plusieurs factures
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, company_id, status')
        .in('status', ['pending', 'overdue'])
        .limit(5)
      
      if (!invoices || invoices.length === 0) {
        console.log('⚠️  Aucune facture de test trouvée')
        return
      }

      console.log(`📊 Test sur ${invoices.length} factures`)
      
      const results = []
      
      for (const invoice of invoices) {
        const predictionStart = Date.now()
        
        try {
          const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
            body: { invoiceId: invoice.id }
          })
          
          const responseTime = Date.now() - predictionStart
          
          if (error) {
            console.log(`❌ Erreur facture ${invoice.id}: ${error.message}`)
            results.push({ success: false, responseTime, error: error.message })
          } else {
            console.log(`✅ Facture ${invoice.id}: ${responseTime}ms`)
            results.push({ success: true, responseTime, prediction: data.prediction })
          }
          
        } catch (err) {
          const responseTime = Date.now() - predictionStart
          console.log(`💥 Exception facture ${invoice.id}: ${err.message}`)
          results.push({ success: false, responseTime, error: err.message })
        }
      }
      
      // Calcul des statistiques
      const successfulResults = results.filter(r => r.success)
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length
      const successRate = (successfulResults.length / results.length) * 100
      
      console.log('\n📈 Résultats Performance:')
      console.log(`  - Temps de réponse moyen: ${Math.round(avgResponseTime)}ms`)
      console.log(`  - Taux de succès: ${successRate.toFixed(1)}%`)
      console.log(`  - Temps total: ${Date.now() - startTime}ms`)
      
      return {
        avgResponseTime,
        successRate,
        totalTime: Date.now() - startTime,
        results
      }
      
    } catch (error) {
      console.error('❌ Erreur test performance:', error.message)
      return null
    }
  }

  // Test de batch processing optimisé
  async testBatchOptimization() {
    console.log('\n⚡ Test Batch Processing Optimisé')
    console.log('=' .repeat(50))

    try {
      // Récupérer plusieurs factures pour test batch
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id, company_id, amount, status, due_date')
        .in('status', ['pending', 'overdue'])
        .limit(10)
      
      if (!invoices || invoices.length === 0) {
        console.log('⚠️  Aucune facture pour test batch')
        return
      }

      console.log(`🔄 Test batch sur ${invoices.length} factures`)
      
      // Test séquentiel (méthode actuelle)
      const sequentialStart = Date.now()
      const sequentialResults = []
      
      for (const invoice of invoices.slice(0, 3)) {
        try {
          const { data } = await supabase.functions.invoke('ai-payment-prediction', {
            body: { invoiceId: invoice.id }
          })
          sequentialResults.push(data)
        } catch (err) {
          console.log(`❌ Erreur séquentielle: ${err.message}`)
        }
      }
      
      const sequentialTime = Date.now() - sequentialStart
      
      // Test parallèle (optimisation)
      const parallelStart = Date.now()
      const parallelPromises = invoices.slice(0, 3).map(invoice =>
        supabase.functions.invoke('ai-payment-prediction', {
          body: { invoiceId: invoice.id }
        }).catch(err => ({ error: err.message }))
      )
      
      const parallelResults = await Promise.all(parallelPromises)
      const parallelTime = Date.now() - parallelStart
      
      // Comparaison
      const improvement = ((sequentialTime - parallelTime) / sequentialTime * 100)
      
      console.log('\n📊 Comparaison Batch:')
      console.log(`  - Séquentiel: ${sequentialTime}ms`)
      console.log(`  - Parallèle: ${parallelTime}ms`) 
      console.log(`  - Amélioration: ${improvement.toFixed(1)}%`)
      
      return {
        sequential: sequentialTime,
        parallel: parallelTime,
        improvement
      }
      
    } catch (error) {
      console.error('❌ Erreur test batch:', error.message)
      return null
    }
  }

  // Analyse des patterns de cache
  async analyzeCachePatterns() {
    console.log('\n💾 Analyse Patterns de Cache')
    console.log('=' .repeat(50))

    try {
      // Analyser les prédictions existantes
      const { data: predictions } = await supabase
        .from('payment_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)
      
      if (!predictions || predictions.length === 0) {
        console.log('⚠️  Aucune prédiction historique trouvée')
        return
      }

      // Analyser les patterns temporels
      const now = new Date()
      const patterns = {
        total: predictions.length,
        lastHour: 0,
        lastDay: 0,
        lastWeek: 0,
        duplicates: 0
      }
      
      const invoiceIds = new Set()
      const duplicateInvoices = new Set()
      
      predictions.forEach(pred => {
        const createdAt = new Date(pred.created_at)
        const hoursAgo = (now - createdAt) / (1000 * 60 * 60)
        
        if (hoursAgo <= 1) patterns.lastHour++
        if (hoursAgo <= 24) patterns.lastDay++
        if (hoursAgo <= 168) patterns.lastWeek++
        
        if (invoiceIds.has(pred.invoice_id)) {
          duplicateInvoices.add(pred.invoice_id)
          patterns.duplicates++
        } else {
          invoiceIds.add(pred.invoice_id)
        }
      })
      
      // Calcul du potentiel de cache
      const cacheHitPotential = (patterns.duplicates / patterns.total * 100)
      
      console.log('\n📈 Analyse Cache:')
      console.log(`  - Total prédictions: ${patterns.total}`)
      console.log(`  - Dernière heure: ${patterns.lastHour}`)
      console.log(`  - Dernier jour: ${patterns.lastDay}`)
      console.log(`  - Dernière semaine: ${patterns.lastWeek}`)
      console.log(`  - Doublons détectés: ${patterns.duplicates}`)
      console.log(`  - Potentiel cache hit: ${cacheHitPotential.toFixed(1)}%`)
      
      // Recommandations TTL
      let recommendedTTL = 3600 // 1 heure par défaut
      if (patterns.lastDay > patterns.total * 0.5) {
        recommendedTTL = 1800 // 30 minutes si beaucoup d'activité
      } else if (patterns.lastWeek < patterns.total * 0.2) {
        recommendedTTL = 7200 // 2 heures si peu d'activité
      }
      
      console.log(`  - TTL recommandé: ${recommendedTTL / 60} minutes`)
      
      return {
        patterns,
        cacheHitPotential,
        recommendedTTL
      }
      
    } catch (error) {
      console.error('❌ Erreur analyse cache:', error.message)
      return null
    }
  }

  // Test de précision des prédictions
  async testPredictionAccuracy() {
    console.log('\n🎯 Test Précision des Prédictions')
    console.log('=' .repeat(50))

    try {
      // Récupérer des factures payées récemment avec prédictions
      const { data: paidInvoices } = await supabase
        .from('invoices')
        .select(`
          id, 
          paid_at, 
          due_date,
          amount,
          payment_predictions(*)
        `)
        .eq('status', 'paid')
        .not('paid_at', 'is', null)
        .not('payment_predictions.id', 'is', null)
        .limit(20)
      
      if (!paidInvoices || paidInvoices.length === 0) {
        console.log('⚠️  Aucune facture payée avec prédiction trouvée')
        return
      }

      console.log(`📊 Analyse de ${paidInvoices.length} factures payées`)
      
      let accuracyStats = {
        totalPredictions: 0,
        accuratePredictions: 0,
        averageError: 0,
        riskLevelAccuracy: { correct: 0, total: 0 }
      }
      
      paidInvoices.forEach(invoice => {
        if (!invoice.payment_predictions || invoice.payment_predictions.length === 0) return
        
        const prediction = invoice.payment_predictions[0].prediction_data
        const actualPaidDate = new Date(invoice.paid_at)
        const predictedDate = new Date(prediction.predictedPaymentDate)
        const dueDate = new Date(invoice.due_date)
        
        // Calcul de l'erreur en jours
        const errorDays = Math.abs((actualPaidDate - predictedDate) / (1000 * 60 * 60 * 24))
        
        // Prédiction considérée précise si erreur < 7 jours
        if (errorDays <= 7) {
          accuracyStats.accuratePredictions++
        }
        
        accuracyStats.totalPredictions++
        accuracyStats.averageError += errorDays
        
        // Vérifier la précision du niveau de risque
        const actualDelay = (actualPaidDate - dueDate) / (1000 * 60 * 60 * 24)
        const predictedRisk = prediction.riskLevel
        
        let actualRisk = 'low'
        if (actualDelay > 30) actualRisk = 'high'
        else if (actualDelay > 7) actualRisk = 'medium'
        
        accuracyStats.riskLevelAccuracy.total++
        if (actualRisk === predictedRisk) {
          accuracyStats.riskLevelAccuracy.correct++
        }
        
        console.log(`  📋 Facture ${invoice.id.slice(0, 8)}...`)
        console.log(`     Prédit: ${prediction.predictedPaymentDate} | Réel: ${invoice.paid_at.split('T')[0]}`)
        console.log(`     Erreur: ${errorDays.toFixed(1)} jours | Risque: ${predictedRisk} → ${actualRisk}`)
      })
      
      if (accuracyStats.totalPredictions > 0) {
        accuracyStats.averageError /= accuracyStats.totalPredictions
        
        const accuracyRate = (accuracyStats.accuratePredictions / accuracyStats.totalPredictions * 100)
        const riskAccuracyRate = (accuracyStats.riskLevelAccuracy.correct / accuracyStats.riskLevelAccuracy.total * 100)
        
        console.log('\n🎯 Résultats Précision:')
        console.log(`  - Prédictions précises (±7j): ${accuracyRate.toFixed(1)}%`)
        console.log(`  - Erreur moyenne: ${accuracyStats.averageError.toFixed(1)} jours`)
        console.log(`  - Précision niveau de risque: ${riskAccuracyRate.toFixed(1)}%`)
        
        return {
          accuracyRate,
          averageError: accuracyStats.averageError,
          riskAccuracyRate,
          sampleSize: accuracyStats.totalPredictions
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur test précision:', error.message)
      return null
    }
  }

  // Génération du rapport d'optimisation
  async generateOptimizationReport() {
    console.log('\n📋 Génération Rapport d\'Optimisation')
    console.log('=' .repeat(50))

    const report = {
      timestamp: new Date().toISOString(),
      performance: null,
      batchOptimization: null,
      cacheAnalysis: null,
      accuracyAnalysis: null,
      recommendations: []
    }

    // Exécuter tous les tests
    report.performance = await this.testCurrentPerformance()
    report.batchOptimization = await this.testBatchOptimization()
    report.cacheAnalysis = await this.analyzeCachePatterns()
    report.accuracyAnalysis = await this.testPredictionAccuracy()

    // Générer les recommandations
    if (report.performance && report.performance.avgResponseTime > 3000) {
      report.recommendations.push({
        priority: 'high',
        type: 'performance',
        issue: 'Temps de réponse élevé',
        action: 'Implémenter cache avec TTL adaptatif'
      })
    }

    if (report.batchOptimization && report.batchOptimization.improvement > 40) {
      report.recommendations.push({
        priority: 'medium',
        type: 'scalability',
        issue: 'Traitement séquentiel inefficace',
        action: 'Implémenter batch processing parallèle'
      })
    }

    if (report.cacheAnalysis && report.cacheAnalysis.cacheHitPotential > 30) {
      report.recommendations.push({
        priority: 'high',
        type: 'optimization',
        issue: 'Potentiel de cache élevé non exploité',
        action: `Implémenter cache avec TTL ${report.cacheAnalysis.recommendedTTL / 60}min`
      })
    }

    if (report.accuracyAnalysis && report.accuracyAnalysis.accuracyRate < 80) {
      report.recommendations.push({
        priority: 'high',
        type: 'accuracy',
        issue: 'Précision des prédictions insuffisante',
        action: 'Améliorer prompts Gemini et données d\'entraînement'
      })
    }

    console.log('\n📊 RAPPORT D\'OPTIMISATION COMPLET:')
    console.log(JSON.stringify(report, null, 2))

    return report
  }
}

// Exécution du script d'optimisation
async function main() {
  console.log('🚀 OPTIMISATION AI PAYMENT PREDICTION')
  console.log('=' .repeat(60))
  
  const optimizer = new PaymentPredictionOptimizer()
  
  try {
    const report = await optimizer.generateOptimizationReport()
    
    console.log('\n✅ Optimisation terminée!')
    console.log(`📄 Rapport sauvegardé: ${report.timestamp}`)
    
    // Afficher un résumé des recommandations prioritaires
    const highPriorityRecs = report.recommendations.filter(r => r.priority === 'high')
    if (highPriorityRecs.length > 0) {
      console.log('\n🔥 ACTIONS PRIORITAIRES:')
      highPriorityRecs.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec.issue} → ${rec.action}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur optimisation:', error.message)
  }
}

main().catch(console.error)

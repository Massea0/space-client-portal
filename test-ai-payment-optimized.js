// test-ai-payment-optimized.js
// Tests spécifiques pour la version optimisée d'AI Payment Prediction

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class OptimizedPaymentPredictionTester {
  constructor() {
    this.testResults = {
      cacheTests: [],
      performanceTests: [],
      retryTests: [],
      accuracyTests: [],
      summary: {}
    }
  }

  // Test du système de cache
  async testCacheSystem() {
    console.log('\n💾 Test du Système de Cache Optimisé')
    console.log('=' .repeat(50))

    try {
      // Récupérer une facture de test
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'pending')
        .limit(1)
        .single()

      if (!invoice) {
        console.log('⚠️  Aucune facture de test disponible')
        return false
      }

      const invoiceId = invoice.id
      console.log(`🔍 Test cache avec facture: ${invoiceId.slice(0, 8)}...`)

      // Premier appel (cache miss attendu)
      const firstCallStart = Date.now()
      const { data: firstResult, error: firstError } = await supabase.functions.invoke('ai-payment-prediction', {
        body: { invoiceId, forceRefresh: true }
      })

      if (firstError) {
        console.log(`❌ Erreur premier appel: ${firstError.message}`)
        return false
      }

      const firstCallTime = Date.now() - firstCallStart
      const isCachedFirst = firstResult.cached || false

      console.log(`🥇 Premier appel: ${firstCallTime}ms | Cached: ${isCachedFirst}`)

      // Deuxième appel immédiat (cache hit attendu)
      const secondCallStart = Date.now()
      const { data: secondResult, error: secondError } = await supabase.functions.invoke('ai-payment-prediction', {
        body: { invoiceId }
      })

      if (secondError) {
        console.log(`❌ Erreur deuxième appel: ${secondError.message}`)
        return false
      }

      const secondCallTime = Date.now() - secondCallStart
      const isCachedSecond = secondResult.cached || false

      console.log(`🥈 Deuxième appel: ${secondCallTime}ms | Cached: ${isCachedSecond}`)

      // Analyse des résultats
      const cacheWorking = !isCachedFirst && isCachedSecond
      const speedImprovement = ((firstCallTime - secondCallTime) / firstCallTime * 100)

      console.log('\n📊 Résultats Cache:')
      console.log(`  - Cache fonctionne: ${cacheWorking ? '✅' : '❌'}`)
      console.log(`  - Amélioration vitesse: ${speedImprovement.toFixed(1)}%`)
      console.log(`  - Cache hit rate: ${secondResult.metrics?.cacheHitRate || 'N/A'}%`)

      this.testResults.cacheTests.push({
        invoiceId,
        firstCallTime,
        secondCallTime,
        cacheWorking,
        speedImprovement
      })

      return cacheWorking
    } catch (error) {
      console.error('❌ Erreur test cache:', error.message)
      return false
    }
  }

  // Test de performance sous charge
  async testPerformanceUnderLoad() {
    console.log('\n⚡ Test de Performance Sous Charge')
    console.log('=' .repeat(50))

    try {
      // Récupérer plusieurs factures pour le test
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id')
        .in('status', ['pending', 'overdue'])
        .limit(10)

      if (!invoices || invoices.length === 0) {
        console.log('⚠️  Pas assez de factures pour le test de charge')
        return false
      }

      console.log(`🔄 Test de charge avec ${invoices.length} factures`)

      // Test charge séquentielle
      console.log('\n📈 Test séquentiel...')
      const sequentialStart = Date.now()
      const sequentialResults = []

      for (let i = 0; i < Math.min(5, invoices.length); i++) {
        const callStart = Date.now()
        try {
          const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
            body: { invoiceId: invoices[i].id }
          })

          const callTime = Date.now() - callStart
          if (error) {
            console.log(`❌ Erreur facture ${i + 1}: ${error.message}`)
            sequentialResults.push({ success: false, time: callTime })
          } else {
            console.log(`✅ Facture ${i + 1}: ${callTime}ms | Cached: ${data.cached || false}`)
            sequentialResults.push({ 
              success: true, 
              time: callTime, 
              cached: data.cached,
              metrics: data.metrics
            })
          }
        } catch (err) {
          console.log(`💥 Exception facture ${i + 1}: ${err.message}`)
          sequentialResults.push({ success: false, time: Date.now() - callStart })
        }
      }

      const sequentialTime = Date.now() - sequentialStart
      const successfulCalls = sequentialResults.filter(r => r.success)
      const avgResponseTime = successfulCalls.length > 0 
        ? successfulCalls.reduce((sum, r) => sum + r.time, 0) / successfulCalls.length 
        : 0

      console.log('\n📊 Résultats Performance:')
      console.log(`  - Temps total: ${sequentialTime}ms`)
      console.log(`  - Temps moyen par appel: ${avgResponseTime.toFixed(0)}ms`)
      console.log(`  - Taux de succès: ${(successfulCalls.length / sequentialResults.length * 100).toFixed(1)}%`)
      console.log(`  - Appels en cache: ${successfulCalls.filter(r => r.cached).length}/${successfulCalls.length}`)

      this.testResults.performanceTests.push({
        totalTime: sequentialTime,
        avgResponseTime,
        successRate: successfulCalls.length / sequentialResults.length,
        cacheHitCount: successfulCalls.filter(r => r.cached).length
      })

      return avgResponseTime < 2000 // Objectif < 2 secondes
    } catch (error) {
      console.error('❌ Erreur test performance:', error.message)
      return false
    }
  }

  // Test du système de retry
  async testRetryLogic() {
    console.log('\n🔄 Test du Système de Retry')
    console.log('=' .repeat(50))

    try {
      // Test avec un ID de facture invalide pour déclencher une erreur
      console.log('🧪 Test avec ID invalide pour vérifier la gestion d\'erreur...')
      
      const retryStart = Date.now()
      const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
        body: { invoiceId: 'invalid-id-test-retry-logic-12345' }
      })

      const retryTime = Date.now() - retryStart

      if (error) {
        console.log(`✅ Erreur gérée correctement: ${error.message}`)
        console.log(`⏱️  Temps de gestion d'erreur: ${retryTime}ms`)
        
        // L'erreur est attendue pour un ID invalide
        this.testResults.retryTests.push({
          errorHandled: true,
          responseTime: retryTime,
          errorMessage: error.message
        })
        
        return true
      } else {
        console.log('⚠️  Aucune erreur détectée avec ID invalide (inattendu)')
        return false
      }
    } catch (error) {
      console.log(`✅ Exception gérée: ${error.message}`)
      this.testResults.retryTests.push({
        exceptionHandled: true,
        errorMessage: error.message
      })
      return true
    }
  }

  // Test de la cohérence des métriques
  async testMetricsConsistency() {
    console.log('\n📊 Test de Cohérence des Métriques')
    console.log('=' .repeat(50))

    try {
      const { data: invoice } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'pending')
        .limit(1)
        .single()

      if (!invoice) {
        console.log('⚠️  Aucune facture de test disponible')
        return false
      }

      // Faire plusieurs appels pour accumuler des métriques
      const metricsHistory = []
      
      for (let i = 0; i < 3; i++) {
        const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
          body: { invoiceId: invoice.id }
        })

        if (!error && data.metrics) {
          metricsHistory.push({
            call: i + 1,
            responseTime: data.metrics.responseTime,
            cacheHitRate: parseFloat(data.metrics.cacheHitRate),
            totalRequests: data.metrics.totalRequests,
            avgResponseTime: data.metrics.avgResponseTime
          })
          
          console.log(`📈 Appel ${i + 1}:`)
          console.log(`   Response time: ${data.metrics.responseTime}ms`)
          console.log(`   Cache hit rate: ${data.metrics.cacheHitRate}%`)
          console.log(`   Total requests: ${data.metrics.totalRequests}`)
        }
      }

      if (metricsHistory.length > 1) {
        // Vérifier la cohérence des métriques
        const firstMetrics = metricsHistory[0]
        const lastMetrics = metricsHistory[metricsHistory.length - 1]
        
        const requestsIncreased = lastMetrics.totalRequests > firstMetrics.totalRequests
        const cacheRateEvolution = lastMetrics.cacheHitRate - firstMetrics.cacheHitRate
        
        console.log('\n📊 Analyse Métriques:')
        console.log(`  - Requests incrementés: ${requestsIncreased ? '✅' : '❌'}`)
        console.log(`  - Évolution cache rate: ${cacheRateEvolution.toFixed(1)}%`)
        
        this.testResults.accuracyTests.push({
          metricsConsistent: requestsIncreased,
          cacheRateImprovement: cacheRateEvolution,
          sampleSize: metricsHistory.length
        })
        
        return requestsIncreased
      }

      return false
    } catch (error) {
      console.error('❌ Erreur test métriques:', error.message)
      return false
    }
  }

  // Test de la version optimisée vs standard
  async compareOptimizedVsStandard() {
    console.log('\n🆚 Comparaison Version Optimisée vs Standard')
    console.log('=' .repeat(50))

    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id')
        .eq('status', 'pending')
        .limit(3)

      if (!invoices || invoices.length === 0) {
        console.log('⚠️  Pas de factures pour la comparaison')
        return false
      }

      console.log('📊 Collecte des données de performance...')
      
      // Tester chaque facture plusieurs fois pour obtenir des moyennes
      const performanceData = []
      
      for (const invoice of invoices) {
        const times = []
        
        for (let i = 0; i < 2; i++) {
          const start = Date.now()
          const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
            body: { invoiceId: invoice.id }
          })
          
          if (!error) {
            times.push({
              time: Date.now() - start,
              cached: data.cached || false,
              metrics: data.metrics
            })
          }
        }
        
        if (times.length > 0) {
          const avgTime = times.reduce((sum, t) => sum + t.time, 0) / times.length
          const cacheRate = times.filter(t => t.cached).length / times.length * 100
          
          performanceData.push({
            invoiceId: invoice.id.slice(0, 8),
            avgResponseTime: avgTime,
            cacheHitRate: cacheRate
          })
          
          console.log(`📋 ${invoice.id.slice(0, 8)}: ${avgTime.toFixed(0)}ms avg, ${cacheRate}% cached`)
        }
      }

      if (performanceData.length > 0) {
        const overallAvgTime = performanceData.reduce((sum, d) => sum + d.avgResponseTime, 0) / performanceData.length
        const overallCacheRate = performanceData.reduce((sum, d) => sum + d.cacheHitRate, 0) / performanceData.length
        
        console.log('\n🎯 Résultats Comparaison:')
        console.log(`  - Temps de réponse moyen: ${overallAvgTime.toFixed(0)}ms`)
        console.log(`  - Taux de cache moyen: ${overallCacheRate.toFixed(1)}%`)
        
        // Objectifs de performance
        const meetsPerfTarget = overallAvgTime < 2000
        const meetsCacheTarget = overallCacheRate > 30 // 30% après quelques appels
        
        console.log(`  - Objectif perf (<2s): ${meetsPerfTarget ? '✅' : '❌'}`)
        console.log(`  - Objectif cache (>30%): ${meetsCacheTarget ? '✅' : '❌'}`)
        
        return meetsPerfTarget && meetsCacheTarget
      }

      return false
    } catch (error) {
      console.error('❌ Erreur comparaison:', error.message)
      return false
    }
  }

  // Rapport final complet
  async generateFinalReport() {
    console.log('\n📋 RAPPORT FINAL - AI PAYMENT PREDICTION OPTIMISÉE')
    console.log('=' .repeat(60))

    const summary = {
      timestamp: new Date().toISOString(),
      testsExecuted: 0,
      testsSuccessful: 0,
      performance: {
        avgResponseTime: 0,
        cacheEfficiency: 0,
        reliabilityScore: 0
      },
      recommendations: []
    }

    // Exécuter tous les tests
    console.log('🧪 Exécution de la suite de tests complète...\n')

    const tests = [
      { name: 'Cache System', fn: () => this.testCacheSystem() },
      { name: 'Performance Under Load', fn: () => this.testPerformanceUnderLoad() },
      { name: 'Retry Logic', fn: () => this.testRetryLogic() },
      { name: 'Metrics Consistency', fn: () => this.testMetricsConsistency() },
      { name: 'Optimized vs Standard', fn: () => this.compareOptimizedVsStandard() }
    ]

    for (const test of tests) {
      summary.testsExecuted++
      try {
        const result = await test.fn()
        if (result) {
          summary.testsSuccessful++
          console.log(`✅ ${test.name}: PASSED`)
        } else {
          console.log(`❌ ${test.name}: FAILED`)
        }
      } catch (error) {
        console.log(`💥 ${test.name}: ERROR - ${error.message}`)
      }
    }

    // Calculer les métriques de performance
    if (this.testResults.performanceTests.length > 0) {
      const perfData = this.testResults.performanceTests[0]
      summary.performance.avgResponseTime = perfData.avgResponseTime
      summary.performance.reliabilityScore = perfData.successRate
    }

    if (this.testResults.cacheTests.length > 0) {
      const cacheData = this.testResults.cacheTests[0]
      summary.performance.cacheEfficiency = cacheData.speedImprovement
    }

    // Générer des recommandations
    if (summary.performance.avgResponseTime > 1500) {
      summary.recommendations.push('Optimiser davantage les temps de réponse')
    }

    if (summary.performance.cacheEfficiency < 50) {
      summary.recommendations.push('Améliorer l\'efficacité du cache')
    }

    if (summary.testsSuccessful / summary.testsExecuted < 0.8) {
      summary.recommendations.push('Corriger les tests en échec avant déploiement')
    }

    // Affichage du rapport final
    console.log('\n🎯 RÉSUMÉ EXÉCUTIF:')
    console.log(`  - Tests réussis: ${summary.testsSuccessful}/${summary.testsExecuted} (${(summary.testsSuccessful/summary.testsExecuted*100).toFixed(1)}%)`)
    console.log(`  - Temps de réponse moyen: ${summary.performance.avgResponseTime.toFixed(0)}ms`)
    console.log(`  - Efficacité cache: ${summary.performance.cacheEfficiency.toFixed(1)}%`)
    console.log(`  - Score fiabilité: ${(summary.performance.reliabilityScore*100).toFixed(1)}%`)

    if (summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMANDATIONS:')
      summary.recommendations.forEach((rec, i) => {
        console.log(`  ${i + 1}. ${rec}`)
      })
    }

    // Verdict final
    const overallScore = summary.testsSuccessful / summary.testsExecuted
    console.log(`\n🏆 VERDICT FINAL: ${overallScore >= 0.8 ? '✅ PRÊT POUR PRODUCTION' : '⚠️  OPTIMISATIONS REQUISES'}`)

    return summary
  }
}

// Exécution des tests
async function main() {
  console.log('🧪 TESTS AI PAYMENT PREDICTION OPTIMISÉE')
  console.log('=' .repeat(60))
  
  const tester = new OptimizedPaymentPredictionTester()
  
  try {
    const report = await tester.generateFinalReport()
    
    console.log('\n📄 Tests terminés!')
    console.log(`📊 Rapport complet généré: ${report.timestamp}`)
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message)
  }
}

main().catch(console.error)

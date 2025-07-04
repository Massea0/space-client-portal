// monitoring-ai-payment.js
// Script de monitoring en continu pour AI Payment Prediction

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDEwMjQ1MSwiZXhwIjoyMDY1Njc4NDUxfQ.hjJN_YGXtGETh6ks2mAJ0wmwYDcATrTJCihG1aV8ppc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

class AIPaymentMonitoring {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      totalChecks: 0,
      successfulChecks: 0,
      errors: [],
      performanceHistory: [],
      alerts: []
    }
    
    this.thresholds = {
      maxResponseTime: 5000,      // 5 secondes max
      minCacheHitRate: 30,        // 30% minimum cache hit
      maxErrorRate: 5,            // 5% maximum erreurs
      alertCooldown: 300000       // 5 minutes entre alertes
    }
    
    this.lastAlert = 0
  }

  // Contrôle de santé de base
  async healthCheck() {
    try {
      const start = Date.now()
      
      // Test simple avec une facture connue
      const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
        body: { invoiceId: 'health-check-test-id' }
      })
      
      const responseTime = Date.now() - start
      
      this.metrics.totalChecks++
      
      if (!error || error.message.includes('not found')) {
        // Erreur attendue pour un ID de test
        this.metrics.successfulChecks++
        return {
          status: 'healthy',
          responseTime,
          timestamp: new Date().toISOString()
        }
      } else {
        this.metrics.errors.push({
          timestamp: new Date().toISOString(),
          error: error.message,
          responseTime
        })
        
        return {
          status: 'unhealthy',
          error: error.message,
          responseTime,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      this.metrics.errors.push({
        timestamp: new Date().toISOString(),
        error: error.message,
        responseTime: 0
      })
      
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Test de performance détaillé
  async performanceCheck() {
    try {
      // Récupérer quelques factures réelles pour test
      const { data: invoices } = await supabase
        .from('invoices')
        .select('id')
        .limit(3)
      
      if (!invoices || invoices.length === 0) {
        return {
          status: 'no_data',
          message: 'Aucune facture disponible pour test performance'
        }
      }

      const performanceData = []
      
      for (const invoice of invoices) {
        const start = Date.now()
        
        try {
          const { data, error } = await supabase.functions.invoke('ai-payment-prediction', {
            body: { invoiceId: invoice.id }
          })
          
          const responseTime = Date.now() - start
          
          performanceData.push({
            invoiceId: invoice.id.slice(0, 8),
            responseTime,
            cached: data?.cached || false,
            cacheHitRate: data?.metrics?.cacheHitRate || '0.0',
            success: !error
          })
          
        } catch (err) {
          performanceData.push({
            invoiceId: invoice.id.slice(0, 8),
            responseTime: Date.now() - start,
            cached: false,
            success: false,
            error: err.message
          })
        }
      }
      
      // Calculer les métriques
      const avgResponseTime = performanceData
        .filter(p => p.success)
        .reduce((sum, p) => sum + p.responseTime, 0) / 
        performanceData.filter(p => p.success).length || 0
        
      const successRate = performanceData.filter(p => p.success).length / performanceData.length
      const cacheHitRate = parseFloat(performanceData[0]?.cacheHitRate || '0')
      
      this.metrics.performanceHistory.push({
        timestamp: new Date().toISOString(),
        avgResponseTime,
        successRate,
        cacheHitRate,
        sampleSize: performanceData.length
      })
      
      return {
        status: 'measured',
        avgResponseTime,
        successRate,
        cacheHitRate,
        details: performanceData,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Vérification des seuils et génération d'alertes
  checkThresholds(performanceData) {
    const alerts = []
    const now = Date.now()
    
    // Éviter le spam d'alertes
    if (now - this.lastAlert < this.thresholds.alertCooldown) {
      return []
    }
    
    if (performanceData.avgResponseTime > this.thresholds.maxResponseTime) {
      alerts.push({
        type: 'performance',
        severity: 'warning',
        message: `Temps de réponse élevé: ${performanceData.avgResponseTime}ms (seuil: ${this.thresholds.maxResponseTime}ms)`,
        timestamp: new Date().toISOString()
      })
    }
    
    if (performanceData.cacheHitRate < this.thresholds.minCacheHitRate) {
      alerts.push({
        type: 'cache',
        severity: 'info',
        message: `Taux de cache faible: ${performanceData.cacheHitRate}% (seuil: ${this.thresholds.minCacheHitRate}%)`,
        timestamp: new Date().toISOString()
      })
    }
    
    const errorRate = ((this.metrics.totalChecks - this.metrics.successfulChecks) / this.metrics.totalChecks) * 100
    if (errorRate > this.thresholds.maxErrorRate) {
      alerts.push({
        type: 'reliability',
        severity: 'critical',
        message: `Taux d'erreur élevé: ${errorRate.toFixed(1)}% (seuil: ${this.thresholds.maxErrorRate}%)`,
        timestamp: new Date().toISOString()
      })
    }
    
    if (alerts.length > 0) {
      this.lastAlert = now
      this.metrics.alerts.push(...alerts)
    }
    
    return alerts
  }

  // Rapport de statut complet
  generateStatusReport() {
    const uptime = Date.now() - this.metrics.startTime
    const uptimeHours = uptime / (1000 * 60 * 60)
    
    const recentPerformance = this.metrics.performanceHistory.slice(-5) // 5 derniers tests
    const avgRecentResponseTime = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.avgResponseTime, 0) / recentPerformance.length
      : 0
      
    const avgRecentCacheRate = recentPerformance.length > 0
      ? recentPerformance.reduce((sum, p) => sum + p.cacheHitRate, 0) / recentPerformance.length
      : 0
    
    const successRate = this.metrics.totalChecks > 0
      ? (this.metrics.successfulChecks / this.metrics.totalChecks) * 100
      : 100
    
    return {
      timestamp: new Date().toISOString(),
      uptime: {
        hours: uptimeHours.toFixed(2),
        startTime: new Date(this.metrics.startTime).toISOString()
      },
      health: {
        totalChecks: this.metrics.totalChecks,
        successfulChecks: this.metrics.successfulChecks,
        successRate: successRate.toFixed(1),
        status: successRate >= 95 ? 'healthy' : successRate >= 85 ? 'warning' : 'critical'
      },
      performance: {
        avgResponseTime: avgRecentResponseTime.toFixed(0),
        avgCacheHitRate: avgRecentCacheRate.toFixed(1),
        samples: recentPerformance.length
      },
      alerts: {
        total: this.metrics.alerts.length,
        recent: this.metrics.alerts.filter(a => 
          Date.now() - new Date(a.timestamp).getTime() < 3600000 // dernière heure
        ).length,
        latest: this.metrics.alerts.slice(-3) // 3 dernières alertes
      },
      errors: {
        total: this.metrics.errors.length,
        recent: this.metrics.errors.filter(e => 
          Date.now() - new Date(e.timestamp).getTime() < 3600000 // dernière heure
        )
      }
    }
  }

  // Cycle de monitoring continu
  async startMonitoring(intervalMinutes = 5) {
    console.log(`🔍 Démarrage monitoring AI Payment Prediction`)
    console.log(`⏱️  Intervalle: ${intervalMinutes} minutes`)
    console.log(`📊 Seuils: Response ${this.thresholds.maxResponseTime}ms, Cache ${this.thresholds.minCacheHitRate}%, Erreurs ${this.thresholds.maxErrorRate}%`)
    console.log('=' .repeat(60))
    
    const monitor = async () => {
      try {
        console.log(`\n🔍 Contrôle santé - ${new Date().toLocaleTimeString()}`)
        
        // Health check basique
        const health = await this.healthCheck()
        console.log(`   Santé: ${health.status} (${health.responseTime}ms)`)
        
        // Test performance détaillé
        const performance = await this.performanceCheck()
        if (performance.status === 'measured') {
          console.log(`   Performance: ${performance.avgResponseTime.toFixed(0)}ms avg, ${performance.cacheHitRate}% cache, ${(performance.successRate * 100).toFixed(1)}% success`)
          
          // Vérifier les seuils
          const alerts = this.checkThresholds(performance)
          if (alerts.length > 0) {
            console.log(`   🚨 ALERTES (${alerts.length}):`)
            alerts.forEach(alert => {
              const icon = alert.severity === 'critical' ? '🔴' : 
                          alert.severity === 'warning' ? '🟡' : '🔵'
              console.log(`      ${icon} ${alert.message}`)
            })
          }
        } else {
          console.log(`   Performance: ${performance.status} - ${performance.error || performance.message}`)
        }
        
      } catch (error) {
        console.error(`❌ Erreur monitoring: ${error.message}`)
      }
    }
    
    // Monitoring initial
    await monitor()
    
    // Monitoring périodique
    const interval = setInterval(monitor, intervalMinutes * 60 * 1000)
    
    // Rapport de statut toutes les heures
    const hourlyReport = setInterval(() => {
      console.log('\n📋 RAPPORT DE STATUT HORAIRE')
      console.log('=' .repeat(40))
      const report = this.generateStatusReport()
      console.log(`Uptime: ${report.uptime.hours}h`)
      console.log(`Santé: ${report.health.status} (${report.health.successRate}% success)`)
      console.log(`Performance: ${report.performance.avgResponseTime}ms, ${report.performance.avgCacheHitRate}% cache`)
      console.log(`Alertes: ${report.alerts.recent} dans la dernière heure`)
    }, 60 * 60 * 1000) // 1 heure
    
    // Gestion de l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\n📋 RAPPORT FINAL')
      console.log('=' .repeat(40))
      const finalReport = this.generateStatusReport()
      console.log(JSON.stringify(finalReport, null, 2))
      
      clearInterval(interval)
      clearInterval(hourlyReport)
      process.exit(0)
    })
    
    console.log('\n✅ Monitoring démarré. CTRL+C pour arrêter et voir le rapport final.')
  }

  // Test ponctuel simple
  async quickTest() {
    console.log('⚡ Test rapide AI Payment Prediction')
    console.log('=' .repeat(40))
    
    const health = await this.healthCheck()
    const performance = await this.performanceCheck()
    
    console.log(`Santé: ${health.status}`)
    if (performance.status === 'measured') {
      console.log(`Performance: ${performance.avgResponseTime.toFixed(0)}ms avg`)
      console.log(`Cache: ${performance.cacheHitRate}%`)
      console.log(`Succès: ${(performance.successRate * 100).toFixed(1)}%`)
      
      const alerts = this.checkThresholds(performance)
      if (alerts.length > 0) {
        console.log(`Alertes: ${alerts.length}`)
        alerts.forEach(alert => console.log(`  - ${alert.message}`))
      } else {
        console.log('✅ Tous les seuils respectés')
      }
    }
    
    return { health, performance }
  }
}

// Interface en ligne de commande
async function main() {
  const args = process.argv.slice(2)
  const command = args[0] || 'quick'
  
  const monitor = new AIPaymentMonitoring()
  
  switch (command) {
    case 'quick':
    case 'test':
      await monitor.quickTest()
      break
      
    case 'monitor':
    case 'watch':
      const interval = parseInt(args[1]) || 5
      await monitor.startMonitoring(interval)
      break
      
    case 'status':
    case 'report':
      // Exécuter quelques tests pour avoir des données
      await monitor.healthCheck()
      await monitor.performanceCheck()
      const report = monitor.generateStatusReport()
      console.log('📊 RAPPORT DE STATUT')
      console.log('=' .repeat(40))
      console.log(JSON.stringify(report, null, 2))
      break
      
    default:
      console.log('🔍 MONITORING AI PAYMENT PREDICTION')
      console.log('Usage:')
      console.log('  node monitoring-ai-payment.js quick       # Test rapide')
      console.log('  node monitoring-ai-payment.js monitor [5] # Monitoring continu (5min)')
      console.log('  node monitoring-ai-payment.js status      # Rapport de statut')
      break
  }
}

main().catch(console.error)

export { AIPaymentMonitoring }

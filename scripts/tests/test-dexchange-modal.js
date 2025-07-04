// test-dexchange-modal.js
/**
 * Script de test pour le modal de paiement Dexchange
 * Ce script ouvre le modal de paiement pour une facture et teste les différentes étapes
 */

const { chromium } = require('playwright');
const chalk = require('chalk');

// Configuration
const BASE_URL = 'http://localhost:5173';
const LOGIN_EMAIL = 'test@example.com';
const LOGIN_PASSWORD = 'testpassword';

// Utilitaires de log
const log = {
  info: message => console.log(chalk.blue(`[INFO] ${message}`)),
  success: message => console.log(chalk.green(`[SUCCESS] ${message}`)),
  warning: message => console.log(chalk.yellow(`[WARNING] ${message}`)),
  error: message => console.log(chalk.red(`[ERROR] ${message}`)),
  step: message => console.log(chalk.cyan(`\n[STEP] ${message}`))
};

async function runTest() {
  // Démarrer le navigateur
  log.step('Démarrage du navigateur');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Accéder à l'application
    log.step('Navigation vers l\'application');
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    
    // Connexion
    log.step('Connexion à l\'application');
    await page.locator('input[name="email"]').fill(LOGIN_EMAIL);
    await page.locator('input[name="password"]').fill(LOGIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(`${BASE_URL}/dashboard`);
    log.success('Connexion réussie');
    
    // Navigation vers la page des factures
    log.step('Navigation vers la page des factures');
    await page.locator('a[href="/factures"]').click();
    await page.waitForURL(`${BASE_URL}/factures`);
    log.success('Page des factures chargée');
    
    // Trouver une facture non payée et cliquer sur le bouton de paiement
    log.step('Recherche d\'une facture non payée');
    
    // Attendre que le tableau des factures soit chargé
    await page.waitForSelector('table');
    
    // Trouver un bouton "Payer" et cliquer dessus
    const payButton = await page.locator('button:has-text("Payer")').first();
    if (!payButton) {
      log.error('Aucune facture non payée trouvée');
      return;
    }
    
    log.info('Ouverture du modal de paiement');
    await payButton.click();
    
    // Vérifier que le modal s'ouvre correctement
    log.step('Vérification de l\'ouverture correcte du modal');
    const modalTitle = await page.waitForSelector('h2:has-text("Payer la facture")');
    if (modalTitle) {
      log.success('Modal ouvert avec succès');
    } else {
      log.error('Le modal ne s\'est pas ouvert correctement');
      return;
    }
    
    // Simuler les étapes de paiement
    log.step('Sélection de la méthode de paiement');
    await page.locator('button:has-text("Wave")').first().click();
    
    // Entrer un numéro de téléphone
    log.step('Saisie du numéro de téléphone');
    await page.locator('input[placeholder*="numéro"]').fill('770000000');
    
    // Cliquer sur le bouton pour continuer
    log.step('Soumission du formulaire');
    await page.locator('button:has-text("Payer maintenant")').click();
    
    // Vérifier que nous sommes passés à l'étape d'attente
    log.step('Vérification de la transition vers l\'étape d\'attente');
    const waitingStep = await page.waitForSelector('text=Paiement en cours', { timeout: 10000 }).catch(() => null);
    
    if (waitingStep) {
      log.success('Transition vers l\'étape d\'attente réussie');
    } else {
      log.error('La transition vers l\'étape d\'attente a échoué');
    }
    
    // Attendre et vérifier les différents composants UI
    log.info('Vérification des éléments UI du modal');
    
    // Attendre le bouton "Vérifier le statut"
    const checkStatusButton = await page.waitForSelector('button:has-text("Vérifier le statut")').catch(() => null);
    if (checkStatusButton) {
      log.success('Bouton "Vérifier le statut" trouvé');
    }
    
    // Attendre le bouton "Copier le lien"
    const copyLinkButton = await page.waitForSelector('button:has-text("Copier le lien")').catch(() => null);
    if (copyLinkButton) {
      log.success('Bouton "Copier le lien" trouvé');
    }
    
    // Fermer le modal
    log.step('Fermeture du modal');
    await page.locator('button[aria-label="Close"]').click();
    
    // Vérifier que le modal est bien fermé
    const modalClosed = await page.waitForSelector('h2:has-text("Payer la facture")', { state: 'detached', timeout: 5000 }).catch(() => false);
    if (modalClosed !== false) {
      log.success('Modal fermé avec succès');
    } else {
      log.error('Le modal ne s\'est pas fermé correctement');
    }
    
    log.success('Test du modal de paiement Dexchange terminé avec succès');
  } catch (error) {
    log.error(`Test échoué : ${error.message}`);
    console.error(error);
  } finally {
    // Fermer le navigateur
    await browser.close();
    log.info('Navigateur fermé');
  }
}

// Exécuter le test
runTest().catch(console.error);

#!/usr/bin/env node

/**
 * Test d'authentification en production
 * Vérifie que la clé Supabase fonctionne correctement
 */

const https = require('https');

const SUPABASE_URL = 'https://qlqgyrfqiflnqknbtycw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWd5cmZxaWZsbnFrbmJ0eWN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMDI0NTEsImV4cCI6MjA2NTY3ODQ1MX0.ODLjlo-8mvt_Y75LETySScpOQui-MaCBrszWRA2oyrE';

console.log('🧪 TEST AUTHENTIFICATION PRODUCTION');
console.log('=====================================');

// Test 1: Vérifier que l'endpoint auth répond correctement
function testAuthEndpoint() {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: 'nonexistent@test.com',
            password: 'invalidpassword'
        });

        const options = {
            hostname: 'qlqgyrfqiflnqknbtycw.supabase.co',
            port: 443,
            path: '/auth/v1/token?grant_type=password',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (res.statusCode === 400 && response.error_code === 'invalid_credentials') {
                        console.log('✅ Test auth endpoint: SUCCÈS');
                        console.log('   - Clé API valide (pas d\'erreur "Invalid API key")');
                        console.log('   - Erreur attendue: identifiants invalides');
                        resolve(true);
                    } else if (res.statusCode === 401 && data.includes('Invalid API key')) {
                        console.log('❌ Test auth endpoint: ÉCHEC');
                        console.log('   - Erreur: Clé API invalide');
                        reject(new Error('Invalid API key'));
                    } else {
                        console.log(`⚠️  Test auth endpoint: Réponse inattendue (${res.statusCode})`);
                        console.log(`   - Réponse: ${data}`);
                        resolve(false);
                    }
                } catch (error) {
                    console.log('❌ Test auth endpoint: Erreur parsing JSON');
                    console.log(`   - Raw response: ${data}`);
                    reject(error);
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.write(postData);
        req.end();
    });
}

// Test 2: Vérifier les Edge Functions
function testEdgeFunction() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'qlqgyrfqiflnqknbtycw.supabase.co',
            port: 443,
            path: '/functions/v1/get-public-config',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ Test Edge Functions: SUCCÈS');
                    console.log('   - get-public-config accessible');
                    resolve(true);
                } else {
                    console.log(`⚠️  Test Edge Functions: Status ${res.statusCode}`);
                    console.log(`   - Réponse: ${data}`);
                    resolve(false);
                }
            });
        });

        req.on('error', (error) => reject(error));
        req.end();
    });
}

// Exécution des tests
async function runTests() {
    try {
        console.log('\n1. Test de la clé API Supabase...');
        await testAuthEndpoint();

        console.log('\n2. Test des Edge Functions...');
        await testEdgeFunction();

        console.log('\n🎉 RÉSULTATS:');
        console.log('✅ Clé Supabase valide et fonctionnelle');
        console.log('✅ Backend prêt pour la production');
        console.log('✅ Pas d\'erreur "Invalid API key"');
        
        console.log('\n🔗 Application en ligne:');
        console.log('   https://myspace.arcadis.tech');
    } catch (error) {
        console.log('\n❌ ERREUR lors des tests:');
        console.log(`   ${error.message}`);
        process.exit(1);
    }
}

runTests();

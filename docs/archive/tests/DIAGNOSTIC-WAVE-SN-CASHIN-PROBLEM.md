# 🐛 DIAGNOSTIC FINAL - Source de WAVE_SN_CASHIN

## 📊 Analyse des Logs

D'après les logs fournis, le problème est clair :
```
paymentMethod: 'WAVE_SN_CASHIN'  ❌ (valeur incorrecte envoyée)
```

Alors que l'Edge Function attend :
```
paymentMethod: 'wave'  ✅ (valeur attendue)
```

## 🔍 Hypothèses

### Hypothèse 1 : Cache Navigateur
- Le navigateur utilise une version cached du code
- **Solution** : Hard refresh (Ctrl+Shift+R ou Cmd+Shift+R)

### Hypothèse 2 : Mauvais Modal Utilisé
- Un autre composant utilise encore l'ancien DexchangePaymentModal
- **Vérification** : ✅ Aucun import trouvé de DexchangePaymentModal

### Hypothèse 3 : Configuration dans WavePaymentModal
- Le `WAVE_CONFIG.serviceCode` n'est pas `'wave'`
- **Vérification** : ✅ Confirmé comme `'wave'` dans le code

### Hypothèse 4 : Transformation de Valeur
- Quelque part entre WavePaymentModal et l'API, la valeur est transformée
- **Solution** : Logs ajoutés pour tracer le parcours de la valeur

## 🧪 Tests à Effectuer

### Test 1 : Hard Refresh
```
1. Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
2. Retester le paiement
3. Observer les nouveaux logs
```

### Test 2 : Vérifier les Logs WaveModal
Avec les logs ajoutés, vous devriez voir :
```
🔍 [WaveModal] Service code utilisé: wave
🔍 [WaveModal] Paramètres envoyés: {serviceCode: "wave", ...}
```

Si vous voyez `WAVE_SN_CASHIN` dans ces logs, le problème vient de WavePaymentModal.

### Test 3 : Vérifier la Source
Si les logs WaveModal montrent `'wave'` mais l'API reçoit `'WAVE_SN_CASHIN'`, le problème vient de `invoices-payment.ts`.

## 🔧 Actions Immédiates

1. **Hard refresh** de la page
2. **Retester** le paiement
3. **Observer** les nouveaux logs dans la console
4. **Rapporter** quelle valeur apparaît dans les logs `🔍 [WaveModal]`

---

**Objectif** : Identifier où exactement `'wave'` devient `'WAVE_SN_CASHIN'`

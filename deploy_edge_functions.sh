#!/bin/bash

# Script de déploiement des Edge Functions Supabase pour les paiements
echo "🚀 Déploiement des Edge Functions de paiement..."

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Installez-le d'abord."
    exit 1
fi

# Se connecter au projet si nécessaire
echo "🔗 Vérification de la connexion au projet Supabase..."
supabase status

# Déployer les fonctions de paiement spécifiquement
echo "📦 Déploiement de initiate-payment..."
supabase functions deploy initiate-payment

echo "📦 Déploiement de payment-status..."
supabase functions deploy payment-status

echo "📦 Déploiement de get-payment-url..."
supabase functions deploy get-payment-url

echo "✅ Déploiement des fonctions de paiement terminé !"
echo "🔗 Les fonctions sont maintenant configurées pour localhost:8080"

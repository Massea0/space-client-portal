#!/bin/bash

# Script pour récupérer les informations de la base de données Supabase
# Ce script utilise la CLI Supabase à travers Docker

# Charger les variables d'environnement
set -a
source .env.supabase
set +a

echo "=== Informations Supabase pour le projet: $SUPABASE_PROJECT_REF ==="
echo ""

echo "=== Liste des Edge Functions déployées ==="
docker run --rm \
  -e SUPABASE_ACCESS_TOKEN \
  -e SUPABASE_PROJECT_REF=$SUPABASE_PROJECT_REF \
  supabase/cli:latest functions list --project-ref $SUPABASE_PROJECT_REF

echo ""
echo "=== Liste des tables dans la base de données ==="
docker run --rm \
  -e SUPABASE_ACCESS_TOKEN \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  supabase/cli:latest db dump -f tables.sql --data-only=false --schema-only=true

echo ""
echo "=== Récupération des règles RLS ==="
docker run --rm \
  -e SUPABASE_ACCESS_TOKEN \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  supabase/cli:latest db dump -f rls.sql --data-only=false --schema-only=true --include-role-authorization

echo ""
echo "=== Récupération des secrets et variables d'environnement ==="
docker run --rm \
  -e SUPABASE_ACCESS_TOKEN \
  -e SUPABASE_PROJECT_REF=$SUPABASE_PROJECT_REF \
  supabase/cli:latest secrets list --project-ref $SUPABASE_PROJECT_REF

echo ""
echo "=== Informations sur la base de données ==="
docker run --rm \
  -e SUPABASE_ACCESS_TOKEN \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  supabase/cli:latest db info

#!/bin/bash

# CPTO Super-Fast Setup
# Automatise TOUT sauf le copier-coller manuel (impossible à contourner)

clear

echo "🚀 ========================================="
echo "   KEMIA MOTORS - CPTO LAUNCH"
echo "=========================================="
echo ""
echo "⚡ Ultra-rapide: 30 secondes"
echo ""

# Étape 1: Afficher les migrations
echo "📋 Étape 1: Migrations SQL"
echo "─────────────────────────────"
echo ""
echo "Je vais ouvrir Supabase dans 3 secondes..."
echo ""
sleep 1

# Ouvrir Supabase SQL Editor
SUPABASE_URL="https://app.supabase.com/project/zvlmxsgvkdogbnnldauy/sql/new"

if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$SUPABASE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "$SUPABASE_URL" 2>/dev/null
else
  echo "Ouvre: $SUPABASE_URL"
fi

echo "✅ Supabase SQL Editor ouvert"
echo ""
echo "INSTRUCTIONS RAPIDES (30 sec):"
echo "  1. Copie TOUT le texte ci-dessous"
echo "  2. Colle dans la query Supabase"
echo "  3. Clique RUN ▶️"
echo "  4. Appuie sur Entrée ici quand c'est vert ✅"
echo ""
echo "─────────────────────────────────────────"
echo ""

# Afficher les migrations
cat migrations.sql

echo ""
echo "─────────────────────────────────────────"
echo ""
echo "⏱️  Appuie sur Entrée quand les migrations sont VERTES dans Supabase..."
read

clear

echo "🎉 ========================================="
echo "   Migrations OK!"
echo "=========================================="
echo ""
echo "⏱️  Chargement des données de démo..."
echo ""

node load-demo-data.js

clear

echo "✨ ========================================="
echo "   KEMIA MOTORS LIVE!"
echo "=========================================="
echo ""
echo "🏍️  Ride & Share"
echo ""
echo "L'app démarre maintenant..."
echo ""

npm run dev

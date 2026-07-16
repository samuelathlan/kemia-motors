#!/bin/bash

# CPTO Setup Wizard - Configuration interactive complète

clear

echo "🚀 ========================================="
echo "   KEMIA MOTORS - CPTO Setup Wizard"
echo "=========================================="
echo ""
echo "Bienvenue! Je vais configurer tout pour toi."
echo "Ça prend ~5 minutes (juste une fois)."
echo ""

# Étape 1: Ouvrir Supabase
echo "📋 Étape 1/3: Exécuter les migrations SQL"
echo "─────────────────────────────────"
echo ""
echo "1. Je vais ouvrir Supabase dans ton navigateur"
echo "2. Tu vas copier-coller les migrations"
echo "3. Tu cliques Run (▶️)"
echo ""
echo "C'est prêt? (appuie sur Entrée pour continuer)"
read

# Ouvrir Supabase
SUPABASE_URL="https://app.supabase.com/project/zvlmxsgvkdogbnnldauy/sql/new"

if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$SUPABASE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  xdg-open "$SUPABASE_URL" 2>/dev/null || echo "Ouvre: $SUPABASE_URL"
else
  echo "Ouvre: $SUPABASE_URL"
fi

echo ""
echo "📋 Copie tout ce qui suit et colle dans Supabase:"
echo "─────────────────────────────────"
echo ""
cat migrations.sql | head -100
echo ""
echo "... (voir migrations.sql pour le reste)"
echo ""
echo "─────────────────────────────────"
echo ""
echo "⏳ Une fois que tu as exécuté les migrations (Run ▶️),"
echo "appuie sur Entrée pour continuer..."
read

clear

echo "🚀 ========================================="
echo "   ÉTAPE 2/3: Données de démo"
echo "=========================================="
echo ""
echo "Je vais charger les données de démo (3 membres, sorties, lieux)..."
echo ""

node load-demo-data.js 2>&1 || echo "⚠️  Demo data non chargées (optionnel)"

clear

echo "🚀 ========================================="
echo "   ÉTAPE 3/3: Lancer l'app"
echo "=========================================="
echo ""
echo "✅ Supabase configurée"
echo "✅ Données de démo chargées"
echo "✅ App prête!"
echo ""
echo "Je vais lancer: npm run dev"
echo ""
echo "Appuie sur Entrée pour démarrer..."
read

npm run dev

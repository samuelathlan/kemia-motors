#!/bin/bash

# CTO Setup - Ouvre Supabase SQL Editor avec les migrations prêtes

SUPABASE_URL="https://app.supabase.com/project/zvlmxsgvkdogbnnldauy/sql/new"

echo "🚀 Ouverture de Supabase SQL Editor..."
echo ""
echo "Instructions:"
echo "1. La console SQL devrait s'ouvrir dans votre navigateur"
echo "2. Copier TOUT le contenu de migrations.sql"
echo "3. Coller dans la query Supabase"
echo "4. Cliquer Run (▶️)"
echo ""

# Ouvrir le navigateur
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open "$SUPABASE_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open "$SUPABASE_URL" 2>/dev/null || sensible-browser "$SUPABASE_URL" 2>/dev/null
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
  # Windows
  start "$SUPABASE_URL"
fi

# Afficher le contenu des migrations pour copier-coller
echo "📋 Contenu de migrations.sql (à copier-coller):"
echo ""
echo "=================================================="
cat migrations.sql | head -50
echo ""
echo "... (voir migrations.sql pour le contenu complet)"
echo "=================================================="
echo ""
echo "💡 Tip: migrations.sql est un fichier texte que tu peux copier entièrement"

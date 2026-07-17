Feature: Kemia Motors V3 - Itinéraires, timeline, stats, cartes, import, recherche

  Background:
    Given je suis connecté en tant que membre avec email "member@kemia.test"
    And j'accepte tous les articles de la charte
    And il existe une sortie multi-jours intitulée "Roadtrip Côte d'Azur"
    And cette sortie a 3 jours planifiés
    And chaque jour contient des notes, lieux visités, et anecdotes

  # ======= V2 FEATURES =======

  Scenario: Afficher l'itinéraire jour par jour d'une sortie multi-jours
    Given je suis sur la page de la sortie "Roadtrip Côte d'Azur"
    When je clique sur "Itinéraire"
    Then je vois le titre "Itinéraire"
    And je vois 3 jours avec les numéros (Jour 1, Jour 2, Jour 3)
    And pour chaque jour je vois:
      | Hébergement |
      | Notes du jour |
      | Lieux visités |
      | Anecdotes |
    And un bouton "✨ Résumé IA" est présent pour chaque jour

  Scenario: Générer un résumé IA pour un jour
    Given je suis sur la page itinéraire du "Jour 1"
    And le jour contient 2 notes, 3 lieux visités, et 2 anecdotes
    When je clique sur "✨ Résumé IA"
    Then un spinner de chargement s'affiche
    And après 2-3 secondes, un résumé narratif apparaît
    And le résumé contient les éléments clés (lieux, émotions, ambiance)
    And la date "Généré le [date]" apparaît sous le résumé
    And je peux cliquer sur "✨ Résumé IA" à nouveau pour régénérer

  Scenario: Timeline - vue chronologique complète
    Given je suis sur la page "Timeline"
    When la page charge
    Then je vois une liste de toutes les sorties, lieux, anecdotes triés par date décroissante
    And chaque élément affiche:
      | Type (🏍️ Sortie / 📍 Lieu / 💭 Anecdote) |
      | Titre |
      | Date |
      | Description courte |
    And il y a des boutons de filtre en haut (Tous, Sorties, Lieux, Anecdotes)
    When je clique sur "Sorties"
    Then seules les sorties sont affichées
    When je clique sur "Lieux"
    Then seuls les lieux sont affichés

  Scenario: Statistiques - KPIs et breakdown par membre
    Given je suis sur la page "Statistiques"
    When la page charge
    Then je vois 3 cartes de stats:
      | KM TOTAL | nombre |
      | SORTIES | nombre |
      | LIEUX | nombre |
    And je vois une section "Par membre" avec une carte par membre actif
    And chaque carte affiche: nom, KM, sorties, lieux
    And je vois "Progression par mois" avec des barres visuelles
    And les mois sont triés chronologiquement

  Scenario: Import GPX - télécharger une trace Calimoto
    Given je suis sur la page "Importer"
    When je sélectionne "GPX" (Traces Calimoto)
    And je sélectionne un fichier GPX valide
    Then le nom du fichier s'affiche
    When je clique sur "📤 Importer"
    Then l'app affiche "✓ GPX importé avec succès!"
    And je suis redirigé vers la carte après 2 secondes
    And une nouvelle trace GPX est visible sur la carte

  Scenario: Import KML - ajouter des lieux depuis Google My Maps
    Given je suis sur la page "Importer"
    When je sélectionne "KML" (Google My Maps)
    And je sélectionne un fichier KML valide avec 5 placemarks
    Then le nom du fichier s'affiche
    When je clique sur "📤 Importer"
    Then l'app affiche "✓ KML importé avec succès!"
    And 5 nouveaux lieux sont créés en base
    And chaque lieu affiche: nom, coordonnées, dates

  Scenario: Recherche transverse - trouver une sortie
    Given je suis sur la page "Chercher"
    When je tape "Côte d'Azur"
    Then une requête est envoyée après 300ms
    And je vois le résultat "Roadtrip Côte d'Azur" avec le type 🏍️
    And je peux cliquer sur le résultat pour aller à la sortie

  Scenario: Recherche - chercher un lieu visité
    Given je suis sur la page "Chercher"
    When je tape "Nice"
    Then les lieux contenant "Nice" s'affichent
    And pour chaque lieu je vois: nom, région, pays, date de visite

  Scenario: Recherche - chercher une anecdote
    Given je suis sur la page "Chercher"
    When je tape "motorisés"
    Then les anecdotes contenant "motorisés" s'affichent
    And chaque résultat affiche le texte de l'anecdote (max 2 lignes)

  # ======= V3 FEATURES =======

  Scenario: Cartes des pays et régions visitées
    Given je suis sur la page "Carte" (map-regions)
    When la page charge
    Then je vois:
      | Titre "Pays & régions" |
      | Section "Pays visités" avec une grille de pays |
      | Section "Régions détaillées" avec liste par région |
    And chaque région affiche:
      | Nom (ex: "Provence, France") |
      | Nombre de lieux |
      | Barre de progression |
    When je regarde les "Pays visités"
    Then chaque pays affiche le nombre total de lieux visités
    And les pays sont triés alphabétiquement

  Scenario: Export PDF - générer un carnet de voyage
    Given je suis sur la page itinéraire de "Roadtrip Côte d'Azur"
    And c'est un roadtrip multi-jours
    When je clique sur "📥 Carnet PDF"
    Then un spinner apparaît "⏳ Export..."
    And après ~1-2 secondes, un fichier HTML est téléchargé
    And le fichier s'appelle "Kemia_Roadtrip_Côte_d'Azur_2026-07-17.html"
    And le contenu inclut:
      | Titre de la sortie |
      | Dates (du - au) |
      | Description |
      | Pour chaque jour: Jour N, hébergement, notes, résumé IA |
      | Footer "Carnet de voyage Kemia Motors • Ride & Share" |

  # ======= EDGE CASES & ERRORS =======

  Scenario: Itinéraire - sortie simple (pas multi-jours)
    Given je suis sur une sortie simple (non roadtrip)
    When je vais sur "/outings/[id]/itinerary"
    Then je vois le message "Cet itinéraire n'existe que pour les roadtrips multi-jours"

  Scenario: PDF Export - bouton absent pour sortie simple
    Given je suis sur une sortie simple
    And j'accède à la page itinéraire
    Then le bouton "📥 Carnet PDF" n'est pas visible

  Scenario: Résumé IA - sans Google API key
    Given la variable `GOOGLE_API_KEY` n'est pas configurée
    And je suis sur itinéraire
    When je clique sur "✨ Résumé IA"
    Then j'obtiens l'erreur "Résumés IA non disponibles (clé API non configurée)"

  Scenario: Import - fichier invalide
    Given je suis sur la page "Importer"
    When j'essaie d'importer un fichier XML corrompu
    Then l'app affiche l'erreur "Fichier GPX/KML invalide"
    And je peux réessayer

  Scenario: Recherche - requête vide
    Given je suis sur la page "Chercher"
    When je n'ai rien tapé
    Then je vois le message "Commence à taper pour rechercher"
    And aucun résultat ne s'affiche

  Scenario: Recherche - aucun résultat
    Given je suis sur la page "Chercher"
    When je tape "XYZ_INEXISTANT_12345"
    Then je vois "Aucun résultat pour \"XYZ_INEXISTANT_12345\""

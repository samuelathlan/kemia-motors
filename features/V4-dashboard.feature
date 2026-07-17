Feature: Kemia Motors V4 - Dashboard & Homepage Redesign

  # ======= PUBLIC HOMEPAGE =======

  Scenario: Homepage - Anonymous user sees attractive landing page
    Given je ne suis pas authentifié
    When j'accède à "/home"
    Then je vois:
      | Élément | Description |
      | Logo | Kemia Motors avec image |
      | Titre | "Kemia Motors" en crème (#E8D5B0) |
      | Slogan | "Ride & Share" en orange |
      | Description | Mission du club (sorties, bonne bouffe, histoire) |
      | Bouton | "Se connecter" (orange) |
      | Bouton | "Rejoindre le club" (border) |

  Scenario: Homepage - Live statistics display correctly
    Given je suis sur "/home"
    When la page charge
    Then je vois 4 KPI cards avec:
      | KPI | Nombre | Source |
      | km parcourus | somme(gpx_tracks.distance_km) | "km parcourus" |
      | sorties | count(outings) | "sorties" |
      | lieux visités | count(visited_places) | "lieux visités" |
      | motards | count(members) WHERE statut='membre_actif' | "motards" |
    And chaque card affiche: label + nombre + subtitle

  Scenario: Homepage - Feature highlights are clear
    Given je suis sur "/home"
    When je scrolle jusqu'à "À la découverte de..."
    Then je vois 4 sections avec:
      | Titre | Icône | Description |
      | La Carte du Club | 🗺️ | Explore tous les lieux... |
      | Le Carnet de Voyage | 📖 | Lis les histoires... |
      | Les Statistiques | 📊 | Vois la progression... |
      | La Charte du Club | 🤝 | Nos valeurs fondamentales... |

  Scenario: Homepage - CTA buttons work
    Given je suis sur "/home"
    When je clique sur "Se connecter"
    Then je suis redirigé vers "/auth/login"
    Given je reviens à "/home"
    When je clique sur "Rejoindre le club"
    Then je suis redirigé vers "/invite"

  Scenario: Homepage - Fully responsive on mobile
    Given je redimensionne le viewport à 375px (mobile)
    When j'accède à "/home"
    Then:
      | Élément | État |
      | Logo | Centré, visible |
      | Stats grid | 2 colonnes max |
      | Feature cards | Stacked vertically |
      | Texte | Pas de troncature |
      | Boutons | Cibles tactiles >= 48px |
    And pas de scroll horizontal

  # ======= AUTHENTICATED DASHBOARD =======

  Scenario: Dashboard - Hero section personalizes for member
    Given je suis connecté en tant que "Test Member"
    When j'accède à "/dashboard"
    Then je vois:
      | Élément | Contenu |
      | Greeting | "Bienvenue" (petit texte) |
      | Nom | "Test Member" en crème |
      | Pseudo | "@member_test" en gris |
      | Role badge | Absent (si non-admin) |

  Scenario: Dashboard - Role badge shows for admin
    Given je suis connecté en tant que "CPTO Samuel" (super_admin)
    When j'accède à "/dashboard"
    Then je vois un badge "ADMIN" en orange

  Scenario: Dashboard - Personal stats display correctly
    Given je suis sur "/dashboard"
    And j'ai participé à 3 sorties et 250 km
    Then je vois 3 stat cards:
      | Label | Valeur | Source |
      | KM | 250 | gpx_tracks.distance_km WHERE member_id |
      | Sorties | 3 | outing_participants WHERE member_id |
      | Lieux | X | visited_places dans ces sorties |

  Scenario: Dashboard - Quick actions are accessible
    Given je suis sur "/dashboard"
    When je regarde la grille d'actions
    Then je vois 4 boutons icône:
      | Icône | Lien |
      | 🏍️ | /outings |
      | 📤 | /import |
      | 🗺️ | /map-regions |
      | 🏍️ | /motorcycles |
    And chaque bouton est cliquable

  Scenario: Dashboard - Next outing highlight shows upcoming sortie
    Given j'ai une sortie prévue pour "2026-08-15"
    When j'accède à "/dashboard"
    Then je vois une carte highlight:
      | Élément | Contenu |
      | Label | "Prochaine sortie" |
      | Titre | Titre de la sortie |
      | Description | Texte de la sortie |
      | Date | "ven. 15 août" |
      | Badge | "Roadtrip" (si multi-day) |
      | Lien | "Voir plus →" vers /outings/[id] |

  Scenario: Dashboard - No next outing = section hidden
    Given il n'y a pas de sortie prochaine
    When j'accède à "/dashboard"
    Then la carte "Prochaine sortie" n'est pas affichée

  Scenario: Dashboard - Club statistics are accurate
    Given je suis sur "/dashboard"
    When la page charge
    Then je vois 4 cards statistiques:
      | Card | Source | Visible |
      | Total KM | sum(gpx_tracks.distance_km) all users | ✓ |
      | Sorties | count(outings) | ✓ |
      | Membres | count(members) actifs | ✓ |
      | Dernier lieu | last(visited_places) by date | ✓ |

  Scenario: Dashboard - Explore section links work
    Given je suis sur "/dashboard"
    When je clique sur "Timeline"
    Then je suis redirigé vers "/timeline"
    Given je reviens
    When je clique sur "Statistiques"
    Then je suis redirigé vers "/stats"
    # ... etc for Charter et Search

  Scenario: Dashboard - Logout button signs out user
    Given je suis connecté
    And je suis sur "/dashboard"
    When je clique sur "Déconnexion"
    Then j'étais redirigé vers "/" (home)
    And j'étais logout de supabase.auth

  Scenario: Dashboard - Mobile responsive layout
    Given je redimensionne à 375px (mobile)
    When j'accède à "/dashboard"
    Then:
      | Élément | Layout |
      | Hero | Full width, no overflow |
      | Stats grid | 3 cols (KM, Sorties, Lieux) |
      | Quick actions | 2x2 grid |
      | Highlight | Full width card |
      | Club stats | 2 cols |
      | Explore | Full width cards |
    And bottom nav reste accessible

  # ======= EDGE CASES =======

  Scenario: Dashboard - Loading state shows spinners
    Given je suis en cours de chargement des stats
    When j'accède à "/dashboard"
    Then:
      | Zone | État |
      | Personal stats | "..." (trois points) |
      | Club stats | "..." |
      | Données | Se remplacent quand prêtes |

  Scenario: Dashboard - Network error handling
    Given la requête stats échoue (timeout)
    When j'accède à "/dashboard"
    Then je vois message d'erreur claire
    And le reste du dashboard reste functional

  Scenario: Homepage - Stats load asynchronously
    Given j'accède à "/home"
    When les stats API appels sont lents (2-3s)
    Then:
      | État | Visuel |
      | Initial | Cards avec "Chargement..." |
      | After load | Vrais nombres affichés |
    And pas de skeleton screens (trop basique)

  Scenario: Dashboard - Authentication check
    Given j'essaie d'accéder à "/dashboard" sans auth
    When je n'ai pas de session valide
    Then je suis redirigé vers "/auth/login"
    And le parameter "from" garde la destination

  Scenario: Dashboard - Charter check
    Given j'accède à "/dashboard"
    And mon statut est "en_attente_acceptation_charte"
    Then je suis redirigé vers "/charter"
    And je ne peux pas accéder au dashboard

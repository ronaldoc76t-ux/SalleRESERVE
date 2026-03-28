# 🎯 SPECIFICATION -SalleRESERVE
## Application Web de Réservation de Salles

---

# 1. BESOINS FONCTIONNELS

## 1.1 Utilisateurs & Rôles

| Rôle | Permissions |
|------|-------------|
| **Visiteur** | Consulter le calendrier, voir les salles disponibles |
| **Utilisateur connecté** | Réserver une salle, modifier/annuler ses réservations |
| **Administrateur** | Gérer les salles, gérer les utilisateurs, voir toutes les réservations |

## 1.2 Fonctionnalités essentielles

### 🔹 Gestion des salles
- CRUD salles (nom, capacité, équipements, photo, créneaux horaires)
- Disponibilité par jour/heure
- Catégories (réunion, Formation, événementiel)

### 🔹 Système de réservation
- Sélection date + heure début + durée
- Vérification automatique des conflits
- Confirmation par email (optionnel)
- Historique des réservations

### 🔹 Calendrier interactif
- Vue semaine / mois
- Visualisation des occupé/libre
- Code couleur par statut (confirmé, en attente, annulé)

### 🔹 Tableau de bord utilisateur
- Mes réservations à venir
- Réservations passées
- Annuler/modifier

### 🔹 Tableau de bord admin
- Vue d'ensemble des réservations
- Statistiques (taux d'occupation)
- Gestion des utilisateurs

---

# 2. BESOINS NON-FONCTIONNELS

| Critère | Exigence |
|---------|----------|
| **Performance** | Temps de réponse < 500ms |
| **Disponibilité** | 99.5% uptime |
| **Sécurité** | Auth JWT, mots de passe hashés, protection CSRF |
| **UX** | Responsive (mobile/tablet/desktop) |
| **Accessibilité** | WCAG niveau AA |

---

# 3. ARCHITECTURE LOGICIELLE

## 3.1 Stack technologique

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                             │
│  React 18 + Vite + TypeScript + Tailwind CSS          │
│  → React Router, Zustand (state), React Query         │
└─────────────────────────────────────────────────────────┘
                          ↕ API REST
┌─────────────────────────────────────────────────────────┐
│                    BACKEND                              │
│  Node.js + Express + TypeScript                       │
│  → Prisma ORM, PostgreSQL/SQLite                      │
│  → JWT Auth, Zod validation                           │
└─────────────────────────────────────────────────────────┘
```

## 3.2 Structure du projet

```
salle-reservation/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages (Home, Dashboard, Admin)
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Appels API
│   │   ├── types/         # Types TypeScript
│   │   └── stores/        # Zustand stores
│   └── ...
├── server/                 # Backend Express
│   ├── src/
│   │   ├── routes/        # Routes API
│   │   ├── controllers/   # Logique métier
│   │   ├── services/      # Services
│   │   ├── middleware/    # Auth, validation
│   │   └── prisma/        # Modèles BDD
│   └── ...
└── SPEC.md
```

## 3.3 Modèle de données

```sql
-- Utilisateurs
User {
  id, email, password, name, role (USER|ADMIN), createdAt
}

-- Salles
Room {
  id, name, capacity, description, 
  equipment (JSON), imageUrl, 
  openingHour, closingHour,
  createdAt
}

-- Réservations
Booking {
  id, userId, roomId,
  date, startTime, endTime,
  status (PENDING|CONFIRMED|CANCELLED),
  title, description,
  createdAt
}
```

---

# 4. USER STORIES

| En tant que | Je veux | Pour |
|-------------|---------|------|
| Visiteur | Voir les salles disponibles | Planifier une réservation |
| Utilisateur | Réserver une salle | Organiser une réunion |
| Utilisateur | Annuler ma réservation | Libérer le créneau si besoin |
| Administrateur | Ajouter une salle | Mettre à jour l'offre |
| Administrateur | Voir les statistiques | Optimiser l'occupation |

---

# 5. ROADMAP DÉVELOPPEMENT

## Phase 1: Fondations (Semaine 1)
- [ ] Setup projet (Vite + Express + Prisma)
- [ ] Modèle de données + migrations
- [ ] Authentification (register/login/logout)
- [ ] CRUD Salles (admin)

## Phase 2: Réservation (Semaine 2)
- [ ] Création réservation avec vérification conflits
- [ ] Liste mes réservations (utilisateur)
- [ ] Annuler/modifier réservation
- [ ] API REST complète

## Phase 3: Frontend (Semaine 3)
- [ ] Pages: Login, Register
- [ ] Dashboard utilisateur
- [ ] Calendrier hebdomadaire
- [ ] Formulaire de réservation

## Phase 4: Admin & Finalisation (Semaine 4)
- [ ] Dashboard admin
- [ ] Statistiques basiques
- [ ] Responsive design
- [ ] Tests & debug

---

# 6. API ENDPOINTS

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/rooms` | Liste des salles |
| POST | `/api/rooms` | Créer salle (admin) |
| GET | `/api/rooms/:id` | Détails salle |
| PUT | `/api/rooms/:id` | Modifier salle (admin) |
| DELETE | `/api/rooms/:id` | Supprimer salle (admin) |
| GET | `/api/bookings` | Mes réservations |
| POST | `/api/bookings` | Créer réservation |
| PUT | `/api/bookings/:id` | Modifier réservation |
| DELETE | `/api/bookings/:id` | Annuler réservation |
| GET | `/api/bookings/room/:roomId` | Réservations par salle |
| GET | `/api/admin/stats` | Statistiques (admin) |

---

# 7. LIVRABLES

1. Application fonctionnelle (MVP)
2. Code source sur GitHub
3. Documentation technique
4. Instructions installation/déploiement

---

*Spec v1.0 - SalleRESERVE*
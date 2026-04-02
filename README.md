# SalleRESERVE - Réservation de salles

## 🚀 Lancement rapide

### 1. Prérequis
- Node.js 18+ installé

### 2. Lancer l'application

```bash
# Cloner le projet (si pas déjà fait)
git clone https://github.com/ronaldoc76t-ux/SalleRESERVE.git
cd SalleRESERVE

# Installer les dépendances
cd server && npm install
cd ../client && npm install

# Lancer le backend (terminal 1)
cd server && npm run dev

# Lancer le frontend (terminal 2)
cd client && npm run dev
```

### 3. Accéder à l'app

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

### 4. Identifiants de test

| Email | Mot de passe | Rôle |
|-------|--------------|------|
| test@example.com | password123 | USER |
| admin@example.com | admin123 | ADMIN |

*(Créer un compte admin via la page d'inscription, puis modifier manuellement le rôle dans la BDD)*

---

## 📱 Fonctionnalités

- ✅ Inscription / Connexion
- ✅ Voir les salles disponibles
- ✅ Réserver une salle (avec détection de conflits)
- ✅ Dashboard utilisateur
- ✅ Panel Admin (stats, gestion)

---

## 🛠 Stack technique

| Partie | Tech |
|--------|------|
| Backend | Node.js + Express + Prisma + SQLite |
| Frontend | React + Vite + Tailwind + Zustand |
| Auth | JWT |

---

## Structure du projet

```
SalleRESERVE/
├── client/   # Frontend React (Vite)
├── server/   # Backend Node.js/Express/Prisma
└── SPEC.md   # Spécifications fonctionnelles
```

## Scripts utiles

- `npm run build` : build TypeScript (client ou server)
- `npm start` : démarre le serveur compilé (server)
- `npm run dev` : démarre en mode développement
- `npm run preview` : prévisualise le build client

---

**Bon test !** 🎉
# SalleRESERVE

SalleRESERVE est une application de gestion de réservation de salles, composée d’un serveur Node.js/Express (TypeScript, Prisma, SQLite) et d’un client React (Vite, Zustand, Tailwind).

## Fonctionnalités principales
- Authentification (utilisateur/admin)
- Réservation de salles avec gestion des conflits
- Visualisation des réservations et des salles
- Tableau de bord administrateur (statistiques, gestion utilisateurs, etc.)

## Structure du projet

```
SalleRESERVE/
├── client/   # Frontend React (Vite)
├── server/   # Backend Node.js/Express/Prisma
└── SPEC.md   # Spécifications fonctionnelles
```

## Installation

### Prérequis
- Node.js >= 18
- npm >= 9

### 1. Installation des dépendances

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configuration de la base de données

Le projet utilise SQLite (fichier `server/data.db`). Prisma est configuré pour SQLite.

Pour initialiser le client Prisma :
```bash
cd server
npx prisma generate
```

### 3. Lancer le serveur

```bash
cd server
npm run build
npm start
```

Le serveur démarre sur http://localhost:3001

### 4. Lancer le client

```bash
cd client
npm run dev
```

Le client démarre sur http://localhost:5173

## Scripts utiles

- `npm run build` : build TypeScript (client ou server)
- `npm start` : démarre le serveur compilé (server)
- `npm run dev` : démarre le client en mode développement (client)
- `npm run preview` : prévisualise le build client

## Notes
- La route GET / sur le serveur retourne un message de statut.
- Les routes API sont préfixées par `/api`.
- Voir SPEC.md pour les détails fonctionnels.

---

Pour toute question ou contribution, ouvrez une issue ou une pull request sur le repo GitHub.

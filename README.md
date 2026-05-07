# GRM — Gestion des Ressources Matérielles

Système web de gestion des ressources matérielles d'une faculté : appels d'offre, fournisseurs, inventaire et maintenance.

**Stack :** React 18 · Node.js 20 + Express · PostgreSQL 15 · JWT · Docker

---

## Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Lancement rapide avec Docker](#lancement-rapide-avec-docker-recommandé)
- [Installation manuelle (sans Docker)](#installation-manuelle-sans-docker)
- [Comptes de test](#comptes-de-test)
- [Structure du projet](#structure-du-projet)
- [API — Endpoints](#api--endpoints-principaux)
- [Documentation LaTeX](#documentation-latex)

---

## Architecture

```
┌─────────────────────┐      HTTP/REST      ┌─────────────────────┐
│   React SPA         │ ──────────────────► │  Express API        │
│   Port 3000 (dev)   │                     │  Port 5000          │
│   Port 80   (prod)  │                     │  JWT · RBAC         │
└─────────────────────┘                     └──────────┬──────────┘
                                                       │ SQL (pg)
                                            ┌──────────▼──────────┐
                                            │  PostgreSQL 15       │
                                            │  Port 5432           │
                                            └─────────────────────┘
```

---

## Prérequis

### Option A — Docker (recommandé)
| Outil | Version minimale |
|---|---|
| Docker | 24.x |
| Docker Compose | 2.x |

### Option B — Installation manuelle
| Outil | Version minimale |
|---|---|
| Node.js | 18.x LTS |
| npm | 9.x |
| PostgreSQL | 14.x |

---

## Lancement rapide avec Docker (recommandé)

### 1. Cloner le dépôt

```bash
git clone https://github.com/OnlyMD-321/driss-archi.git
cd driss-archi
```

### 2. Configurer les variables d'environnement

```bash
cp backend/.env.example backend/.env
```

Ouvrir `backend/.env` et vérifier les valeurs (les valeurs par défaut fonctionnent avec Docker Compose) :

```env
PORT=5000
DB_HOST=db
DB_PORT=5432
DB_NAME=grm_db
DB_USER=postgres
DB_PASSWORD=grm_secret_2025
JWT_SECRET=grm_jwt_super_secret_key_change_in_prod
```

### 3. Lancer tous les services

```bash
docker-compose up --build
```

> La première exécution télécharge les images et initialise la base de données automatiquement (~2-3 minutes).

### 4. Accéder à l'application

| Service | URL |
|---|---|
| Application web | http://localhost |
| API backend | http://localhost:5000/api/health |

### 5. Arrêter les services

```bash
docker-compose down
```

Pour supprimer aussi les données (volume PostgreSQL) :

```bash
docker-compose down -v
```

---

## Installation manuelle (sans Docker)

### Étape 1 — Préparer la base de données PostgreSQL

Se connecter à PostgreSQL et créer la base :

```sql
psql -U postgres

CREATE DATABASE grm_db;
\q
```

Exécuter le schéma SQL (crée les tables et insère les données de test) :

```bash
psql -U postgres -d grm_db -f backend/database/schema.sql
```

### Étape 2 — Configurer et lancer le backend

```bash
cd backend
cp .env.example .env
```

Ouvrir `backend/.env` et adapter les valeurs :

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grm_db
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe_postgres
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
```

Installer les dépendances et démarrer :

```bash
npm install
npm run dev
```

> Le serveur démarre sur **http://localhost:5000**
> Vérifier : http://localhost:5000/api/health → `{"status":"ok"}`

### Étape 3 — Lancer le frontend

Dans un **nouveau terminal** :

```bash
cd frontend
npm install
npm start
```

> L'application s'ouvre automatiquement sur **http://localhost:3000**

### Étape 4 — Vérification

Se connecter avec un compte de test (voir section suivante). Le dashboard doit afficher les statistiques.

---

## Comptes de test

> Mot de passe identique pour tous : **`admin123`**

| Email | Rôle | Accès |
|---|---|---|
| `responsable@faculte.ma` | Responsable des ressources | Accès complet |
| `chef.info@faculte.ma` | Chef de département (Informatique) | AO, ressources, pannes |
| `ahmed.benali@faculte.ma` | Enseignant | Signalement pannes, consultation |
| `tech@faculte.ma` | Technicien de maintenance | Constats de pannes |

Pour créer un compte **fournisseur**, cliquer sur *"Fournisseur ? S'inscrire"* sur la page de connexion.

---

## Parcours de test recommandé

### Scénario complet : d'un besoin à une ressource affectée

```
1. Se connecter en tant que chef.info@faculte.ma
   → Créer un appel d'offre (Tenders → Nouveau)
   → Ajouter des besoins (ordinateurs, imprimantes)

2. S'inscrire comme fournisseur (page /register-supplier)
   → Se connecter avec le compte fournisseur
   → Consulter l'appel d'offre et soumettre une offre

3. Se reconnecter en tant que responsable@faculte.ma
   → Consulter les offres reçues (Tenders → détail)
   → Accepter l'offre la moins disante

4. Créer une ressource (Resources → Nouvelle ressource)
   → Affecter la ressource au département Informatique

5. Se connecter en tant que ahmed.benali@faculte.ma
   → Signaler une panne sur la ressource (Pannes → Signaler)

6. Se connecter en tant que tech@faculte.ma
   → Rédiger un constat de panne (Pannes → détail → Rédiger constat)

7. Se reconnecter en tant que responsable@faculte.ma
   → Décider du retour fournisseur ou de la résolution
```

---

## Structure du projet

```
driss-archi/
│
├── backend/                    # API REST Node.js + Express
│   ├── server.js               # Point d'entrée
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example            # Template de configuration
│   ├── database/
│   │   └── schema.sql          # Schéma PostgreSQL + données de test
│   └── src/
│       ├── config/database.js  # Pool PostgreSQL
│       ├── middleware/auth.js  # JWT + RBAC
│       ├── controllers/        # Logique métier (7 fichiers)
│       └── routes/             # Routes REST (7 fichiers)
│
├── frontend/                   # SPA React 18
│   ├── Dockerfile
│   ├── nginx.conf              # Reverse proxy (prod)
│   ├── package.json
│   └── src/
│       ├── App.js              # Routing principal
│       ├── context/            # AuthContext (état global)
│       ├── services/api.js     # Client Axios + intercepteurs
│       ├── components/Layout/  # Sidebar + header
│       └── pages/              # 10 pages (Tenders, Resources, ...)
│
├── docs/                       # Documentation LaTeX
│   ├── specification.tex       # Document de Spécification (+15p)
│   ├── architecture_technique.tex  # Document d'Architecture (+15p)
│   ├── main.tex                # Rapport principal
│   ├── etape1_analyse.tex
│   ├── etape2_conception.tex
│   ├── etape3_architecture.tex
│   └── etape4_implementation.tex
│
├── docker-compose.yml          # Orchestration des 3 services
└── README.md
```

---

## API — Endpoints principaux

### Authentification
```
POST   /api/auth/login                    Connexion → JWT
POST   /api/auth/register-supplier        Inscription fournisseur
GET    /api/auth/profile                  Profil utilisateur connecté
```

### Appels d'offre
```
GET    /api/tenders                       Liste des appels d'offre
POST   /api/tenders                       Créer un appel d'offre
GET    /api/tenders/:id                   Détail + besoins
PATCH  /api/tenders/:id/close             Fermer un appel d'offre
```

### Offres fournisseurs
```
GET    /api/offers/tender/:id             Offres d'un appel (triées par prix)
POST   /api/offers/tender/:id             Soumettre une offre
PATCH  /api/offers/:id/accept             Accepter → rejette automatiquement les autres
PATCH  /api/offers/:id/reject             Rejeter avec motif
```

### Ressources
```
GET    /api/resources                     Inventaire complet
POST   /api/resources                     Créer une ressource
GET    /api/resources/:id                 Fiche + historique affectations + pannes
PUT    /api/resources/:id                 Modifier
DELETE /api/resources/:id                 Supprimer
POST   /api/resources/:id/assign          Affecter à un département/personne
```

### Fournisseurs
```
GET    /api/suppliers                     Liste des fournisseurs
PATCH  /api/suppliers/:id/blacklist       Mettre en liste noire (+ motif)
PATCH  /api/suppliers/:id/unblacklist     Retirer de la liste noire
```

### Pannes
```
GET    /api/breakdowns                    Liste des tickets de panne
POST   /api/breakdowns                    Signaler une panne
GET    /api/breakdowns/:id                Détail + constats
POST   /api/breakdowns/:id/maintenance-report  Constat technicien
PATCH  /api/breakdowns/:id/resolve        Résoudre
PATCH  /api/breakdowns/:id/return-to-supplier  Retourner au fournisseur
```

---

## Documentation LaTeX

Les documents se trouvent dans le dossier `docs/`. Pour les compiler :

```bash
# Installer TeX Live (Ubuntu/Debian)
sudo apt install texlive-full

# Ou MiKTeX (Windows) : https://miktex.org/

# Compiler un document
cd docs
pdflatex specification.tex
pdflatex architecture_technique.tex
```

| Fichier | Description | Pages estimées |
|---|---|---|
| `specification.tex` | Document de Spécification — acteurs, exigences, règles métier | ~18 pages |
| `architecture_technique.tex` | Document d'Architecture Technique — stack, API, DB, sécurité, déploiement | ~22 pages |

---

## Résolution des problèmes courants

**Erreur : `DB_HOST=localhost` avec Docker**
→ Dans `backend/.env`, utiliser `DB_HOST=db` (nom du service Docker Compose), pas `localhost`.

**Erreur : `port 5432 already in use`**
→ PostgreSQL local déjà démarré. Soit l'arrêter (`sudo systemctl stop postgresql`), soit changer le port dans `docker-compose.yml`.

**Erreur : `invalid token` après redémarrage du backend**
→ Le `JWT_SECRET` a changé. Se déconnecter et se reconnecter.

**Page blanche sur le frontend (prod Docker)**
→ Attendre que le build React soit terminé (`docker-compose logs frontend`).

---

## Technologies utilisées

| Couche | Technologie | Version |
|---|---|---|
| Frontend | React | 18.2 |
| Routing | React Router | v6 |
| HTTP Client | Axios | 1.6.x |
| Backend | Node.js + Express | 20 LTS + 4.18 |
| Authentification | JSON Web Token | 9.x |
| Hachage | bcrypt | 5.1 |
| Base de données | PostgreSQL | 15 |
| Driver DB | node-postgres (pg) | 8.11 |
| Proxy (prod) | Nginx | 1.25 Alpine |
| Conteneurisation | Docker + Compose | 24.x / 2.x |

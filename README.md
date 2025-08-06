# 🚛 Data Mine Camion - Gestion de Flotte de Camions

## 📋 Description

**Data Mine Camion** est une application web complète de gestion de flotte de camions pour les entreprises multi-filiales. Elle permet de suivre l'état, l'installation et la maintenance des équipements Truck4U et des tablettes dans chaque camion.

### 🎯 Objectifs du Programme

- **Gestion multi-filiales** : Chaque filiale a sa propre liste de camions
- **Suivi complet** : État des documents, installation Truck4U, équipements tablettes
- **Contrôle d'accès** : Système de rôles et permissions par filiale
- **Import de données** : Import en masse depuis des fichiers Excel
- **Interface moderne** : Interface utilisateur intuitive et responsive

## 🏗️ Architecture

### Backend
- **Node.js** avec **Express.js**
- **TypeScript** pour la sécurité des types
- **MySQL** avec **Drizzle ORM**
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe

### Frontend
- **React** avec **TypeScript**
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants

## 🔐 Système de Rôles et Permissions

### Rôles Groupe (Accès à toutes les filiales)
- **Admin Groupe** (niveau 1) : Accès complet, peut attribuer des rôles
- **Responsable Groupe** (niveau 2) : Gestion des filiales et camions
- **Lecteur Groupe** (niveau 3) : Consultation uniquement

### Rôles Filiale (Accès à une filiale spécifique)
- **Admin Filiale** (niveau 1) : Gestion complète de la filiale
- **Responsable Filiale** (niveau 2) : Gestion des camions de la filiale
- **Lecteur Filiale** (niveau 3) : Consultation des camions de la filiale

## 📊 Fonctionnalités Principales

### 🏢 Gestion des Filiales
- Création et gestion des filiales
- Informations complètes (adresse, téléphone, responsable)
- Code unique pour identification

### 🚛 Gestion des Camions
- **Informations de base** : Numéro, modèle, filiale
- **État des documents** : DA, CA, réception
- **Installation Truck4U** : Paramétrage, localisation, statut
- **Équipements tablettes** : Présence, type, IMEI, fonctionnalité
- **Matériel** : PDA, caméras, dashcam
- **Tests et validation** : Tests OK, matériel requis

### 📈 Import/Export
- Import en masse depuis fichiers Excel
- Mapping automatique des colonnes
- Validation des données
- Gestion des erreurs

### 🔍 Recherche et Filtres
- Recherche par numéro, modèle, IMEI
- Filtrage par statut
- Filtrage par filiale

## 🛠️ Installation

### Prérequis
- **Node.js** (version 18 ou supérieure)
- **MySQL** (version 8.0 ou supérieure)
- **npm** ou **yarn**

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd Data_mine_camion
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de la base de données

#### Créer la base de données MySQL
```sql
CREATE DATABASE data_mine_camion;
```

#### Configurer les variables d'environnement
Créer un fichier `.env` à la racine du projet :
```env
DATABASE_URL=mysql://root@localhost:3306/data_mine_camion
PORT=3000
NODE_ENV=development
JWT_SECRET=votre-secret-jwt-tres-securise
SESSION_SECRET=votre-secret-session
```

### 4. Initialiser la base de données
```bash
npm run db:push
```

### 5. Créer un utilisateur administrateur initial
```bash
npm run setup:admin
```

### 6. Lancer l'application
```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 🚀 Utilisation

### 1. Première connexion
- Accéder à `http://localhost:3000`
- Se connecter avec l'utilisateur administrateur créé

### 2. Configuration initiale
1. **Créer les filiales** via l'interface admin
2. **Créer les rôles** par défaut (automatique)
3. **Attribuer les permissions** aux utilisateurs

### 3. Import de données
1. Préparer un fichier Excel avec les colonnes appropriées
2. Aller dans la section "Import"
3. Sélectionner la filiale
4. Uploader le fichier
5. Vérifier les données importées

## 📁 Structure du Projet

```
Data_mine_camion/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants UI
│   │   ├── pages/         # Pages de l'application
│   │   └── lib/           # Utilitaires
├── server/                 # Backend Express
│   ├── routes.ts          # Routes API
│   ├── storage.ts         # Couche d'accès aux données
│   ├── auth.ts            # Service d'authentification
│   └── db.ts              # Configuration base de données
├── shared/                 # Code partagé
│   └── schema.ts          # Schémas de base de données
├── drizzle.config.ts       # Configuration Drizzle
└── package.json           # Dépendances et scripts
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev              # Lance le serveur de développement
npm run build            # Build pour production
npm run preview          # Prévisualise le build

# Base de données
npm run db:push          # Pousse le schéma vers la DB
npm run db:studio        # Lance Drizzle Studio
npm run db:generate      # Génère les migrations

# Administration
npm run setup:admin      # Crée un admin initial
```

## 📊 Format des Données Excel

### Colonnes Supportées
- **N° Camion** / **Numero** / **Immatriculation**
- **Modèle** / **Model** / **Type**
- **N° DA** / **DA Number**
- **Date DA** / **DA Date**
- **DA Validé** / **DA Valid**
- **N° CA** / **CA Number**
- **Date CA** / **CA Date**
- **Date Réception** / **Reception Date**
- **Validation Réception** / **Reception Valid**
- **Installé par** / **Installed by**
- **Date Installation** / **Installation Date**
- **Paramétrage Réalisé** / **Setup Done**
- **Localisation Fonctionnelle** / **Location**
- **Statut Conduite** / **Driving Status**
- **Téléchargement Mémoire Masse** / **Memory Download**
- **N° Truck4U** / **Truck4U Number**
- **Présence Tablette** / **Tablet Present**
- **Type Tablette** / **Tablet Type**
- **IMEI** / **Serial Number**
- **Tablette Fonctionnelle** / **Tablet Working**
- **Compatibilité** / **Compatibility**
- **DeliverUp** / **Application**
- **Applications Spécifiques** / **Specific Apps**
- **Raisons Non Installé** / **Install Issues**
- **Caméra Cabine** / **Cab Camera**
- **Dashcam** / **Dashboard Camera**
- **N° PDA** / **PDA Number**
- **Matériel Requis** / **Material Required**
- **Tests OK** / **Tests**
- **Actions** / **Action Required**
- **Observations** / **Comments**

## 🔒 Sécurité

- **Authentification JWT** avec expiration
- **Hashage bcrypt** des mots de passe
- **Validation Zod** des données
- **Permissions granulaires** par filiale
- **Protection CSRF** intégrée

## 🐛 Dépannage

### Problèmes courants

#### Base de données
```bash
# Vérifier la connexion MySQL
mysql -u root -p

# Recréer la base de données
DROP DATABASE data_mine_camion;
CREATE DATABASE data_mine_camion;
npm run db:push
```

#### Variables d'environnement
```bash
# Vérifier le fichier .env
cat .env

# Redémarrer après modification
npm run dev
```

#### Ports occupés
```bash
# Changer le port dans .env
PORT=3001
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation
2. Consulter les logs du serveur
3. Vérifier la configuration de la base de données

## 🔄 Versions

- **v1.0.0** : Version initiale avec gestion multi-filiales
- **v1.1.0** : Ajout du système de rôles et permissions
- **v1.2.0** : Amélioration de l'import Excel

## 📄 Licence

Ce projet est propriétaire et confidentiel. 
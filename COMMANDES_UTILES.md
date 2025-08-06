# 🔧 Commandes Utiles - Data Mine Camion

## 🚀 Lancement du Projet

### Développement
```bash
# Lancement simple
npm run dev

# Lancement avec initialisation complète
npm run dev:full

# Lancement en production
npm run build
npm start
```

### Vérifications
```bash
# Vérifier la configuration complète
npm run check:project

# Vérifier les types TypeScript
npm run type-check

# Vérifier la qualité du code
npm run lint

# Corriger automatiquement les erreurs ESLint
npm run lint:fix
```

## 🗄️ Base de Données

### Initialisation
```bash
# Pousser le schéma vers la base de données
npm run db:push

# Créer l'administrateur initial
npm run setup:admin

# Initialisation complète (DB + admin + dev)
npm run dev:full
```

### Vérification
```bash
# Vérifier la connexion à la base de données
npm run check:project
```

## 🛠️ Maintenance

### Nettoyage
```bash
# Nettoyer les fichiers de build
npm run clean

# Installation propre
npm run install:clean
```

### Build
```bash
# Build simple
npm run build

# Build avec vérifications
npm run build:check
```

## 📊 Scripts de Qualité

### TypeScript
```bash
# Vérification des types
npm run check
npm run type-check
```

### ESLint
```bash
# Vérification du code
npm run lint

# Correction automatique
npm run lint:fix
```

## 🔧 Configuration

### Variables d'environnement
```bash
# Vérifier le fichier .env
Get-Content .env

# Créer le fichier .env
echo 'DATABASE_URL="mysql://root@localhost:3306/data_mine_camion"' > .env
echo 'PORT=3001' >> .env
echo 'NODE_ENV=development' >> .env
echo 'JWT_SECRET="votre-secret-jwt-tres-securise"' >> .env
echo 'SESSION_SECRET="votre-secret-session"' >> .env
```

### Ports
```bash
# Changer le port si occupé
echo 'PORT=3002' > .env

# Vérifier les ports utilisés
netstat -ano | findstr :3001
```

## 🐛 Dépannage

### Problèmes courants
```bash
# Problème de dépendances
npm run install:clean

# Problème de base de données
npm run db:push
npm run setup:admin

# Problème de types
npm run type-check

# Problème de qualité du code
npm run lint:fix
```

### Logs
```bash
# Voir les logs du serveur
npm run dev

# Vérifier la configuration
npm run check:project
```

## 📈 Performance

### Vérification des optimisations
```bash
# Build pour voir la taille du bundle
npm run build

# Vérifier les optimisations
npm run build:check
```

## 🎯 Utilisation

### Accès à l'application
- **URL** : http://localhost:3001
- **Email** : admin@datamine.com
- **Mot de passe** : Admin123!

### Première utilisation
1. `npm run dev` - Lancer le projet
2. Ouvrir http://localhost:3001
3. Se connecter avec les identifiants admin
4. Créer les filiales
5. Importer les données Excel

## 📚 Documentation

### Fichiers de documentation
- `README.md` - Documentation complète
- `INSTALL.md` - Guide d'installation
- `DEMARRAGE.md` - Guide de démarrage
- `LANCEZ_LE_PROJET.md` - Lancement rapide
- `OPTIMISATIONS_APPLIQUEES.md` - Détail des optimisations

---

**💡 Conseil :** Utilisez `npm run dev:full` pour un lancement complet avec initialisation automatique !

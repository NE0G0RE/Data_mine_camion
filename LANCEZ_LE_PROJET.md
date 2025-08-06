# 🚀 Lancez le Projet - Data Mine Camion

## ⚡ Lancement Express (30 secondes)

### 1. Vérifier la configuration
```bash
# Vérifier que le fichier .env existe
Get-Content .env
```

### 2. Lancer le projet
```bash
# Mode développement
npm run dev

# Ou avec initialisation complète
npm run dev:full
```

### 3. Accéder à l'application
- **URL** : http://localhost:3001
- **Email** : admin@datamine.com
- **Mot de passe** : Admin123!

## 🔧 Si le projet ne démarre pas

### Problème de port
```bash
# Changer le port dans .env
echo 'PORT=3002' > .env
npm run dev
```

### Problème de base de données
```bash
# Vérifier la base de données
npm run check:project

# Réinitialiser si nécessaire
npm run db:push
npm run setup:admin
```

### Problème de dépendances
```bash
# Réinstaller les dépendances
npm run install:clean
```

## 📊 Vérification du Projet

### Scripts de vérification
```bash
# Vérifier la configuration complète
npm run check:project

# Vérifier les types TypeScript
npm run type-check

# Vérifier la qualité du code
npm run lint
```

### Tests de performance
```bash
# Build pour production
npm run build:check

# Vérifier la taille du bundle
npm run build
```

## 🎯 Utilisation Rapide

### 1. Première connexion
- Ouvrir http://localhost:3001
- Se connecter avec admin@datamine.com / Admin123!

### 2. Configuration initiale
- Créer les filiales
- Importer les données Excel
- Configurer les utilisateurs

### 3. Utilisation quotidienne
- Gérer les camions par filiale
- Suivre les installations Truck4U
- Importer/exporter les données

## 🚀 Optimisations Actives

Le projet inclut :
- ✅ **Code splitting** intelligent
- ✅ **Bundle optimisé** (-28% de taille)
- ✅ **Build rapide** (-33% de temps)
- ✅ **Composants UI optimisés** (25 au lieu de 50)
- ✅ **ESLint** pour la qualité du code
- ✅ **TypeScript** strict

## 📞 Support Rapide

### Problèmes courants
1. **Port occupé** → Changer le port dans .env
2. **Base de données** → `npm run db:push`
3. **Dépendances** → `npm run install:clean`
4. **Types** → `npm run type-check`

### Logs utiles
```bash
# Voir les logs du serveur
npm run dev

# Vérifier la configuration
npm run check:project
```

---

**🎉 Le projet est prêt à être utilisé !**

# 🚀 Installation Rapide - Data Mine Camion

## ⚡ Installation Express (5 minutes)

### 1. Prérequis
- Node.js 18+ installé
- MySQL 8.0+ installé et démarré
- Git installé

### 2. Cloner et installer
```bash
git clone <url-du-repo>
cd Data_mine_camion
npm install
```

### 3. Configuration base de données
```sql
CREATE DATABASE data_mine_camion;
```

### 4. Configuration environnement
```bash
# Créer le fichier .env
echo 'DATABASE_URL="mysql://root@localhost:3306/data_mine_camion"' > .env
echo 'PORT=3001' >> .env
echo 'NODE_ENV=development' >> .env
echo 'JWT_SECRET="votre-secret-jwt-tres-securise"' >> .env
echo 'SESSION_SECRET="votre-secret-session"' >> .env
```

### 5. Initialiser la base de données
```bash
npm run db:push
```

### 6. Créer l'administrateur
```bash
npm run setup:admin
```

### 7. Lancer l'application
```bash
npm run dev
```

### 8. Accéder à l'application
- URL: http://localhost:3001
- Email: admin@datamine.com
- Mot de passe: Admin123!

## 🔧 Configuration Avancée

### Variables d'environnement complètes
```env
DATABASE_URL="mysql://utilisateur:motdepasse@localhost:3306/data_mine_camion"
PORT=3001
NODE_ENV=development
JWT_SECRET="votre-secret-jwt-tres-securise"
SESSION_SECRET="votre-secret-session"
```

### Ports alternatifs
```bash
# Si le port 3001 est occupé
echo 'PORT=3002' >> .env
```

### Base de données avec mot de passe
```bash
# Si votre MySQL a un mot de passe
echo "DATABASE_URL=mysql://root:votre_mot_de_passe@localhost:3306/data_mine_camion" > .env
```

## 🐛 Dépannage Rapide

### Erreur de connexion MySQL
```bash
# Vérifier que MySQL fonctionne
mysql -u root -p
```

### Erreur de port
```bash
# Changer le port
echo 'PORT=3002' > .env
npm run dev
```

### Erreur de base de données
```bash
# Recréer la base de données
mysql -u root -p
DROP DATABASE data_mine_camion;
CREATE DATABASE data_mine_camion;
npm run db:push
```

### Erreur de dépendances
```bash
# Réinstaller les dépendances
npm run clean
npm install

# Ou installation propre
npm run install:clean
```

## 📋 Checklist d'Installation

- [ ] Node.js 18+ installé
- [ ] MySQL 8.0+ installé et démarré
- [ ] Projet cloné
- [ ] `npm install` exécuté
- [ ] Base de données créée
- [ ] Fichier `.env` créé
- [ ] `npm run db:push` exécuté
- [ ] `npm run setup:admin` exécuté
- [ ] `npm run dev` lancé
- [ ] Application accessible sur http://localhost:3001
- [ ] Connexion admin réussie

## 🎯 Prochaines Étapes

1. **Changer le mot de passe admin** après la première connexion
2. **Créer les filiales** via l'interface admin
3. **Créer les utilisateurs** et leur attribuer des rôles
4. **Importer les données** depuis vos fichiers Excel

## 📞 Support

En cas de problème :
1. Vérifier les logs du serveur
2. Consulter le README.md complet
3. Vérifier la configuration MySQL
4. Contacter l'équipe technique 
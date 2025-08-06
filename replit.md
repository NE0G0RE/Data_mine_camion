
# Tableau de Bord de Gestion des Camions

## Aperçu

Il s'agit d'une application web full-stack pour gérer les installations et configurations de camions. Le système suit divers aspects de l'équipement des camions, notamment la validation d'état, les installations du système Truck4U, les configurations de tablettes et l'inventaire des matériaux. Construit avec un frontend React, un backend Express.js et une base de données PostgreSQL utilisant Drizzle ORM.

## Préférences Utilisateur

Style de communication préféré : Langage simple et quotidien.

## Architecture du Système

### Architecture Frontend

**Stack Technologique** : React 18 avec TypeScript, construit en utilisant Vite comme outil de build et serveur de développement.

**Framework UI** : Utilise la bibliothèque de composants shadcn/ui construite sur les primitives Radix UI avec Tailwind CSS pour le style. Le système de design suit un schéma de couleurs neutres avec des variables CSS pour le support de thématisation.

**Gestion d'État** : 
- TanStack Query (React Query) pour la gestion d'état serveur et la mise en cache API
- React Hook Form avec validation Zod pour la gestion des formulaires
- Gestion d'état local utilisant les hooks React

**Routage** : Utilise Wouter pour un routage côté client léger.

**Structure des Composants** : 
- Architecture de composants modulaires avec des composants UI réutilisables
- Hooks personnalisés pour la détection mobile et les notifications toast
- Composants de formulaire avec validation complète

### Architecture Backend

**Stack Technologique** : Node.js avec le framework Express.js, écrit en TypeScript.

**Conception API** : Structure API RESTful avec des routes pour les opérations CRUD sur les données des camions :
- GET /api/trucks - Lister tous les camions
- GET /api/trucks/:id - Obtenir un camion unique
- POST /api/trucks - Créer un nouveau camion
- PATCH /api/trucks/:id - Mettre à jour un camion
- DELETE /api/trucks/:id - Supprimer un camion

**Couche de Données** : Pattern d'abstraction de stockage avec conception basée sur interface permettant plusieurs implémentations de stockage (inclut actuellement le stockage en mémoire pour le développement).

**Gestion des Erreurs** : Middleware de gestion des erreurs centralisé avec codes de statut HTTP appropriés et réponses d'erreur JSON.

**Fonctionnalités de Développement** : Remplacement de module à chaud avec intégration Vite, middleware de journalisation des requêtes et outils spécifiques au développement.

### Schéma de Base de Données

**Entité Principale** : Table Trucks avec des champs de suivi complets organisés en sections logiques :

- **Infos de Base** : ID (UUID), numero (identifiant unique), modele
- **Section État** : Numéros DA, dates, statuts de validation
- **Section Truck4U** : Détails d'installation, statut de configuration, état fonctionnel
- **Section Tablette** : Présence de tablette, type, IMEI, compatibilité, installations d'applications
- **Section Matériel** : Équipement caméra, numéros PDA, statut d'achèvement des tests
- **Champs d'Action** : Éléments d'action généraux et observations

**Validation des Données** : Utilise l'intégration Drizzle-Zod pour la validation d'exécution et la sécurité de type entre le schéma de base de données et la logique d'application.

### Build et Déploiement

**Développement** : Utilise tsx pour l'exécution TypeScript, Vite pour le développement frontend avec HMR
**Build de Production** : 
- Frontend : Build Vite avec optimisation des ressources statiques
- Backend : esbuild pour la création de bundle Node.js avec format ESM
**Gestion de Base de Données** : Drizzle Kit pour les migrations de schéma et les opérations de base de données

### Dépendances Externes

**Base de Données** : PostgreSQL avec connexion base de données serverless Neon
**ORM** : Drizzle ORM avec dialecte PostgreSQL pour les opérations de base de données type-safe
**Composants UI** : 
- Primitives Radix UI pour les fondations de composants accessibles
- Embla Carousel pour la fonctionnalité carousel
- Lucide React pour l'iconographie cohérente
**Gestion des Formulaires** : React Hook Form avec Hookform Resolvers pour l'intégration Zod
**Style** : Tailwind CSS avec PostCSS pour le style utility-first
**Outils de Développement** : 
- Plugins spécifiques à Replit pour l'intégration de l'environnement de développement
- TypeScript pour la sécurité de type sur toute la stack
**Utilitaires** : 
- date-fns pour la manipulation des dates
- clsx et class-variance-authority pour le style conditionnel
- nanoid pour la génération d'ID

-- Script pour ajouter la gestion des fonctionnalités et le rôle gestionnaire
-- Créé le : 2025-08-09

-- 1. Création de la table des fonctionnalités
CREATE TABLE IF NOT EXISTS `features` (
  `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `nom` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `categorie` VARCHAR(100) NOT NULL,
  `actif` BOOLEAN DEFAULT TRUE,
  `date_creation` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `date_mise_a_jour` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Création de la table de liaison entre rôles et fonctionnalités
CREATE TABLE IF NOT EXISTS `role_features` (
  `id` VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
  `role_id` VARCHAR(255) NOT NULL,
  `feature_id` VARCHAR(255) NOT NULL,
  `peut_voir` BOOLEAN DEFAULT FALSE,
  `peut_modifier` BOOLEAN DEFAULT FALSE,
  `peut_supprimer` BOOLEAN DEFAULT FALSE,
  `date_attribution` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `attribue_par` VARCHAR(255) NOT NULL,
  UNIQUE KEY `unique_role_feature` (`role_id`, `feature_id`),
  FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`feature_id`) REFERENCES `features`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Mise à jour de la table des rôles pour ajouter le rôle gestionnaire s'il n'existe pas
INSERT IGNORE INTO `roles` (`id`, `nom`, `description`, `niveau`, `type`, `actif`) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Super Admin', 'Accès complet au système', 1, 'groupe', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'Gestionnaire', 'Gestion des fonctionnalités et des accès', 2, 'groupe', TRUE),
  ('00000000-0000-0000-0000-000000000003', 'Responsable', 'Gestion des opérations', 3, 'groupe', TRUE),
  ('00000000-0000-0000-0000-000000000004', 'Utilisateur', 'Accès basique', 4, 'groupe', TRUE);

-- 4. Insertion des fonctionnalités de base
INSERT IGNORE INTO `features` (`code`, `nom`, `description`, `categorie`, `actif`) VALUES
  ('gestion_utilisateurs', 'Gestion des utilisateurs', 'Création, modification et suppression des utilisateurs', 'administration', TRUE),
  ('gestion_roles', 'Gestion des rôles', 'Création et attribution des rôles', 'administration', TRUE),
  ('gestion_fonctionnalites', 'Gestion des fonctionnalités', 'Activation/désactivation des fonctionnalités', 'administration', TRUE),
  ('import_excel', 'Import Excel', 'Importation de données depuis Excel', 'donnees', TRUE),
  ('import_google_sheets', 'Import Google Sheets', 'Importation de données depuis Google Sheets', 'donnees', TRUE),
  ('export_donnees', 'Export des données', 'Export des données au format Excel/CSV', 'donnees', TRUE),
  ('gestion_camions', 'Gestion des camions', 'Ajout, modification et suppression des camions', 'operations', TRUE),
  ('gestion_filiales', 'Gestion des filiales', 'Gestion des filiales et de leurs paramètres', 'administration', TRUE),
  ('rapports', 'Génération de rapports', 'Création et consultation des rapports', 'rapports', TRUE),
  ('tableau_bord', 'Tableau de bord', 'Accès aux tableaux de bord', 'visualisation', TRUE);

-- 5. Attribution des fonctionnalités au rôle Gestionnaire
INSERT IGNORE INTO `role_features` (`role_id`, `feature_id`, `peut_voir`, `peut_modifier`, `peut_supprimer`, `attribue_par`)
SELECT 
  '00000000-0000-0000-0000-000000000002', -- ID du rôle Gestionnaire
  f.id,
  TRUE, -- peut_voir
  TRUE, -- peut_modifier
  FALSE, -- peut_supprimer (réservé au Super Admin)
  '00000000-0000-0000-0000-000000000001' -- Attribué par Super Admin
FROM `features` f
WHERE f.code IN (
  'gestion_utilisateurs',
  'gestion_roles',
  'gestion_fonctionnalites',
  'import_excel',
  'import_google_sheets',
  'export_donnees',
  'gestion_camions',
  'gestion_filiales',
  'rapports',
  'tableau_bord'
);

-- 6. Création d'une vue pour faciliter la gestion des permissions
CREATE OR REPLACE VIEW `v_role_permissions` AS
SELECT 
  r.id AS role_id,
  r.nom AS role_nom,
  f.id AS feature_id,
  f.code AS feature_code,
  f.nom AS feature_nom,
  f.categorie AS feature_categorie,
  rf.peut_voir,
  rf.peut_modifier,
  rf.peut_supprimer,
  f.actif AS feature_active
FROM 
  `roles` r
CROSS JOIN 
  `features` f
LEFT JOIN 
  `role_features` rf ON r.id = rf.role_id AND f.id = rf.feature_id
WHERE 
  r.actif = TRUE 
  AND f.actif = TRUE;

-- 7. Mise à jour des permissions existantes pour le Super Admin (accès complet)
INSERT IGNORE INTO `role_features` (`role_id`, `feature_id`, `peut_voir`, `peut_modifier`, `peut_supprimer`, `attribue_par`)
SELECT 
  '00000000-0000-0000-0000-000000000001', -- ID du rôle Super Admin
  f.id,
  TRUE, -- peut_voir
  TRUE, -- peut_modifier
  TRUE, -- peut_supprimer
  '00000000-0000-0000-0000-000000000001' -- Auto-attribué
FROM `features` f
ON DUPLICATE KEY UPDATE 
  `peut_voir` = VALUES(`peut_voir`),
  `peut_modifier` = VALUES(`peut_modifier`),
  `peut_supprimer` = VALUES(`peut_supprimer`);

-- 8. Attribution des fonctionnalités de base au rôle Responsable
INSERT IGNORE INTO `role_features` (`role_id`, `feature_id`, `peut_voir`, `peut_modifier`, `peut_supprimer`, `attribue_par`)
SELECT 
  '00000000-0000-0000-0000-000000000003', -- ID du rôle Responsable
  f.id,
  TRUE, -- peut_voir
  TRUE, -- peut_modifier
  FALSE, -- peut_supprimer (réservé au Gestionnaire et Super Admin)
  '00000000-0000-0000-0000-000000000001' -- Attribué par Super Admin
FROM `features` f
WHERE f.code IN (
  'gestion_camions',
  'import_excel',
  'export_donnees',
  'rapports',
  'tableau_bord'
);

-- 9. Attribution des fonctionnalités de base au rôle Utilisateur
INSERT IGNORE INTO `role_features` (`role_id`, `feature_id`, `peut_voir`, `peut_modifier`, `peut_supprimer`, `attribue_par`)
SELECT 
  '00000000-0000-0000-0000-000000000004', -- ID du rôle Utilisateur
  f.id,
  TRUE, -- peut_voir
  FALSE, -- peut_modifier (lecture seule)
  FALSE, -- peut_supprimer (interdit)
  '00000000-0000-0000-0000-000000000001' -- Attribué par Super Admin
FROM `features` f
WHERE f.code IN (
  'tableau_bord'
);

-- 10. Mise à jour de la table des utilisateurs pour ajouter un champ photo de profil
ALTER TABLE `utilisateurs`
ADD COLUMN IF NOT EXISTS `photo_profil` VARCHAR(255) DEFAULT NULL AFTER `motDePasse`,
ADD COLUMN IF NOT EXISTS `preferences` JSON DEFAULT NULL AFTER `photo_profil`;

-- 11. Mise à jour de la table des permissions utilisateur pour ajouter des métadonnées
ALTER TABLE `permissions_utilisateur`
ADD COLUMN IF NOT EXISTS `date_fin` DATE DEFAULT NULL AFTER `date_attribution`,
ADD COLUMN IF NOT EXISTS `commentaire` TEXT DEFAULT NULL AFTER `date_fin`;

-- 12. Création d'un index pour améliorer les performances des requêtes de vérification des permissions
CREATE INDEX IF NOT EXISTS `idx_role_features` ON `role_features` (`role_id`, `feature_id`);
CREATE INDEX IF NOT EXISTS `idx_features_code` ON `features` (`code`);

-- Fin du script de migration

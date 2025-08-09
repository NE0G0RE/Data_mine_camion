-- Script pour mettre à jour la table trucks
-- 1. Ajouter la colonne immatriculation si elle n'existe pas
ALTER TABLE trucks 
ADD COLUMN IF NOT EXISTS immatriculation VARCHAR(255) NOT NULL AFTER filiale_id;

-- 2. Si la colonne numero existe, copier ses valeurs vers immatriculation puis la supprimer
-- Vérifier d'abord si la colonne numero existe
SET @dbname = DATABASE();
SET @tablename = "trucks";
SET @columnname = "numero";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 1",
  "SELECT 'La colonne numero n\'existe pas dans la table trucks' AS message"
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Si la colonne numero existe, copier ses valeurs vers immatriculation
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "UPDATE trucks SET immatriculation = numero WHERE immatriculation IS NULL OR immatriculation = '';",
  "SELECT 'Aucune action nécessaire : la colonne numero n\'existe pas' AS message"
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Supprimer la colonne numero si elle existe
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "ALTER TABLE trucks DROP COLUMN numero;",
  "SELECT 'La colonne numero a déjà été supprimée ou n\'existe pas' AS message"
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier la structure finale de la table
DESCRIBE trucks;

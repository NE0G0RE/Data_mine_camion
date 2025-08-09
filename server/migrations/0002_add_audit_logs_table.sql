-- Migration: Ajout de la table audit_logs
-- Up migration
BEGIN;

-- Création du type enum pour les actions d'audit
CREATE TYPE audit_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'password_change',
  'permission_grant',
  'permission_revoke',
  'role_assign',
  'role_revoke',
  'feature_toggle',
  'settings_update',
  'import_data',
  'export_data'
);

-- Création du type enum pour les types d'entités auditées
CREATE TYPE audit_entity_type AS ENUM (
  'user',
  'role',
  'feature',
  'permission',
  'truck',
  'filiale',
  'settings'
);

-- Création de la table audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  entity_type audit_entity_type,
  entity_id TEXT,
  entity_name TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Création d'index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Ajout d'un commentaire sur la table
COMMENT ON TABLE audit_logs IS 'Journal des actions utilisateur pour l''audit et la traçabilité';

-- Ajout de commentaires sur les colonnes
COMMENT ON COLUMN audit_logs.user_id IS 'Utilisateur ayant effectué l''action (peut être NULL pour les actions système)';
COMMENT ON COLUMN audit_logs.action IS 'Type d''action effectuée';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type d''entité concernée par l''action';
COMMENT ON COLUMN audit_logs.entity_id IS 'Identifiant de l''entité concernée';
COMMENT ON COLUMN audit_logs.entity_name IS 'Nom ou libellé de l''entité concernée';
COMMENT ON COLUMN audit_logs.old_values IS 'Valeurs avant modification (pour les actions de type update/delete)';
COMMENT ON COLUMN audit_logs.new_values IS 'Nouvelles valeurs (pour les actions de type create/update)';
COMMENT ON COLUMN audit_logs.ip_address IS 'Adresse IP de l''utilisateur';
COMMENT ON COLUMN audit_logs.user_agent IS 'User-Agent du navigateur de l''utilisateur';
COMMENT ON COLUMN audit_logs.metadata IS 'Métadonnées supplémentaires sur l''action';
COMMENT ON COLUMN audit_logs.created_at IS 'Date et heure de l''action';

-- Down migration (pour rollback)
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TYPE IF EXISTS audit_action;
-- DROP TYPE IF EXISTS audit_entity_type;

COMMIT;

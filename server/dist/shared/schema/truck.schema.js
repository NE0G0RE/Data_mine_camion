import { mysqlTable, varchar, text, date, int, boolean, timestamp as mysqlTimestamp } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { filiales } from './filiale.schema.js';
export const trucks = mysqlTable('trucks', {
    id: varchar('id', { length: 36 }).primaryKey().notNull().default(sql `(UUID())`),
    immatriculation: varchar('immatriculation', { length: 50 }).notNull().unique(),
    marque: varchar('marque', { length: 100 }),
    modele: varchar('modele', { length: 100 }).notNull(),
    annee: int('annee'),
    dateMiseEnService: date('date_mise_en_service'),
    dateDernierControle: date('date_dernier_controle'),
    dateProchainControle: date('date_prochain_controle'),
    kilometrage: int('kilometrage'),
    statut: varchar('statut', { length: 50 }).default('en_service'),
    filialeId: varchar('filiale_id', { length: 36 }).references(() => filiales.id, { onDelete: 'set null' }),
    photoUrl: text('photo_url'),
    commentaires: text('commentaires'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: mysqlTimestamp('created_at').default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: mysqlTimestamp('updated_at').default(sql `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
});
//# sourceMappingURL=truck.schema.js.map
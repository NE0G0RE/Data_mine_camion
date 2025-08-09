import { mysqlTable, varchar, text, datetime, boolean } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const filiales = mysqlTable('filiales', {
    id: varchar('id', { length: 255 }).primaryKey().default(sql `(UUID())`),
    nom: text('nom').notNull(),
    code: text('code').notNull().unique(),
    adresse: text('adresse'),
    ville: text('ville'),
    codePostal: text('code_postal'),
    pays: text('pays'),
    telephone: text('telephone'),
    email: text('email'),
    responsable: text('responsable'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: datetime('created_at').default(sql `CURRENT_TIMESTAMP`).notNull(),
    updatedAt: datetime('updated_at').default(sql `CURRENT_TIMESTAMP`).notNull(),
});
//# sourceMappingURL=filiale.schema.js.map
import { mysqlTable, varchar, text, boolean, date } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
export const features = mysqlTable('features', {
    id: varchar('id', { length: 255 }).primaryKey().default(sql `(UUID())`),
    name: varchar('name', { length: 255 }).notNull().unique(),
    description: text('description'),
    category: varchar('category', { length: 100 }),
    isActive: boolean('is_active').notNull().default(true),
    isSystem: boolean('is_system').notNull().default(false),
    createdAt: date('created_at').default(sql `(CURRENT_DATE)`).notNull(),
    updatedAt: date('updated_at').default(sql `(CURRENT_DATE)`).notNull(),
});
//# sourceMappingURL=feature.schema.js.map
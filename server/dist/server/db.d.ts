import mysql from 'mysql2/promise';
export declare function getConnection(): Promise<mysql.Connection>;
export declare const db: import("drizzle-orm/mysql2").MySql2Database<any> & {
    $client: mysql.Connection;
};
export declare const trucks: any, filiales: any, roles: any, utilisateurs: any, permissionsUtilisateur: any;
export type * from '../shared/schema/schema.js';
export declare function getDb(): Promise<import("drizzle-orm/mysql2").MySql2Database<any> & {
    $client: mysql.Connection;
}>;
//# sourceMappingURL=db.d.ts.map
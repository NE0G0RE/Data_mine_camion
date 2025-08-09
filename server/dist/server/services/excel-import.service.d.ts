export declare const statusConduite: readonly ["fonctionnel", "non_fonctionnel", "test_requis"];
export declare const statusPresence: readonly ["oui", "non", "na"];
export declare const statusCompatibilite: readonly ["compatible", "incompatible", "test_requis"];
export declare const statusTests: readonly ["oui", "non", "en_cours"];
export declare const statusApp: readonly ["installe", "non_installe", "erreur"];
export type StatusConduite = typeof statusConduite[number];
export type StatusPresence = typeof statusPresence[number];
export type StatusCompatibilite = typeof statusCompatibilite[number];
export type StatusTests = typeof statusTests[number];
export type StatusApp = typeof statusApp[number];
export interface ImportOptions {
    fieldMapping: FieldMapping;
    defaultFilialeId?: string;
    skipMissingFields?: boolean;
    requireFiliale?: boolean;
}
export interface FieldMapping {
    immatriculation: string[];
    modele: string[];
    filiale: string[];
    imei: string[];
    numeroTruck4U: string[];
    statutConduite: string[];
    equipement: string[];
    compatibilite: string[];
    deliverup: string[];
    testsOK: string[];
    commentaires: string[];
}
export declare const defaultFieldMapping: FieldMapping;
export declare const defaultImportOptions: ImportOptions;
export interface ExcelRow {
    [key: string]: string | undefined;
}
export interface ImportResult {
    success: boolean;
    results: Array<{
        status: 'inserted' | 'updated';
        immatriculation: string;
    }>;
    errors: Array<{
        row: number;
        error: string;
    }>;
    total: number;
    processed: number;
    failed: number;
}
export declare function importExcelFile(buffer: Buffer, fieldMapping?: FieldMapping): Promise<ImportResult>;
//# sourceMappingURL=excel-import.service.d.ts.map
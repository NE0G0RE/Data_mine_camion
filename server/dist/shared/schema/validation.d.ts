import { z } from 'zod';
export declare const UserRole: {
    readonly ADMIN: "admin";
    readonly MANAGER: "manager";
    readonly USER: "user";
    readonly VIEWER: "viewer";
};
export type UserRole = typeof UserRole[keyof typeof UserRole];
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortOrder: "asc" | "desc";
    sortBy?: string | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const userSchema: z.ZodObject<{
    email: z.ZodString;
    username: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["admin", "manager", "user", "viewer"]>>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    username: string;
    password: string;
    isActive: boolean;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: "user" | "admin" | "manager" | "viewer" | undefined;
}, {
    email: string;
    username: string;
    password: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    isActive?: boolean | undefined;
    role?: "user" | "admin" | "manager" | "viewer" | undefined;
}>;
export declare const truckSchema: z.ZodObject<{
    immatriculation: z.ZodString;
    marque: z.ZodOptional<z.ZodString>;
    modele: z.ZodString;
    annee: z.ZodOptional<z.ZodNumber>;
    dateMiseEnService: z.ZodOptional<z.ZodString>;
    dateDernierControle: z.ZodOptional<z.ZodString>;
    dateProchainControle: z.ZodOptional<z.ZodString>;
    kilometrage: z.ZodOptional<z.ZodNumber>;
    statut: z.ZodOptional<z.ZodEnum<["en_service", "en_maintenance", "hors_service"]>>;
    filialeId: z.ZodOptional<z.ZodString>;
    photoUrl: z.ZodOptional<z.ZodString>;
    commentaires: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    immatriculation: string;
    modele: string;
    filialeId?: string | undefined;
    marque?: string | undefined;
    annee?: number | undefined;
    dateMiseEnService?: string | undefined;
    dateDernierControle?: string | undefined;
    dateProchainControle?: string | undefined;
    kilometrage?: number | undefined;
    statut?: "en_service" | "en_maintenance" | "hors_service" | undefined;
    photoUrl?: string | undefined;
    commentaires?: string | undefined;
}, {
    immatriculation: string;
    modele: string;
    filialeId?: string | undefined;
    marque?: string | undefined;
    annee?: number | undefined;
    dateMiseEnService?: string | undefined;
    dateDernierControle?: string | undefined;
    dateProchainControle?: string | undefined;
    kilometrage?: number | undefined;
    statut?: "en_service" | "en_maintenance" | "hors_service" | undefined;
    photoUrl?: string | undefined;
    commentaires?: string | undefined;
}>;
export declare const filialeSchema: z.ZodObject<{
    nom: z.ZodString;
    code: z.ZodString;
    adresse: z.ZodOptional<z.ZodString>;
    ville: z.ZodOptional<z.ZodString>;
    codePostal: z.ZodOptional<z.ZodString>;
    pays: z.ZodOptional<z.ZodString>;
    telephone: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    responsable: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    code: string;
    nom: string;
    isActive: boolean;
    email?: string | undefined;
    adresse?: string | undefined;
    telephone?: string | undefined;
    responsable?: string | undefined;
    ville?: string | undefined;
    codePostal?: string | undefined;
    pays?: string | undefined;
}, {
    code: string;
    nom: string;
    email?: string | undefined;
    adresse?: string | undefined;
    telephone?: string | undefined;
    responsable?: string | undefined;
    isActive?: boolean | undefined;
    ville?: string | undefined;
    codePostal?: string | undefined;
    pays?: string | undefined;
}>;
export declare const roleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const featureSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isActive: boolean;
    description?: string | undefined;
    category?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    category?: string | undefined;
}>;
export declare const permissionSchema: z.ZodObject<{
    roleId: z.ZodString;
    featureId: z.ZodString;
    canView: z.ZodDefault<z.ZodBoolean>;
    canCreate: z.ZodDefault<z.ZodBoolean>;
    canEdit: z.ZodDefault<z.ZodBoolean>;
    canDelete: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    roleId: string;
    featureId: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canCreate: boolean;
}, {
    roleId: string;
    featureId: string;
    canView?: boolean | undefined;
    canEdit?: boolean | undefined;
    canDelete?: boolean | undefined;
    canCreate?: boolean | undefined;
}>;
export declare const validation: {
    UserRole: {
        readonly ADMIN: "admin";
        readonly MANAGER: "manager";
        readonly USER: "user";
        readonly VIEWER: "viewer";
    };
    paginationSchema: z.ZodObject<{
        page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
        sortBy: z.ZodOptional<z.ZodString>;
        sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        sortOrder: "asc" | "desc";
        sortBy?: string | undefined;
    }, {
        limit?: number | undefined;
        page?: number | undefined;
        sortBy?: string | undefined;
        sortOrder?: "asc" | "desc" | undefined;
    }>;
    userSchema: z.ZodObject<{
        email: z.ZodString;
        username: z.ZodString;
        password: z.ZodString;
        firstName: z.ZodOptional<z.ZodString>;
        lastName: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodEnum<["admin", "manager", "user", "viewer"]>>;
        isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        username: string;
        password: string;
        isActive: boolean;
        firstName?: string | undefined;
        lastName?: string | undefined;
        role?: "user" | "admin" | "manager" | "viewer" | undefined;
    }, {
        email: string;
        username: string;
        password: string;
        firstName?: string | undefined;
        lastName?: string | undefined;
        isActive?: boolean | undefined;
        role?: "user" | "admin" | "manager" | "viewer" | undefined;
    }>;
    truckSchema: z.ZodObject<{
        immatriculation: z.ZodString;
        marque: z.ZodOptional<z.ZodString>;
        modele: z.ZodString;
        annee: z.ZodOptional<z.ZodNumber>;
        dateMiseEnService: z.ZodOptional<z.ZodString>;
        dateDernierControle: z.ZodOptional<z.ZodString>;
        dateProchainControle: z.ZodOptional<z.ZodString>;
        kilometrage: z.ZodOptional<z.ZodNumber>;
        statut: z.ZodOptional<z.ZodEnum<["en_service", "en_maintenance", "hors_service"]>>;
        filialeId: z.ZodOptional<z.ZodString>;
        photoUrl: z.ZodOptional<z.ZodString>;
        commentaires: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        immatriculation: string;
        modele: string;
        filialeId?: string | undefined;
        marque?: string | undefined;
        annee?: number | undefined;
        dateMiseEnService?: string | undefined;
        dateDernierControle?: string | undefined;
        dateProchainControle?: string | undefined;
        kilometrage?: number | undefined;
        statut?: "en_service" | "en_maintenance" | "hors_service" | undefined;
        photoUrl?: string | undefined;
        commentaires?: string | undefined;
    }, {
        immatriculation: string;
        modele: string;
        filialeId?: string | undefined;
        marque?: string | undefined;
        annee?: number | undefined;
        dateMiseEnService?: string | undefined;
        dateDernierControle?: string | undefined;
        dateProchainControle?: string | undefined;
        kilometrage?: number | undefined;
        statut?: "en_service" | "en_maintenance" | "hors_service" | undefined;
        photoUrl?: string | undefined;
        commentaires?: string | undefined;
    }>;
    filialeSchema: z.ZodObject<{
        nom: z.ZodString;
        code: z.ZodString;
        adresse: z.ZodOptional<z.ZodString>;
        ville: z.ZodOptional<z.ZodString>;
        codePostal: z.ZodOptional<z.ZodString>;
        pays: z.ZodOptional<z.ZodString>;
        telephone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        responsable: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        nom: string;
        isActive: boolean;
        email?: string | undefined;
        adresse?: string | undefined;
        telephone?: string | undefined;
        responsable?: string | undefined;
        ville?: string | undefined;
        codePostal?: string | undefined;
        pays?: string | undefined;
    }, {
        code: string;
        nom: string;
        email?: string | undefined;
        adresse?: string | undefined;
        telephone?: string | undefined;
        responsable?: string | undefined;
        isActive?: boolean | undefined;
        ville?: string | undefined;
        codePostal?: string | undefined;
        pays?: string | undefined;
    }>;
    roleSchema: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        isActive: boolean;
        description?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
        isActive?: boolean | undefined;
    }>;
    featureSchema: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        category: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        isActive: boolean;
        description?: string | undefined;
        category?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
        isActive?: boolean | undefined;
        category?: string | undefined;
    }>;
    permissionSchema: z.ZodObject<{
        roleId: z.ZodString;
        featureId: z.ZodString;
        canView: z.ZodDefault<z.ZodBoolean>;
        canCreate: z.ZodDefault<z.ZodBoolean>;
        canEdit: z.ZodDefault<z.ZodBoolean>;
        canDelete: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        roleId: string;
        featureId: string;
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canCreate: boolean;
    }, {
        roleId: string;
        featureId: string;
        canView?: boolean | undefined;
        canEdit?: boolean | undefined;
        canDelete?: boolean | undefined;
        canCreate?: boolean | undefined;
    }>;
};
//# sourceMappingURL=validation.d.ts.map
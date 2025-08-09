export interface UserPermissions {
    utilisateurId: string;
    roles: Array<{
        roleId: string;
        roleNom: string;
        niveau: number;
        type: string;
        filialeId?: string;
        filialeNom?: string;
    }>;
    isAdmin: boolean;
    accessibleFiliales: string[];
}
export declare class AuthService {
    authenticateUser(email: string, password: string): Promise<Utilisateur | null>;
    generateToken(userId: string): string;
    verifyToken(token: string): {
        userId: string;
    } | null;
    getUserPermissions(userId: string): Promise<UserPermissions>;
    canAccessFiliale(userId: string, filialeId: string): Promise<boolean>;
    canAssignRoles(userId: string): Promise<boolean>;
    canManageFiliale(userId: string, filialeId: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
    authenticateToken(token: string): Promise<Utilisateur | null>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.d.ts.map
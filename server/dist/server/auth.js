import { getDb, roles, utilisateurs, permissionsUtilisateur, filiales } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export class AuthService {
    // Authentification
    async authenticateUser(email, password) {
        const db = await getDb();
        const user = await db.select().from(utilisateurs).where(eq(utilisateurs.email, email)).limit(1);
        if (user.length === 0)
            return null;
        const isValid = await bcrypt.compare(password, user[0].motDePasse);
        return isValid ? user[0] : null;
    }
    // Générer un token JWT
    generateToken(userId) {
        const secret = process.env.JWT_SECRET || "your-secret-key";
        return jwt.sign({ userId }, secret, { expiresIn: "24h" });
    }
    // Vérifier un token JWT
    verifyToken(token) {
        try {
            const secret = process.env.JWT_SECRET || "your-secret-key";
            return jwt.verify(token, secret);
        }
        catch {
            return null;
        }
    }
    // Récupérer les permissions d'un utilisateur
    async getUserPermissions(userId) {
        const db = await getDb();
        // Récupérer toutes les permissions actives de l'utilisateur
        const permissions = await db
            .select({
            permissionId: permissionsUtilisateur.id,
            roleId: permissionsUtilisateur.roleId,
            filialeId: permissionsUtilisateur.filialeId,
            roleNom: roles.nom,
            roleNiveau: roles.niveau,
            roleType: roles.type,
            filialeNom: filiales.nom,
        })
            .from(permissionsUtilisateur)
            .innerJoin(roles, eq(permissionsUtilisateur.roleId, roles.id))
            .leftJoin(filiales, eq(permissionsUtilisateur.filialeId, filiales.id))
            .where(and(eq(permissionsUtilisateur.utilisateurId, userId), eq(permissionsUtilisateur.actif, true), eq(roles.actif, true)));
        const userRoles = permissions.map(p => ({
            roleId: p.roleId,
            roleNom: p.roleNom,
            niveau: p.roleNiveau,
            type: p.roleType,
            filialeId: p.filialeId || undefined,
            filialeNom: p.filialeNom || undefined,
        }));
        // Déterminer si l'utilisateur est admin (niveau 1)
        const isAdmin = userRoles.some(r => r.niveau === 1);
        // Récupérer les filiales accessibles
        const accessibleFiliales = [];
        for (const role of userRoles) {
            if (role.type === "groupe") {
                // Les rôles groupe donnent accès à toutes les filiales
                const allFiliales = await db.select({ id: filiales.id }).from(filiales).where(eq(filiales.actif, true));
                accessibleFiliales.push(...allFiliales.map(f => f.id));
            }
            else if (role.type === "filiale" && role.filialeId) {
                // Les rôles filiale donnent accès à une filiale spécifique
                accessibleFiliales.push(role.filialeId);
            }
        }
        // Supprimer les doublons
        const uniqueFiliales = [...new Set(accessibleFiliales)];
        return {
            utilisateurId: userId,
            roles: userRoles,
            isAdmin,
            accessibleFiliales: uniqueFiliales,
        };
    }
    // Vérifier si un utilisateur a accès à une filiale
    async canAccessFiliale(userId, filialeId) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.accessibleFiliales.includes(filialeId);
    }
    // Vérifier si un utilisateur peut attribuer des rôles
    async canAssignRoles(userId) {
        const permissions = await this.getUserPermissions(userId);
        return permissions.isAdmin;
    }
    // Vérifier si un utilisateur peut gérer une filiale spécifique
    async canManageFiliale(userId, filialeId) {
        const permissions = await this.getUserPermissions(userId);
        // Les admins peuvent tout gérer
        if (permissions.isAdmin)
            return true;
        // Vérifier si l'utilisateur a un rôle de niveau 2 (responsable) pour cette filiale
        const hasResponsableRole = permissions.roles.some(r => r.niveau === 2 && r.filialeId === filialeId);
        return hasResponsableRole;
    }
    // Créer un hash de mot de passe
    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }
    // Middleware pour vérifier l'authentification
    async authenticateToken(token) {
        const payload = this.verifyToken(token);
        if (!payload)
            return null;
        const db = await getDb();
        const user = await db.select().from(utilisateurs).where(eq(utilisateurs.id, payload.userId)).limit(1);
        return user.length > 0 ? user[0] : null;
    }
}
export const authService = new AuthService();
//# sourceMappingURL=auth.js.map
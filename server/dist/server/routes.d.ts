import type { Express } from "express";
import { type Server } from "http";
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                roleId: string;
                isAdmin: boolean;
                isManager: boolean;
                permissions?: Record<string, boolean>;
            };
        }
    }
}
export declare function registerRoutes(app: Express): Promise<Server>;
//# sourceMappingURL=routes.d.ts.map
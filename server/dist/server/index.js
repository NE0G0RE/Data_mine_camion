import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from 'cors';
import path from "path";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { auditMiddleware, auditFailedLogin, auditUnauthorizedAccess } from "./middleware/audit.middleware";
const app = express();
// Configuration CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5002', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// Middleware d'audit
app.use(auditMiddleware());
app.use(auditFailedLogin());
app.use(auditUnauthorizedAccess());
// Middleware de débogage pour les requêtes entrantes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    next();
});
// Serve static files from the uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir, {
    setHeaders: (res) => {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
}));
// Middleware de journalisation des requêtes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    if (Object.keys(req.body).length > 0) {
        console.log('Body:', JSON.stringify(req.body, null, 2));
    }
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse = undefined;
    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        console.log(`[${new Date().toISOString()}] Response:`, JSON.stringify(bodyJson, null, 2));
        return originalResJson.apply(res, [bodyJson, ...args]);
    };
    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }
            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }
            log(logLine);
        }
    });
    next();
});
(async () => {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
        const status = err.status || err.statusCode || 500;
        const message = err.message || "Internal Server Error";
        res.status(status).json({ message });
        throw err;
    });
    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
        await setupVite(app, server);
    }
    else {
        serveStatic(app);
    }
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    // Utiliser le port 5001 pour correspondre à la configuration du proxy Vite
    const port = parseInt(process.env.PORT || '5001', 10);
    // Écouter sur toutes les interfaces réseau (0.0.0.0) au lieu de localhost
    server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port}`);
    });
})();
//# sourceMappingURL=index.js.map
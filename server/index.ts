import express from "express";
import path from "path";
import { config } from "./config/index.js";
import { registerRoutes } from "./routes.js";
import { registerAuthRoutes } from "./routes/auth.js";

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", config.cors.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Routes API
registerAuthRoutes(app);
registerRoutes(app);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static files in production
if (config.nodeEnv === "production") {
  app.use(express.static(path.join(process.cwd(), "dist/client")));
  
  // Serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(process.cwd(), "dist/client/index.html"));
    }
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Erreur serveur:", err);
  res.status(500).json({ message: "Erreur interne du serveur" });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "Route API non trouvée" });
});

const server = app.listen(config.port, () => {
  console.log(`🚀 Serveur démarré sur le port ${config.port}`);
  console.log(`📊 Environnement: ${config.nodeEnv}`);
  console.log(`🔗 URL: http://localhost:${config.port}`);
});

export { app, server };

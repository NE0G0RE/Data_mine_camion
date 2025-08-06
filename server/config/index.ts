import "dotenv/config";

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  database: {
    url: process.env.DATABASE_URL || "mysql://root@localhost:3306/data_mine_camion",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-jwt-tres-securise",
    expiresIn: "24h",
  },
  session: {
    secret: process.env.SESSION_SECRET || "votre-secret-session",
  },
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
} as const; 
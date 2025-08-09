import express from "express";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
let vite = null;
let viteLogger = console;
if (process.env.NODE_ENV === 'development') {
    import('vite').then(viteModule => {
        const { createServer, createLogger } = viteModule;
        viteLogger = createLogger();
        // The Vite server will be created in setupVite
    }).catch(err => {
        console.error('Failed to load Vite in development mode:', err);
    });
}
export function log(message, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
}
export async function setupVite(app, server) {
    if (process.env.NODE_ENV === 'development') {
        try {
            const { createServer } = await import('vite');
            const devServer = await createServer({
                root: path.join(process.cwd(), 'client'),
                server: {
                    middlewareMode: true,
                    hmr: { server },
                },
                appType: 'custom'
            });
            app.use(devServer.middlewares);
            vite = devServer;
        }
        catch (err) {
            console.error('Failed to start Vite dev server:', err);
            process.exit(1);
        }
    }
    // In production, we'll serve static files directly
    app.use("*", async (req, res, next) => {
        const url = req.originalUrl;
        try {
            const clientTemplate = path.resolve(process.cwd(), 'dist/client', 'index.html');
            // Read the built index.html
            let template = await fs.promises.readFile(clientTemplate, "utf-8");
            // In development, let Vite handle the transform
            if (process.env.NODE_ENV !== 'development') {
                template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
            }
            if (vite) {
                // In development, use Vite's transform
                const page = await vite.transformIndexHtml(url, template);
                res.status(200).set({ "Content-Type": "text/html" }).end(page);
            }
            else {
                // In production, serve the template as is
                res.status(200).set({ "Content-Type": "text/html" }).end(template);
            }
        }
        catch (e) {
            vite.ssrFixStacktrace(e);
            next(e);
        }
    });
}
export function serveStatic(app) {
    const distPath = path.resolve(import.meta.dirname, "public");
    if (!fs.existsSync(distPath)) {
        throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
    }
    app.use(express.static(distPath));
    // fall through to index.html if the file doesn't exist
    app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
    });
}
//# sourceMappingURL=vite.js.map
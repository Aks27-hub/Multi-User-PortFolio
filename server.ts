import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { register, login, authenticateToken } from "./server/auth.js";
import {
  getProfile,
  upsertProfile,
  getProjects,
  createProject,
  deleteProject,
  getExperiences,
  createExperience,
  deleteExperience,
  getPublicPortfolio,
} from "./server/portfolio.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON and URL-encoded body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  console.log("[Server] Registering API endpoints...");

  // --- PUBLIC AUTH API ---
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);

  // --- PRIVATE PORTFOLIO CRUD API (Authenticated) ---
  app.get("/api/portfolio/profile", authenticateToken as any, getProfile as any);
  app.post("/api/portfolio/profile", authenticateToken as any, upsertProfile as any);
  
  app.get("/api/portfolio/projects", authenticateToken as any, getProjects as any);
  app.post("/api/portfolio/projects", authenticateToken as any, createProject as any);
  app.delete("/api/portfolio/projects/:id", authenticateToken as any, deleteProject as any);

  app.get("/api/portfolio/experiences", authenticateToken as any, getExperiences as any);
  app.post("/api/portfolio/experiences", authenticateToken as any, createExperience as any);
  app.delete("/api/portfolio/experiences/:id", authenticateToken as any, deleteExperience as any);

  // --- PUBLIC PORTFOLIO VIEW API ---
  app.get("/api/:username", getPublicPortfolio);

  // --- VITE MIDDLEWARE / STATIC ASSETS ---
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Starting in DEVELOPMENT mode. Mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Starting in PRODUCTION mode. Serving pre-compiled static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Success! Application running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("[Server] Critical startup failure:", error);
});

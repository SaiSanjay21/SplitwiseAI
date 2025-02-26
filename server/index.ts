import express from "express";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

(async () => {
  const server = app.listen({
    port: 5000,
    host: "0.0.0.0",
    reusePort: true,
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  log(`serving on port 5000`);
})();
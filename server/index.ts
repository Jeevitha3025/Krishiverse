import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
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

// --- Start of New/Corrected Code ---

const port = parseInt(process.env.PORT || '3000', 10);
const host = '127.0.0.1';

// Set up all your project's routes
registerRoutes(app);

// Set up the error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
});

// Set up Vite for development or serve static files for production
// This must be done AFTER all other routes are registered.
if (process.env.NODE_ENV === "development") {
  // Pass the original app object to Vite
  setupVite(app);
} else {
  serveStatic(app);
}

// Start the server using the standard and reliable app.listen()
app.listen(port, host, () => {
  log(`✅ Server is running and listening at http://${host}:${port}`);
});
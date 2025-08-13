import express from "express";
import { registerRoutes } from "../server/routes";
import { mlEngine } from "../server/ml-engine";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    try {
      await mlEngine.initialize();
    } catch (err) {
      console.error("ML Engine initialization failed:", (err as Error).message);
    }
    try {
      // Attach all API routes to this Express app
      await registerRoutes(app as unknown as any);
    } catch (err) {
      console.error("Failed to register routes:", (err as Error).message);
    }
    initialized = true;
  }
}

// Lazy-init on first request (compatible with serverless cold starts)
app.use(async (req, _res, next) => {
  if (!initialized) {
    await ensureInitialized();
  }
  // For serverless rewrites, Vercel passes path in query sometimes
  if (req.query && typeof req.query.path === 'string') {
    req.url = req.query.path;
  }
  next();
});

export default app;


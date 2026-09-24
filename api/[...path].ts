// Vercel Serverless Function entry point. Any request to /api/* (catch-all,
// via the [...path] filename convention) is handled by the same Express app
// used for local dev and traditional Node hosting — no route duplication.
// Express apps are valid (req, res) handlers, so exporting it directly as the
// default export is all Vercel's Node runtime needs.
import { app } from '../server/app.js';

export default app;

import express, { Request, Response } from 'express';
import path from 'path';
import { app } from './server/app.js';

const PORT = 3000;

// -------------------------------------------------------------
// VITE MIDDLEWARE (DEV) & STATIC SERVING (PROD)
// -------------------------------------------------------------
async function initServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TREND STREET server running on http://0.0.0.0:${PORT}`);
  });
}

initServer();

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function devResendApiPlugin() {
  return {
    name: 'dev-resend-api',
    configureServer(server) {
      server.middlewares.use('/api/send-email', async (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const env = loadEnv('', process.cwd(), '');
              const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;
              if (!apiKey) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'RESEND_API_KEY is not defined in environment' }));
                return;
              }
              const fromAddress = payload.from || 'FirstPlay <onboarding@resend.dev>';

              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${apiKey}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  from: fromAddress,
                  to: Array.isArray(payload.to) ? payload.to : [payload.to],
                  subject: payload.subject,
                  html: payload.html,
                  text: payload.text
                })
              });

              const data = await resendResponse.json();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = resendResponse.status;
              res.end(JSON.stringify(data));
            } catch (err) {
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devResendApiPlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
    chunkSizeWarningLimit: 1200
  }
});

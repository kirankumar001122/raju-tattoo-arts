import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

// Serve static assets from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// SPA Client-side routing fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Production frontend server running on http://${HOST}:${PORT}`);
});

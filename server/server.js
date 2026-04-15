const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const app        = express();
const port       = 3001;
const API_SECRET = process.env.VITE_ADMIN_PASSWORD;
const CONTENT_FILE = path.join(__dirname, 'content.json');

if (!API_SECRET) {
  console.warn('⚠  VITE_ADMIN_PASSWORD nicht gesetzt — /api/content ist ungeschützt');
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

/* ── Auth ────────────────────────────────────────────────────────── */
function requireAuth(req, res, next) {
  const token = (req.headers.authorization ?? '').replace('Bearer ', '');
  if (API_SECRET && token !== API_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

/* ── Planets (unverändert) ───────────────────────────────────────── */
app.get('/api/planets', (req, res) => {
  const planets = require('./planets.json');
  res.json(planets);
});

/* ── Content: lesen ──────────────────────────────────────────────── */
app.get('/api/content', (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_FILE)) return res.json(null);
    res.json(JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')));
  } catch (err) {
    console.error('content.json lesen fehlgeschlagen:', err);
    res.status(500).json({ error: 'Lesefehler' });
  }
});

/* ── Content: schreiben (Auth) ───────────────────────────────────── */
app.put('/api/content', requireAuth, (req, res) => {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    console.error('content.json schreiben fehlgeschlagen:', err);
    res.status(500).json({ error: 'Schreibfehler' });
  }
});

/* ── Static ──────────────────────────────────────────────────────── */
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Server läuft auf http://127.0.0.1:${port}`);
});

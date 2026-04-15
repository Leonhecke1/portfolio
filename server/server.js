const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const Database = require('better-sqlite3');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const app          = express();
const port         = 3001;
const JWT_SECRET   = process.env.JWT_SECRET || 'change-me-in-production';
const CONTENT_FILE = path.join(__dirname, 'content.json');

/* ── Database ────────────────────────────────────────────────────── */
const db = new Database(path.join(__dirname, 'db.sqlite'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

/* ── Middleware ──────────────────────────────────────────────────── */
app.use(cors());
app.use(express.json({ limit: '1mb' }));

function requireAuth(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Nicht angemeldet' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token ungültig oder abgelaufen' });
  }
}

/* ── Auth: Setup-Status ──────────────────────────────────────────── */
app.get('/api/auth/setup-required', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as n FROM users').get();
  res.json({ required: count.n === 0 });
});

/* ── Auth: Ersten Admin anlegen (nur wenn noch kein User existiert) ─ */
app.post('/api/auth/setup', async (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as n FROM users').get();
  if (count.n > 0) {
    return res.status(403).json({ error: 'Setup bereits abgeschlossen' });
  }

  const { username, password } = req.body ?? {};
  if (!username || !password || password.length < 8) {
    return res.status(400).json({ error: 'Benutzername und Passwort (min. 8 Zeichen) erforderlich' });
  }

  const hash = await bcrypt.hash(password, 12);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run(username, hash);

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

/* ── Auth: Login ─────────────────────────────────────────────────── */
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    // Gleiche Antwortzeit wie bei falschem Passwort (Timing-Schutz)
    await bcrypt.compare(password, '$2a$12$invalidhashfortimingprotection000000000000000000000');
    return res.status(401).json({ error: 'Benutzername oder Passwort falsch' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Benutzername oder Passwort falsch' });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

/* ── Auth: Token prüfen ──────────────────────────────────────────── */
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ username: req.user.username });
});

/* ── Planets ─────────────────────────────────────────────────────── */
app.get('/api/planets', (req, res) => {
  res.json(require('./planets.json'));
});

/* ── Content: lesen ──────────────────────────────────────────────── */
app.get('/api/content', (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_FILE)) return res.json(null);
    res.json(JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8')));
  } catch (err) {
    console.error('content.json lesen:', err);
    res.status(500).json({ error: 'Lesefehler' });
  }
});

/* ── Content: schreiben ──────────────────────────────────────────── */
app.put('/api/content', requireAuth, (req, res) => {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch (err) {
    console.error('content.json schreiben:', err);
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

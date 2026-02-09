const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

// CORS ist optional, wenn alles über dieselbe Domain läuft
app.use(cors());

app.get('/api/planets', (req, res) => {
  const planets = require('./planets.json');
  res.json(planets);
});

// Nur falls Express auch statisch serven soll (optional)
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(port, '127.0.0.1', () => {
  console.log(`API läuft intern auf http://127.0.0.1:${port}`);
});

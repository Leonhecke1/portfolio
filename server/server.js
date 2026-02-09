const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

app.get('/api/planets', (req, res) => {
  const planets = require('./planets.json');
  res.json(planets);
});

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

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());

// API endpoint to get planet data
app.get('/api/planets', (req, res) => {
  const planets = require('./planets.json');
  res.json(planets);
});

// Serve the static files of the React app
// This must be BEFORE the catch-all for index.html
app.use(express.static(path.join(__dirname, '../dist')));

// For any GET request that hasn't been handled by previous routes (APIs or static files),
// send the React app's index.html. This is crucial for client-side routing.
// This should be the very LAST middleware/route.
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) { // Only for GET and not API paths
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  } else {
    next(); // Pass control to the next middleware if it's not a GET request or it's an API path
  }
});

// Global error handling for unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1); // Exit with a failure code
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1); // Exit with a failure code
});


app.listen(port, () => {
  console.log(`Planetary Data API listening at http://localhost:${port}`);
  console.log(`Serving React app from http://localhost:${port}`);
});

// Diagnostic hack: Keep the event loop alive
setInterval(() => {}, 1000 * 60 * 60); // Keep alive for 1 hour, doing nothing


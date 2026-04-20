const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'PUSH', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`PUSH server running on http://localhost:${PORT}`);
});

require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Simple health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Placeholder for other routes
app.use('/api', require('./routes/api'));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

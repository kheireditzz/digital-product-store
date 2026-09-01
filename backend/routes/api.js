const express = require('express');
const router = express.Router();

router.get('/products', (req, res) => {
  // Dummy product list
  res.json([
    { id: 1, name: 'Product A', price: 10 },
    { id: 2, name: 'Product B', price: 20 },
  ]);
});

module.exports = router;

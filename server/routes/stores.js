const express = require('express');
const pool = require('../config');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();


router.use(authMiddleware, requireRole('USER', 'ADMIN', 'OWNER'));

router.get('/', async (req, res) => {
  try {
    const { name, address, sort = 'name', order = 'ASC' } = req.query;
    const userId = req.user.id;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (name) {
      whereClause += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (address) {
      whereClause += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    const validSortFields = ['name', 'address'];
    const validOrder = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const query = `
      SELECT s.id, s.name, s.address,
             COALESCE(AVG(r.value), 0) as overall_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.${sortField} ${sortOrder}
    `;

    const [stores] = await pool.execute(query, params);

    
    const [userRatings] = await pool.execute(
      'SELECT store_id, value FROM ratings WHERE user_id = ?',
      [userId]
    );

    const userRatingsMap = {};
    userRatings.forEach(rating => {
      userRatingsMap[rating.store_id] = rating.value;
    });


    const storesWithUserRating = stores.map(store => ({
      ...store,
      userRating: userRatingsMap[store.id] || null,
      overallRating: parseFloat(store.overall_rating).toFixed(2)
    }));

    res.json(storesWithUserRating);
  } catch (error) {
    console.error('List stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:storeId/rating', async (req, res) => {
  try {
    const { storeId } = req.params;
    const { value } = req.body;
    const userId = req.user.id;

    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }


    const [stores] = await pool.execute(
      'SELECT id FROM stores WHERE id = ?',
      [storeId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const [existingRatings] = await pool.execute(
      'SELECT id FROM ratings WHERE user_id = ? AND store_id = ?',
      [userId, storeId]
    );

    if (existingRatings.length > 0) {
  
      await pool.execute(
        'UPDATE ratings SET value = ? WHERE user_id = ? AND store_id = ?',
        [value, userId, storeId]
      );
      res.json({ message: 'Rating updated successfully' });
    } else {
      
      await pool.execute(
        'INSERT INTO ratings (user_id, store_id, value) VALUES (?, ?, ?)',
        [userId, storeId, value]
      );
      res.json({ message: 'Rating submitted successfully' });
    }
  } catch (error) {
    console.error('Submit rating error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

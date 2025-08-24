const express = require('express');
const pool = require('../config');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();


router.use(authMiddleware, requireRole('OWNER'));


router.get('/dashboard', async (req, res) => {
  try {
    const ownerId = req.user.id;

   
    const [stores] = await pool.execute(
      'SELECT id, name, address FROM stores WHERE owner_id = ?',
      [ownerId]
    );

    if (stores.length === 0) {
      return res.status(404).json({ message: 'No store found for this owner' });
    }

    const store = stores[0];

    const [ratingResult] = await pool.execute(
      'SELECT COALESCE(AVG(value), 0) as average_rating, COUNT(*) as total_ratings FROM ratings WHERE store_id = ?',
      [store.id]
    );

    const averageRating = parseFloat(ratingResult[0].average_rating).toFixed(2);
    const totalRatings = ratingResult[0].total_ratings;


    const [ratings] = await pool.execute(
      `SELECT r.value, r.created_at, u.name, u.email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = ?
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    res.json({
      store: {
        id: store.id,
        name: store.name,
        address: store.address
      },
      averageRating,
      totalRatings,
      raters: ratings.map(rating => ({
        name: rating.name,
        email: rating.email,
        rating: rating.value,
        ratedAt: rating.created_at
      }))
    });
  } catch (error) {
    console.error('Owner dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

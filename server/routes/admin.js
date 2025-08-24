const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { isStrongPassword, validateName, validateAddress, validateEmail } = require('../utils/validators');

const router = express.Router();


router.use(authMiddleware, requireRole('ADMIN'));


router.get('/dashboard', async (req, res) => {
  try {
    const [usersResult] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [storesResult] = await pool.execute('SELECT COUNT(*) as count FROM stores');
    const [ratingsResult] = await pool.execute('SELECT COUNT(*) as count FROM ratings');

    res.json({
      totalUsers: usersResult[0].count,
      totalStores: storesResult[0].count,
      totalRatings: ratingsResult[0].count
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/users', async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;

    // Validation
    if (!validateName(name)) {
      return res.status(400).json({ message: 'Name must be 20-60 characters long' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Address must be 400 characters or less' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be 8-16 characters with at least one uppercase and one special character' });
    }
    if (!['ADMIN', 'USER', 'OWNER'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

 
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

  
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, address, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, address, passwordHash, role]
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sort = 'name', order = 'ASC' } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (name) {
      whereClause += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      whereClause += ' AND email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      whereClause += ' AND address LIKE ?';
      params.push(`%${address}%`);
    }
    if (role) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const validSortFields = ['name', 'email', 'address', 'role'];
    const validOrder = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const query = `
      SELECT id, name, email, address, role, created_at 
      FROM users 
      ${whereClause} 
      ORDER BY ${sortField} ${sortOrder}
    `;

    const [users] = await pool.execute(query, params);
    res.json(users);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const [users] = await pool.execute(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];


    if (user.role === 'OWNER') {
      const [stores] = await pool.execute(
        'SELECT id, name, address FROM stores WHERE owner_id = ?',
        [userId]
      );
      user.stores = stores;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ message: 'Name, email, and address are required' });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!validateAddress(address)) {
      return res.status(400).json({ message: 'Address must be 400 characters or less' });
    }

  
    const [existingStores] = await pool.execute(
      'SELECT id FROM stores WHERE email = ?',
      [email]
    );

    if (existingStores.length > 0) {
      return res.status(409).json({ message: 'Store with this email already exists' });
    }

  
    const [result] = await pool.execute(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, ownerId || null]
    );

    res.status(201).json({ message: 'Store created successfully', storeId: result.insertId });
  } catch (error) {
    console.error('Create store error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.get('/stores', async (req, res) => {
  try {
    const { name, email, address, sort = 'name', order = 'ASC' } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (name) {
      whereClause += ' AND s.name LIKE ?';
      params.push(`%${name}%`);
    }
    if (email) {
      whereClause += ' AND s.email LIKE ?';
      params.push(`%${email}%`);
    }
    if (address) {
      whereClause += ' AND s.address LIKE ?';
      params.push(`%${address}%`);
    }

    const validSortFields = ['name', 'email', 'address'];
    const validOrder = ['ASC', 'DESC'];
    
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = validOrder.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id,
             COALESCE(AVG(r.value), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.${sortField} ${sortOrder}
    `;

    const [stores] = await pool.execute(query, params);
    res.json(stores);
  } catch (error) {
    console.error('List stores error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

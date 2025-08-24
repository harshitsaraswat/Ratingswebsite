const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config');
const { authMiddleware } = require('../middleware/auth');
const { isStrongPassword, validateName, validateAddress, validateEmail } = require('../utils/validators');

const router = express.Router();


router.post('/signup', async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    
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
      [name, email, address, passwordHash, 'USER']
    );

    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

   
    const [users] = await pool.execute(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

 
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    if (!isStrongPassword(password)) {
      return res.status(400).json({ message: 'Password must be 8-16 characters with at least one uppercase and one special character' });
    }

   
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

   
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

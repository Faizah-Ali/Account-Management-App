const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const PORT = 5000;
const app = express();
app.use(cors());
app.use(express.json());



// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'account_management'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
  }
});

// Secret key for JWT
const jwtSecret = 'your_jwt_secret';

// Register API
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ message: 'Error hashing password' });

    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});

// Login API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '1h' });
      res.json({ token, message: 'Login successful' });
    });
  });
});

// Get User Info API
app.get('/api/user', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });

    const sql = 'SELECT id, email, created_at FROM users WHERE id = ?';
    db.query(sql, [decoded.userId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ message: 'User not found' });

      res.json(results[0]);
    });
  });
});

// Update User Info API
app.put('/api/user', (req, res) => {
  const { email, password } = req.body;
  const token = req.headers.authorization.split(' ')[1];

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });

    // Hash new password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) return res.status(500).json({ message: 'Error hashing password' });

      const sql = 'UPDATE users SET email = ?, password = ? WHERE id = ?';
      db.query(sql, [email, hashedPassword, decoded.userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'User updated successfully' });
      });
    });
  });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
  
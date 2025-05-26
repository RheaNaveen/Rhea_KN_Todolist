const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const secretKey = 'yourSecretKey'; // You can store this securely in .env file

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Connect to MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Root@115',
  database: 'TodolistDB'
});

db.connect(err => {
  if (err) {
    console.error('DB connection error:', err);
    return;
  }
  console.log('Connected to MySQL database.');
});

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token required' });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Dummy LOGIN route with JWT token
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  // Replace this with a real user check in future
  if (email === 'test@example.com' && password === '123456') {
    const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// PROTECTED ROUTES below

// Get all tasks (protected)
app.get('/tasks', authMiddleware, (req, res) => {
  const query = `
    SELECT Tasks.task_id, Tasks.task_name, Tasks.due_date, Tasks.status, Projects.project_name
    FROM Tasks LEFT JOIN Projects ON Tasks.project_id = Projects.project_id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add new task (protected)
app.post('/tasks', authMiddleware, (req, res) => {
  const { task_name, due_date, status, project_id } = req.body;
  const query = 'INSERT INTO Tasks (task_name, due_date, status, project_id) VALUES (?, ?, ?, ?)';
  db.query(query, [task_name, due_date, status || 'Pending', project_id || null], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Task added', id: results.insertId });
  });
});

// Update task status (protected)
app.put('/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = 'UPDATE Tasks SET status = ? WHERE task_id = ?';
  db.query(query, [status, id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Task updated' });
  });
});

// Delete task (protected)
app.delete('/tasks/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM Tasks WHERE task_id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Task deleted' });
  });
});

// Get all projects (protected)
app.get('/api/projects', authMiddleware, (req, res) => {
  const query = 'SELECT * FROM Projects';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Add new project (protected)
app.post('/api/projects', authMiddleware, (req, res) => {
  const { project_name, description, start_date, end_date } = req.body;
  const query = 'INSERT INTO Projects (project_name, description, start_date, end_date) VALUES (?, ?, ?, ?)';
  db.query(query, [project_name, description, start_date, end_date], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Project created', id: result.insertId });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

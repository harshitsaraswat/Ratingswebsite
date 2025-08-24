const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Ratings Platform Server is Running!',
    status: 'success',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      test: '/test',
      info: '/info'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is healthy and running',
    port: PORT,
    uptime: process.uptime()
  });
});

app.get('/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working!',
    server: 'Ratings Platform',
    version: '1.0.0'
  });
});

app.get('/info', (req, res) => {
  res.json({
    name: 'Ratings Platform API',
    description: 'A full-stack application for rating stores',
    backend: 'Node.js + Express',
    frontend: 'React + Webpack',
    database: 'MySQL',
    status: 'Server running successfully'
  });
});


process.on('SIGINT', () => {
  console.log('\n Shutting down server...');
  process.exit(0);
});

import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';


dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
});
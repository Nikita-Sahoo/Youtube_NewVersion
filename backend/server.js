import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import channelRoutes from './src/routes/channel.routes.js';



dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/api/test`);
});
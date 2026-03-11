import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  });
});

export default router;
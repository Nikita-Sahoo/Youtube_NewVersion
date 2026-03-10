import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getAllVideos,
  getVideoById,
  createVideo,
  
} from '../controllers/video.controller.js';

const router = express.Router();

router.get('/', getAllVideos);
router.get('/:id', getVideoById);
router.post('/:channelId', protect, createVideo);


export default router;
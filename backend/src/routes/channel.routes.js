import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  createChannel,
  getChannelById,
  getUserChannels,
  updateChannel,
  getChannelVideos
} from '../controllers/channel.controller.js';

const router = express.Router();

router.post('/', protect, createChannel);
router.get('/user', protect, getUserChannels);
router.get('/:id', getChannelById);
router.put('/:id', protect, updateChannel);
router.get('/:id/videos', getChannelVideos);

export default router;
import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  addComment,
  getVideoComments,
  updateComment,
  deleteComment
} from '../controllers/comment.controller.js';

const router = express.Router();

router.post('/video/:videoId', protect, addComment);
router.get('/video/:videoId', getVideoComments);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

export default router;
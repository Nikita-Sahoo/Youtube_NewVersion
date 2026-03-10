import { Comment } from '../models/comment.model.js';
import { Video } from '../models/video.model.js';
// import { User } from '../models/user.model.js';

// Add a comment to a video
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const videoId = req.params.videoId;

    // Validate input
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Create comment
    const comment = await Comment.create({
      text: text.trim(),
      userId: req.user._id,
      videoId: videoId,
      createdAt: new Date()
    });

    // Add comment to video's comments array
    video.comments.push(comment._id);
    await video.save();

    // Populate user info for response
    await comment.populate('userId', 'username');

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//  Get all comments for a video
export const getVideoComments = async (req, res) => {
  try {
    const comments = await Comment.find({ videoId: req.params.videoId })
      .populate('userId', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const commentId = req.params.id;

    // Validate input
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    // Update comment
    comment.text = text.trim();
    await comment.save();

    await comment.populate('userId', 'username');

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;

    // Find comment
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Remove comment from video's comments array
    await Video.findByIdAndUpdate(comment.videoId, {
      $pull: { comments: commentId }
    });

    // Delete comment
    await comment.deleteOne();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//  Get a single comment by ID
export const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('userId', 'username')
      .populate('videoId', 'title');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comments by user
export const getCommentsByUser = async (req, res) => {
  try {
    const comments = await Comment.find({ userId: req.params.userId })
      .populate('videoId', 'title thumbnailUrl')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
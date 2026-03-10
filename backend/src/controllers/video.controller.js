import { Video } from '../models/video.model.js';
import { Channel } from '../models/channel.model.js';
import { Comment } from '../models/comment.model.js';

export const getAllVideos = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const videos = await Video.find(query)
      .populate('channelId', 'channelName subscribers')
      .populate('uploader', 'username')
      .sort({ uploadDate: -1 });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single video by ID
yId = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('channelId', 'channelName subscribers channelBanner description')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'username'
        }
      })
      .populate('uploader', 'username');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new video
export const createVideo = async (req, res) => {
  try {
    const { title, description, videoUrl, thumbnailUrl, category } = req.body;
    const channelId = req.params.channelId;

    // Validate required fields
    if (!title || !videoUrl || !thumbnailUrl || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if channel exists and user owns it
    const channel = await Channel.findOne({ 
      _id: channelId, 
      owner: req.user._id 
    });

    if (!channel) {
      return res.status(403).json({ message: 'Not authorized to upload to this channel' });
    }

    // Create video
    const video = await Video.create({
      title,
      description,
      videoUrl,
      thumbnailUrl,
      category,
      channelId,
      uploader: req.user._id,
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: [],
      uploadDate: new Date()
    });

    // Add video to channel's videos array
    channel.videos.push(video._id);
    await channel.save();

    res.status(201).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Update video
export const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check ownership
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this video' });
    }

    // Update only allowed fields
    const allowedUpdates = ['title', 'description', 'category', 'thumbnailUrl'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('channelId', 'channelName');

    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete video
export const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check ownership
    if (video.uploader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this video' });
    }

    // Remove video from channel
    await Channel.findByIdAndUpdate(video.channelId, {
      $pull: { videos: video._id }
    });

    // Delete all comments associated with this video
    await Comment.deleteMany({ videoId: video._id });

    // Delete the video
    await video.deleteOne();

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like a video
export const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.likes += 1;
    await video.save();

    res.status(200).json({ likes: video.likes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Dislike a video
export const dislikeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.dislikes += 1;
    await video.save();

    res.status(200).json({ dislikes: video.dislikes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//  Get videos by channel
export const getVideosByChannel = async (req, res) => {
  try {
    const videos = await Video.find({ channelId: req.params.channelId })
      .populate('channelId', 'channelName')
      .sort({ uploadDate: -1 });

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
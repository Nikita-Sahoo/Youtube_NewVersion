import { Channel } from '../models/channel.model.js';
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';

// Create a new channel
export const createChannel = async (req, res) => {
  try {
    const { channelName, description, channelBanner } = req.body;

    // Validate input
    if (!channelName) {
      return res.status(400).json({ message: 'Channel name is required' });
    }

    // Check if user already has a channel with this name
    const existingChannel = await Channel.findOne({
      channelName,
      owner: req.user._id
    });

    if (existingChannel) {
      return res.status(400).json({ message: 'You already have a channel with this name' });
    }

    // Create channel
    const channel = await Channel.create({
      channelName,
      description: description || '',
      channelBanner: channelBanner || '',
      owner: req.user._id,
      subscribers: 0,
      videos: [],
      createdAt: new Date()
    });

    // Add channel to user's channels array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { channels: channel._id }
    });

    res.status(201).json({
      success: true,
      data: channel
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get channel by ID
export const getChannelById = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('owner', 'username email')
      .populate({
        path: 'videos',
        options: { sort: { uploadDate: -1 } }
      });

    if (!channel) {
      return res.status(404).json({ 
        success: false,
        message: 'Channel not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: channel
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get user's channels
export const getUserChannels = async (req, res) => {
  try {
    const channels = await Channel.find({ owner: req.user._id })
      .populate('videos');

    res.status(200).json({
      success: true,
      data: channels
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update channel
export const updateChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ 
        success: false,
        message: 'Channel not found' 
      });
    }

    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this channel' 
      });
    }

    // Update allowed fields
    const allowedUpdates = ['channelName', 'description', 'channelBanner'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedChannel = await Channel.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedChannel,
      message: 'Channel updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete channel
export const deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ 
        success: false,
        message: 'Channel not found' 
      });
    }

    // Check ownership
    if (channel.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this channel' 
      });
    }

    // Delete all videos in this channel
    await Video.deleteMany({ channelId: channel._id });

    // Remove channel from user's channels array
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { channels: channel._id }
    });

    // Delete channel
    await channel.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Channel and all associated videos deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

//  Get channel videos
export const getChannelVideos = async (req, res) => {
  try {
    const videos = await Video.find({ channelId: req.params.id })
      .populate('channelId', 'channelName')
      .sort({ uploadDate: -1 });

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Subscribe to channel
export const subscribeToChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ 
        success: false,
        message: 'Channel not found' 
      });
    }

    // Can't subscribe to own channel
    if (channel.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot subscribe to your own channel' 
      });
    }

    channel.subscribers += 1;
    await channel.save();

    res.status(200).json({
      success: true,
      data: { subscribers: channel.subscribers },
      message: 'Subscribed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Unsubscribe from channel
export const unsubscribeFromChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ 
        success: false,
        message: 'Channel not found' 
      });
    }

    // Can't unsubscribe from own channel
    if (channel.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot unsubscribe from your own channel' 
      });
    }

    if (channel.subscribers > 0) {
      channel.subscribers -= 1;
      await channel.save();
    }

    res.status(200).json({
      success: true,
      data: { subscribers: channel.subscribers },
      message: 'Unsubscribed successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};
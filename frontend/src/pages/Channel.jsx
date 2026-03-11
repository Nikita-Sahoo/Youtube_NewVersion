import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Edit, Trash2, Plus, Video, Users, Calendar, Eye, X, Upload, 
  Image, Link as LinkIcon, Tag, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react';
import { channelService } from '../services/channel.service';
import { videoService } from '../services/video.service';
import VideoCard from '../components/VideoCard';

const Channel = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    channelName: '',
    description: '',
    channelBanner: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChannel, setNewChannel] = useState({
    channelName: '',
    description: '',
    channelBanner: ''
  });
  
  // Video upload form state
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    category: 'Comedy',
    tags: '',
    views: 0,
    likes: 0,
    dislikes: 0
  });
  const [videoErrors, setVideoErrors] = useState({});
  const [videoSuccess, setVideoSuccess] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const categories = [
    'Music', 'Gaming', 'News', 'Sports', 'Education', 
    'Technology', 'Comedy', 'Entertainment', 'Travel', 
    'Food', 'Fashion', 'Science', 'Vlogs', 'Podcasts',
    'Pop', 'Rock', 'Hip Hop', 'Classical', 'EDM', 
    'Jazz', 'K-Pop', 'Bollywood', 'LoFi', 'Acoustic', 
    'Indian Classical'
  ];

  useEffect(() => {
    if (id) {
      fetchChannelById(id);
    } else if (user) {
      fetchUserChannels();
    }
  }, [id, user]);

  const fetchChannelById = async (channelId) => {
    setLoading(true);
    try {
      const data = await channelService.getChannelById(channelId);
      setChannel(data.data || data);
      const channelVideos = await channelService.getChannelVideos(channelId);
      setVideos(channelVideos.data || channelVideos);
    } catch (error) {
      console.error('Error fetching channel:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChannels = async () => {
    setLoading(true);
    try {
      const data = await channelService.getUserChannels();
      if (data.data && data.data.length > 0) {
        setChannel(data.data[0]);
        const channelVideos = await channelService.getChannelVideos(data.data[0]._id);
        setVideos(channelVideos.data || channelVideos);
      } else {
        setChannel(null);
      }
    } catch (error) {
      console.error('Error fetching user channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChannel = async (e) => {
    e.preventDefault();
    try {
      const response = await channelService.createChannel(newChannel);
      setChannel(response.data || response);
      setShowCreateForm(false);
      setNewChannel({ channelName: '', description: '', channelBanner: '' });
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  const handleUpdateChannel = async (e) => {
    e.preventDefault();
    try {
      const response = await channelService.updateChannel(channel._id, editForm);
      setChannel(response.data || response);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating channel:', error);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videoService.deleteVideo(videoId);
        setVideos(videos.filter(v => v._id !== videoId));
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  // Helper function to compare IDs properly
  const isChannelOwner = () => {
    if (!user || !channel) return false;
    
    // Get the owner ID from channel (could be in different formats)
    const ownerId = channel.owner?._id || channel.owner;
    
    // Convert both to strings and trim
    const userIdStr = String(user.id || user._id || '').trim();
    const ownerIdStr = String(ownerId || '').trim();
    
    console.log('Comparing IDs:', {
      userId: userIdStr,
      ownerId: ownerIdStr,
      match: userIdStr === ownerIdStr
    });
    
    return userIdStr === ownerIdStr;
  };

  // Video form handlers
  const handleVideoFormChange = (e) => {
    const { name, value } = e.target;
    setVideoForm({
      ...videoForm,
      [name]: value
    });
    // Clear error for this field
    if (videoErrors[name]) {
      setVideoErrors({
        ...videoErrors,
        [name]: ''
      });
    }
  };

  const validateVideoForm = () => {
    const errors = {};
    
    if (!videoForm.title.trim()) {
      errors.title = 'Title is required';
    } else if (videoForm.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    }
    
    if (!videoForm.description.trim()) {
      errors.description = 'Description is required';
    } else if (videoForm.description.length < 20) {
      errors.description = 'Description must be at least 20 characters';
    }
    
    if (!videoForm.videoUrl.trim()) {
      errors.videoUrl = 'Video URL is required';
    } else if (!isValidUrl(videoForm.videoUrl)) {
      errors.videoUrl = 'Please enter a valid URL';
    }
    
    if (!videoForm.thumbnailUrl.trim()) {
      errors.thumbnailUrl = 'Thumbnail URL is required';
    } else if (!isValidUrl(videoForm.thumbnailUrl)) {
      errors.thumbnailUrl = 'Please enter a valid URL';
    }
    
    if (!videoForm.category) {
      errors.category = 'Category is required';
    }
    
    return errors;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmitVideo = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateVideoForm();
    if (Object.keys(errors).length > 0) {
      setVideoErrors(errors);
      return;
    }

    setUploadingVideo(true);
    setVideoErrors({});
    setVideoSuccess('');

    try {
      // Prepare video data
      const videoData = {
        title: videoForm.title,
        description: videoForm.description,
        videoUrl: videoForm.videoUrl,
        thumbnailUrl: videoForm.thumbnailUrl,
        category: videoForm.category,
        tags: videoForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        views: Number(videoForm.views) || 0,
        likes: Number(videoForm.likes) || 0,
        dislikes: Number(videoForm.dislikes) || 0,
        uploadDate: new Date().toISOString()
      };

      // Upload video
      const response = await videoService.createVideo(channel._id, videoData);
      
      // Add new video to list
      setVideos([response.data || response, ...videos]);
      
      // Reset form
      setVideoForm({
        title: '',
        description: '',
        videoUrl: '',
        thumbnailUrl: '',
        category: 'Comedy',
        tags: '',
        views: 0,
        likes: 0,
        dislikes: 0
      });
      
      setVideoSuccess('✅ Video uploaded successfully!');
      
      // Close form after 2 seconds
      setTimeout(() => {
        setShowVideoForm(false);
        setVideoSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Error uploading video:', error);
      setVideoErrors({ 
        submit: error.response?.data?.message || 'Failed to upload video. Please try again.' 
      });
    } finally {
      setUploadingVideo(false);
    }
  };

 

  const loadTemplate = (template) => {
    setVideoForm({
      ...videoForm,
      ...template.data
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If user has no channel, show create channel form
  if (!channel && user && !id) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Video size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Create Your Channel</h2>
            <p className="text-gray-600 mt-2">Start sharing your videos with the world</p>
          </div>

          <form onSubmit={handleCreateChannel} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={newChannel.channelName}
                onChange={(e) => setNewChannel({ ...newChannel, channelName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="My Awesome Channel"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newChannel.description}
                onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell viewers about your channel..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel Banner URL (optional)
              </label>
              <input
                type="url"
                value={newChannel.channelBanner}
                onChange={(e) => setNewChannel({ ...newChannel, channelBanner: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/banner.jpg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Channel
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Channel not found</p>
      </div>
    );
  }

  const isOwner = isChannelOwner();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Channel Banner */}
      <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        {channel.channelBanner && (
          <img 
            src={channel.channelBanner} 
            alt="Channel Banner"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Channel Info */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Channel Avatar */}
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
              {channel.channelName?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleUpdateChannel} className="space-y-4">
                  <input
                    type="text"
                    value={editForm.channelName}
                    onChange={(e) => setEditForm({ ...editForm, channelName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Channel Name"
                    required
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Description"
                    rows="3"
                  />
                  <input
                    type="url"
                    value={editForm.channelBanner}
                    onChange={(e) => setEditForm({ ...editForm, channelBanner: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Banner URL"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold">{channel.channelName}</h1>
                      <p className="text-gray-600 mt-2">{channel.description || 'No description provided'}</p>
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Users size={16} className="mr-1" />
                          {channel.subscribers?.toLocaleString() || 0} subscribers
                        </span>
                        <span className="flex items-center">
                          <Video size={16} className="mr-1" />
                          {videos.length} videos
                        </span>
                        <span className="flex items-center">
                          <Calendar size={16} className="mr-1" />
                          Joined {new Date(channel.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Channel Owner Actions - Now using isOwner function */}
                    {isOwner && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                          onClick={() => {
                            setEditForm({
                              channelName: channel.channelName,
                              description: channel.description || '',
                              channelBanner: channel.channelBanner || ''
                            });
                            setIsEditing(true);
                          }}
                          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300 shadow-sm"
                        >
                          <Edit size={18} />
                          <span>Edit Channel</span>
                        </button>
                        
                        {/* MAIN UPLOAD BUTTON - Prominently displayed */}
                        <button
                          onClick={() => setShowVideoForm(true)}
                          className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                          <Upload size={18} />
                          <span className="font-medium">Upload Video</span>
                        </button>
                      </div>
                    )}
                  </div>

                
                </>
              )}
            </div>
          </div>
        </div>

        {/* Video Upload Form Modal */}
        {showVideoForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white pb-4 border-b">
                  <h2 className="text-2xl font-bold flex items-center">
                    <Upload size={24} className="mr-2 text-green-600" />
                    Upload New Video
                  </h2>
                  <button
                    onClick={() => setShowVideoForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                

                <form onSubmit={handleSubmitVideo} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={videoForm.title}
                      onChange={handleVideoFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        videoErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., When Parents Try to Use TikTok 😂"
                    />
                    {videoErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{videoErrors.title}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={videoForm.description}
                      onChange={handleVideoFormChange}
                      rows="4"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        videoErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe your video in detail..."
                    />
                    {videoErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{videoErrors.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {videoForm.description.length}/5000 characters
                    </p>
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <LinkIcon size={16} />
                        <span>Video URL <span className="text-red-500">*</span></span>
                      </div>
                    </label>
                    <input
                      type="url"
                      name="videoUrl"
                      value={videoForm.videoUrl}
                      onChange={handleVideoFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        videoErrors.videoUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="http://example.com/video.mp4"
                    />
                    {videoErrors.videoUrl && (
                      <p className="mt-1 text-sm text-red-600">{videoErrors.videoUrl}</p>
                    )}
                  </div>

                  {/* Thumbnail URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <Image size={16} />
                        <span>Thumbnail URL <span className="text-red-500">*</span></span>
                      </div>
                    </label>
                    <input
                      type="url"
                      name="thumbnailUrl"
                      value={videoForm.thumbnailUrl}
                      onChange={handleVideoFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        videoErrors.thumbnailUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="http://example.com/thumbnail.jpg"
                    />
                    {videoErrors.thumbnailUrl && (
                      <p className="mt-1 text-sm text-red-600">{videoErrors.thumbnailUrl}</p>
                    )}
                    
                    {/* Thumbnail Preview */}
                    {videoForm.thumbnailUrl && (
                      <div className="mt-2 relative w-40 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                          src={videoForm.thumbnailUrl} 
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/400x225?text=Invalid+Image';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={videoForm.category}
                      onChange={handleVideoFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        videoErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    {videoErrors.category && (
                      <p className="mt-1 text-sm text-red-600">{videoErrors.category}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <div className="flex items-center space-x-1">
                        <Tag size={16} />
                        <span>Tags (comma separated)</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={videoForm.tags}
                      onChange={handleVideoFormChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Comedy, Family, Funny, Pranks"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Add tags to help viewers find your video
                    </p>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
                    </button>
                  </div>

                  {/* Advanced Options - Initial Stats */}
                  {showAdvanced && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                      <h3 className="font-medium text-gray-700">Initial Statistics (Optional)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Initial Views
                          </label>
                          <input
                            type="number"
                            name="views"
                            value={videoForm.views}
                            onChange={handleVideoFormChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Initial Likes
                          </label>
                          <input
                            type="number"
                            name="likes"
                            value={videoForm.likes}
                            onChange={handleVideoFormChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Initial Dislikes
                          </label>
                          <input
                            type="number"
                            name="dislikes"
                            value={videoForm.dislikes}
                            onChange={handleVideoFormChange}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {videoSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-700 flex items-center">
                        <span className="mr-2">✅</span>
                        {videoSuccess}
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {videoErrors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 flex items-center">
                        <AlertCircle size={18} className="mr-2" />
                        {videoErrors.submit}
                      </p>
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowVideoForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingVideo}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all shadow-md"
                    >
                      {uploadingVideo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          <span>Upload Video</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Videos Section */}
        <div className="mt-8">
          

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <div key={video._id} className="relative group">
                  <VideoCard video={video} />
                  {isOwner && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        onClick={() => navigate(`/video/${video._id}/edit`)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                        title="Edit Video"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 text-red-600 transition-colors"
                        title="Delete Video"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  {/* New video indicator */}
                  {new Date(video.uploadDate) > new Date(Date.now() - 24*60*60*1000) && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      NEW
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <Video size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No videos uploaded yet</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to share a video with your audience!</p>
              {isOwner && (
                <button
                  onClick={() => setShowVideoForm(true)}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all shadow-md inline-flex items-center space-x-2"
                >
                  <Upload size={20} />
                  <span className="font-medium">Upload Your First Video</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      {isOwner && !showVideoForm && (
        <button
          onClick={() => setShowVideoForm(true)}
          className="fixed bottom-6 right-6 md:hidden bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-full shadow-lg hover:from-green-700 hover:to-green-600 transition-all z-40"
          title="Upload Video"
        >
          <Upload size={24} />
        </button>
      )}
    </div>
  );
};

export default Channel;
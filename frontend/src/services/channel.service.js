import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Video, Users, Calendar, Eye } from 'lucide-react';
import { channelService } from '../services/channel.service';
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

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
              {channel.channelName?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              {isEditing ? (
                <form onSubmit={handleUpdateChannel} className="space-y-4">
                  <input
                    type="text"
                    value={editForm.channelName}
                    onChange={(e) => setEditForm({ ...editForm, channelName: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Channel Name"
                    required
                  />
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Description"
                    rows="3"
                  />
                  <input
                    type="url"
                    value={editForm.channelBanner}
                    onChange={(e) => setEditForm({ ...editForm, channelBanner: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Banner URL"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{channel.channelName}</h1>
                    {user && user.id === channel.owner?._id && (
                      <button
                        onClick={() => {
                          setEditForm({
                            channelName: channel.channelName,
                            description: channel.description || '',
                            channelBanner: channel.channelBanner || ''
                          });
                          setIsEditing(true);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <Edit size={18} />
                        <span>Edit Channel</span>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{channel.description || 'No description provided'}</p>
                  <div className="flex items-center space-x-4 mt-4 text-sm text-gray-500">
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
                </>
              )}
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Videos</h2>
            {user && user.id === channel.owner?._id && (
              <button
                onClick={() => navigate('/upload')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                <span>Upload Video</span>
              </button>
            )}
          </div>

          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
                <div key={video._id} className="relative group">
                  <VideoCard video={video} />
                  {user && user.id === channel.owner?._id && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/video/${video._id}/edit`)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 mr-2"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <Video size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No videos uploaded yet</p>
              {user && user.id === channel.owner?._id && (
                <button
                  onClick={() => navigate('/upload')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload Your First Video
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Channel;
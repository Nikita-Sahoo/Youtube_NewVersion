import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Save, Eye, Clock } from 'lucide-react';
import { videoService } from '../services/video.service';
import { commentService } from '../services/comment.service';
import { authService } from '../services/auth.service';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [suggestedVideos, setSuggestedVideos] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [suggestedLoading, setSuggestedLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchVideo();
  }, [id]);

  useEffect(() => {
    if (video) {
      fetchSuggestedVideos();
    }
  }, [video]);

  const fetchVideo = async () => {
    setLoading(true);
    try {
      const videoData = await videoService.getVideoById(id);
      setVideo(videoData);
      setComments(videoData.comments || []);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedVideos = async () => {
    setSuggestedLoading(true);
    try {
      // Fetch all videos
      const allVideos = await videoService.getAllVideos();
      
      // Filter out current video and get random videos
      const otherVideos = allVideos.filter(v => v._id !== id);
      
      // Shuffle array and get 5 random videos
      const shuffled = [...otherVideos].sort(() => 0.5 - Math.random());
      const randomVideos = shuffled.slice(0, 5);
      
      setSuggestedVideos(randomVideos);
    } catch (error) {
      console.error('Error fetching suggested videos:', error);
    } finally {
      setSuggestedLoading(false);
    }
  };

  const formatViews = (views) => {
    if (!views) return '0';
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '10:30';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please sign in to like videos');
      return;
    }
    try {
      await videoService.likeVideo(id);
      setVideo({ ...video, likes: video.likes + 1 });
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      alert('Please sign in to dislike videos');
      return;
    }
    try {
      await videoService.dislikeVideo(id);
      setVideo({ ...video, dislikes: video.dislikes + 1 });
    } catch (error) {
      console.error('Error disliking video:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    try {
      const comment = await commentService.addComment(id, newComment);
      setComments([...comments, { 
        ...comment, 
        userId: { 
          _id: user.id,
          username: user.username 
        } 
      }]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await commentService.updateComment(commentId, editText);
      setComments(comments.map(c => 
        c._id === commentId ? { ...c, text: editText } : c
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Video not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player Section */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full"
              poster={video.thumbnailUrl}
            />
          </div>

          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-xl font-bold">{video.title}</h1>
            
            <div className="flex items-center justify-between mt-2 flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {video.channelId?.channelName?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-semibold">{video.channelId?.channelName || 'Unknown Channel'}</p>
                  <p className="text-sm text-gray-600">
                    {video.channelId?.subscribers?.toLocaleString() || 0} subscribers
                  </p>
                </div>
                {user && (
                  <button className="ml-4 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700">
                    Subscribe
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <ThumbsUp size={20} />
                  <span>{video.likes?.toLocaleString() || 0}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <ThumbsDown size={20} />
                  <span>{video.dislikes?.toLocaleString() || 0}</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Share size={20} />
                  <span className="hidden sm:inline">Share</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Save size={20} />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <span>{video.views?.toLocaleString() || 0} views</span>
                <span>•</span>
                <span>{new Date(video.uploadDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <p className="text-sm whitespace-pre-line">{video.description}</p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
            </h3>

            {/* Add Comment */}
            {user ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full border-b border-gray-300 focus:border-blue-500 outline-none pb-1"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setNewComment('')}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-full"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
                <p className="text-gray-600">
                  <Link to="/auth" className="text-blue-600 font-medium hover:underline">
                    Sign in
                  </Link> to leave a comment
                </p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
                    {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    {editingComment === comment._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            className="px-3 py-1 bg-gray-200 text-sm rounded-full hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm">
                            {comment.userId?.username || 'Unknown User'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                        {user && user.id === comment.userId?._id && (
                          <div className="flex space-x-4 mt-2">
                            <button
                              onClick={() => {
                                setEditingComment(comment._id);
                                setEditText(comment.text);
                              }}
                              className="text-xs text-gray-600 hover:text-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-xs text-gray-600 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suggested Videos Sidebar */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-4 flex items-center justify-between">
            <span>Suggested Videos</span>
            {suggestedLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            )}
          </h3>
          
          {suggestedLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex space-x-2">
                  <div className="w-40 h-24 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : suggestedVideos.length > 0 ? (
            <div className="space-y-3">
              {suggestedVideos.map((suggestedVideo) => (
                <Link
                  key={suggestedVideo._id}
                  to={`/video/${suggestedVideo._id}`}
                  className="flex space-x-2 group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="relative w-40 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={suggestedVideo.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400'}
                      alt={suggestedVideo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400';
                      }}
                    />
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                      {formatDuration(suggestedVideo.duration)}
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600">
                      {suggestedVideo.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {suggestedVideo.channelId?.channelName || 'Unknown Channel'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mt-1 space-x-1">
                      <span className="flex items-center">
                        <Eye size={10} className="mr-1" />
                        {formatViews(suggestedVideo.views)} views
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock size={10} className="mr-1" />
                        {formatDate(suggestedVideo.uploadDate)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-sm">No suggested videos found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
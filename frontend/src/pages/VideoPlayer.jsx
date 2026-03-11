import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share, Save } from 'lucide-react';
import { commentService } from '../services/comment.service';
import { authService } from '../services/auth.service';

const VideoPlayer = () => {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchVideo();
  }, [id]);

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
      setComments([...comments, { ...comment, userId: { username: user.username } }]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const updatedComment = await commentService.updateComment(commentId, editText);
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
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full" />
                <div>
                  <p className="font-semibold">{video.channelId?.channelName}</p>
                  <p className="text-sm text-gray-600">
                    {video.channelId?.subscribers || 0} subscribers
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <ThumbsUp size={20} />
                  <span>{video.likes}</span>
                </button>
                <button
                  onClick={handleDislike}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                >
                  <ThumbsDown size={20} />
                  <span>{video.dislikes}</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Share size={20} />
                  <span>Share</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <Save size={20} />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mt-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm whitespace-pre-line">{video.description}</p>
              <p className="text-xs text-gray-500 mt-2">
                {video.views} views • {new Date(video.uploadDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">
              {comments.length} Comments
            </h3>

            {/* Add Comment */}
            {user && (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="flex space-x-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none pb-1"
                  />
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Comment
                  </button>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex space-x-4">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    {editingComment === comment._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full border rounded p-2"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditComment(comment._id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingComment(null);
                              setEditText('');
                            }}
                            className="px-3 py-1 bg-gray-300 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-semibold text-sm">
                          {comment.userId?.username}
                          <span className="text-gray-500 font-normal text-xs ml-2">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </p>
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
          <h3 className="font-semibold mb-4">Suggested Videos</h3>
          <div className="space-y-3">
            {/* You can add suggested videos here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
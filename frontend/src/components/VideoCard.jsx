import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, ThumbsUp } from 'lucide-react';

const VideoCard = ({ video }) => {
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

  return (
    <Link to={`/video/${video._id}`} className="block group">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-gray-200">
          <img
            src={video.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400'}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400';
            }}
          />
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Video Info */}
        <div className="p-3">
          <div className="flex space-x-3">
            {/* Channel Avatar */}
            <div className="w-9 h-9 bg-gradient-to-r from-gray-700 to-gray-900 rounded-full flex-shrink-0 overflow-hidden">
              {video.channelId?.avatar ? (
                <img src={video.channelId.avatar} alt={video.channelId.channelName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                  {video.channelId?.channelName?.charAt(0) || 'C'}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-600">
                {video.title || 'Untitled Video'}
              </h3>
              <p className="text-sm text-gray-600 mt-1 hover:text-gray-900 truncate">
                {video.channelId?.channelName || 'Unknown Channel'}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
                <span className="flex items-center">
                  <Eye size={12} className="mr-1" />
                  {formatViews(video.views)} views
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {formatDate(video.uploadDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
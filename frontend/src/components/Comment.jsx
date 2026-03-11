import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MoreVertical, Edit, Trash2, Reply } from 'lucide-react';
import { authService } from '../../services/auth.service';

const Comment = ({ comment, onEdit, onDelete, onReply }) => {
  const [editText, setEditText] = useState(comment.text);
  const [showMenu, setShowMenu] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const user = authService.getCurrentUser();

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      const hours = Math.floor(diffTime / (1000 * 60 * 60));
      if (hours < 1) {
        const minutes = Math.floor(diffTime / (1000 * 60));
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isOwner = user && user.id === comment.userId?._id;

  return (
    <div className="flex space-x-3 group">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
        {comment.userId?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
      
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              rows="2"
              autoFocus
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                disabled={!editText.trim()}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full disabled:opacity-50 hover:bg-blue-700"
              >
                Save
              </button>
              <button
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
                {formatDate(comment.createdAt)}
              </span>
              
              {isOwner && (
                <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical size={14} />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border py-1 z-10">
                      <button
                       
                        className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 w-full text-sm"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={handleDelete}
                        className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 w-full text-sm text-red-600"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-sm mt-1 whitespace-pre-line">{comment.text}</p>
            
            <div className="flex items-center space-x-4 mt-2">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600">
                <ThumbsUp size={14} />
                <span className="text-xs">{comment.likes || 0}</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
                <ThumbsDown size={14} />
              </button>
              <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-blue-600">
                <Reply size={14} />
                <span>Reply</span>
              </button>
            </div>

            {comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center space-x-1 text-xs text-blue-600 mt-2 hover:text-blue-800"
              >
                <span>{showReplies ? 'Hide' : 'Show'} {comment.replies.length} replies</span>
              </button>
            )}

            {showReplies && comment.replies && (
              <div className="ml-8 mt-3 space-y-3">
                {comment.replies.map((reply) => (
                  <Comment
                    key={reply._id}
                    comment={reply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;
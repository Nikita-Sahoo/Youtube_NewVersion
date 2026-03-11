import api from './api';

export const commentService = {
  async addComment(videoId, text) {
    const response = await api.post(`/comments/video/${videoId}`, { text });
    return response.data;
  },

  async getVideoComments(videoId) {
    const response = await api.get(`/comments/video/${videoId}`);
    return response.data;
  },

  async updateComment(commentId, text) {
    const response = await api.put(`/comments/${commentId}`, { text });
    return response.data;
  },

  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  async getCommentsByUser(userId) {
    const response = await api.get(`/comments/user/${userId}`);
    return response.data;
  }
};
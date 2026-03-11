import api from './api';

export const videoService = {
  async getAllVideos(params = {}) {
    const response = await api.get('/videos', { params });
    return response.data;
  },

  async getVideoById(id) {
    const response = await api.get(`/videos/${id}`);
    return response.data;
  },

  async createVideo(channelId, videoData) {
    const response = await api.post(`/videos/${channelId}`, videoData);
    return response.data;
  },

  async updateVideo(id, videoData) {
    const response = await api.put(`/videos/${id}`, videoData);
    return response.data;
  },

  async deleteVideo(id) {
    const response = await api.delete(`/videos/${id}`);
    return response.data;
  },

  async likeVideo(id) {
    const response = await api.post(`/videos/${id}/like`);
    return response.data;
  },

  async dislikeVideo(id) {
    const response = await api.post(`/videos/${id}/dislike`);
    return response.data;
  },

  async getVideosByChannel(channelId) {
    const response = await api.get(`/videos/channel/${channelId}`);
    return response.data;
  }
};
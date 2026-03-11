import api from './api';

export const channelService = {
  async createChannel(channelData) {
    const response = await api.post('/channels', channelData);
    return response.data;
  },

  async getUserChannels() {
    const response = await api.get('/channels/user');
    return response.data;
  },

  async getChannelById(id) {
    const response = await api.get(`/channels/${id}`);
    return response.data;
  },

  async updateChannel(id, channelData) {
    const response = await api.put(`/channels/${id}`, channelData);
    return response.data;
  },

  async deleteChannel(id) {
    const response = await api.delete(`/channels/${id}`);
    return response.data;
  },

  async getChannelVideos(id) {
    const response = await api.get(`/channels/${id}/videos`);
    return response.data;
  },

  async subscribeToChannel(id) {
    const response = await api.post(`/channels/${id}/subscribe`);
    return response.data;
  },

  async unsubscribeFromChannel(id) {
    const response = await api.post(`/channels/${id}/unsubscribe`);
    return response.data;
  }
};
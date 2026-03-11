import api from './api';

export const authService = {
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Register response:', response.data); // Debug log
      
      // Handle both response formats
      const data = response.data.data || response.data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Register error:', error.response?.data || error);
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login response:', response.data); // Debug log
      
      // Handle both response formats
      const data = response.data.data || response.data;
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
      }
      throw new Error('No token received');
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
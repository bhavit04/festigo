import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const authService = {
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to login');
    }
  },

  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to signup');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;

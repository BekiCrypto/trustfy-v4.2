import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

const getAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const reviewsApi = {
  createReview: async (payload) => {
    const headers = getAuthHeader();
    const response = await axios.post(`${API_URL}/reviews`, payload, { headers });
    return response.data;
  },

  getStats: async (address) => {
    const response = await axios.get(`${API_URL}/reviews/stats`, { 
      params: { address } 
    });
    return response.data;
  },

  listReviews: async (filters) => {
    const headers = getAuthHeader();
    const response = await axios.get(`${API_URL}/reviews`, { params: filters, headers });
    return response.data;
  }
};

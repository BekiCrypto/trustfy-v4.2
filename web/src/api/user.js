import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const userApi = {
  // Get current user profile
  me: async () => {
    const response = await axios.get(`${BASE_URL}/v1/auth/me`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    const response = await axios.get(`${BASE_URL}/v1/notifications`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  markRead: async (id) => {
    const response = await axios.post(`${BASE_URL}/v1/notifications/${id}/read`, {}, {
      headers: getHeaders(),
    });
    return response.data;
  },

  markAllRead: async () => {
    const response = await axios.post(`${BASE_URL}/v1/notifications/read-all`, {}, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getPreferences: async () => {
    const response = await axios.get(`${BASE_URL}/v1/notifications/preferences`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updatePreferences: async (data) => {
    const response = await axios.post(`${BASE_URL}/v1/notifications/preferences`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Public Profile
  getProfile: async (address) => {
    try {
        const response = await axios.get(`${BASE_URL}/v1/users/${address}`, {
        headers: getHeaders(),
        });
        return response.data;
    } catch (e) {
        return null;
    }
  },

  getReviews: async (address) => {
    const response = await axios.get(`${BASE_URL}/v1/reviews?reviewed=${address}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axios.patch(`${BASE_URL}/v1/users/me`, data, {
      headers: getHeaders(),
    });
    return response.data;
  }
};

import axios from 'axios';
import { getAuthToken } from '../utils/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/v1`;

// Helper to get auth header
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const referralsApi = {
  getDashboard: async () => {
    const response = await axios.get(`${API_URL}/referrals/me/dashboard`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  createCode: async () => {
    const response = await axios.post(`${API_URL}/referrals/codes`, {}, {
      headers: getHeaders(),
    });
    return response.data;
  },

  withdraw: async (data) => {
    const response = await axios.post(`${API_URL}/referrals/withdraw`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  transferToCredit: async (data) => {
    const response = await axios.post(`${API_URL}/referrals/transfer-to-credit`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },
  
  attribution: async (refCode, refereeAddress) => {
    const response = await axios.post(`${API_URL}/referrals/attribution`, { refCode, refereeAddress });
    return response.data;
  },

  getWalletTransactions: async () => {
    const response = await axios.get(`${API_URL}/referrals/wallet/transactions`, {
      headers: getHeaders(),
    });
    return response.data;
  }
};

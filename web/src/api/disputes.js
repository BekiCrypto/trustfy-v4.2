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

export const disputesApi = {
  // List disputes with optional filters
  list: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append('status', params.status);
    if (params.assignee) searchParams.append('assignee', params.assignee);
    
    const response = await axios.get(`${BASE_URL}/v1/disputes?${searchParams.toString()}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Get single dispute details
  get: async (escrowId) => {
    const response = await axios.get(`${BASE_URL}/v1/disputes/${escrowId}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Open a new dispute
  open: async (escrowId, data) => {
    const response = await axios.post(`${BASE_URL}/v1/escrows/${escrowId}/dispute/open`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Claim a dispute (assign to self)
  claim: async (escrowId) => {
    const response = await axios.post(`${BASE_URL}/v1/disputes/${escrowId}/claim`, {}, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Escalate a dispute
  escalate: async (escrowId, level, status) => {
    const response = await axios.post(`${BASE_URL}/v1/disputes/${escrowId}/escalate`, { level, status }, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Resolve a dispute
  resolve: async (escrowId, data) => {
    const response = await axios.post(`${BASE_URL}/v1/disputes/${escrowId}/resolve`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Save AI Analysis
  saveAnalysis: async (escrowId, analysis, tier) => {
    const response = await axios.post(`${BASE_URL}/v1/disputes/${escrowId}/analysis`, { analysis, tier }, {
      headers: getHeaders(),
    });
    return response.data;
  }
};

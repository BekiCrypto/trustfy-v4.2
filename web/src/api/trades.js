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

export const tradesApi = {
  // Escrows
  listEscrows: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await axios.get(`${BASE_URL}/v1/escrows?${searchParams.toString()}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  getEscrow: async (id) => {
    const response = await axios.get(`${BASE_URL}/v1/escrows/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  // Offers
  listOffers: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await axios.get(`${BASE_URL}/v1/offers?${searchParams.toString()}`, {
      headers: getHeaders(),
    });
    return response.data;
  },

  createOffer: async (data) => {
    const response = await axios.post(`${BASE_URL}/v1/offers`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  updateOffer: async (id, data) => {
    const response = await axios.patch(`${BASE_URL}/v1/offers/${id}`, data, {
      headers: getHeaders(),
    });
    return response.data;
  },

  deleteOffer: async (id) => {
    const response = await axios.delete(`${BASE_URL}/v1/offers/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  }
};

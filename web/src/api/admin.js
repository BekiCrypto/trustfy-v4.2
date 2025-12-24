import axios from "axios";
import { API_URL, getAuthHeader } from "./base44Client";

export const adminApi = {
  getStats: async () => {
    const headers = await getAuthHeader();
    const response = await axios.get(`${API_URL}/admin/stats`, { headers });
    return response.data;
  },

  listUsers: async (page = 1, limit = 20, search = "") => {
    const headers = await getAuthHeader();
    const params = { page, limit, search };
    const response = await axios.get(`${API_URL}/admin/users`, { headers, params });
    return response.data;
  },

  listTrades: async (page = 1, limit = 20, status = "") => {
    const headers = await getAuthHeader();
    const params = { page, limit, status };
    const response = await axios.get(`${API_URL}/admin/trades`, { headers, params });
    return response.data;
  },

  listDisputes: async (page = 1, limit = 20, status = "") => {
    const headers = await getAuthHeader();
    const params = { page, limit, status };
    const response = await axios.get(`${API_URL}/admin/disputes`, { headers, params });
    return response.data;
  },

  listPools: async (tokenKey) => {
    const headers = await getAuthHeader();
    const params = tokenKey ? { tokenKey } : {};
    const response = await axios.get(`${API_URL}/admin/pools`, { headers, params });
    return response.data;
  },

  listTokens: async (chainId, tokenKey) => {
    const headers = await getAuthHeader();
    const params = {};
    if (chainId) params.chainId = chainId;
    if (tokenKey) params.tokenKey = tokenKey;
    const response = await axios.get(`${API_URL}/admin/tokens`, { headers, params });
    return response.data;
  },

  upsertToken: async (tokenData) => {
    const headers = await getAuthHeader();
    const response = await axios.post(`${API_URL}/admin/tokens`, tokenData, { headers });
    return response.data;
  },

  addRole: async (roleType, address) => {
    // roleType: 'arbitrators' | 'admins'
    const headers = await getAuthHeader();
    const response = await axios.post(`${API_URL}/admin/roles/${roleType}`, { address }, { headers });
    return response.data;
  },

  withdraw: async (tokenKey, amount, recipient) => {
    const headers = await getAuthHeader();
    const response = await axios.post(`${API_URL}/admin/withdraw`, { tokenKey, amount, recipient }, { headers });
    return response.data;
  },

  resolveDispute: async (escrowId, outcome) => {
    // outcome: 'buyer' | 'seller' | 'split'
    const headers = await getAuthHeader();
    const response = await axios.post(`${API_URL}/disputes/${escrowId}/resolve`, { outcome }, { headers });
    return response.data;
  }
};

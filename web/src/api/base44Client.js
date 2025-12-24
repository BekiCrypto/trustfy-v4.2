import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import { sessionStore } from '@/lib/session';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_URL = BASE_URL;

const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : undefined,
  };
};

export const getAuthHeader = getHeaders;

// Helper for generic CRUD operations
const createEntityClient = (endpoint) => ({
  list: async (params = {}) => {
    const searchParams = new URLSearchParams(params);
    const response = await axios.get(`${BASE_URL}/v1/${endpoint}?${searchParams.toString()}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
  filter: async (filter, sort, limit) => {
    // Mapping filter object to query params is complex, simplified here for now
    // In a real app, we'd serialize 'filter' properly or use a POST search endpoint
    const response = await axios.get(`${BASE_URL}/v1/${endpoint}`, {
      params: { ...filter, sort, limit },
      headers: getHeaders(),
    });
    return response.data;
  },
  create: async (payload) => {
    const response = await axios.post(`${BASE_URL}/v1/${endpoint}`, payload, {
      headers: getHeaders(),
    });
    return response.data;
  },
  update: async (id, payload) => {
    const response = await axios.patch(`${BASE_URL}/v1/${endpoint}/${id}`, payload, {
      headers: getHeaders(),
    });
    return response.data;
  },
  delete: async (id) => {
    const response = await axios.delete(`${BASE_URL}/v1/${endpoint}/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  },
  // Specific get by ID
  get: async (id) => {
    const response = await axios.get(`${BASE_URL}/v1/${endpoint}/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  }
});

const auth = {
  isAuthenticated: async () => {
    return !!getAuthToken();
  },
  me: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/v1/auth/me`, {
        headers: getHeaders(),
      });
      return response.data;
    } catch (e) {
      return null;
    }
  },
  logout: async () => {
    try {
      await axios.post(`${BASE_URL}/v1/auth/logout`, {}, { headers: getHeaders() });
    } catch (e) {
      // Ignore logout errors
    }
    sessionStore.clear();
    return true;
  },
  redirectToLogin: (redirectUrl) => {
    if (typeof window === "undefined") return;
    if (redirectUrl) {
      window.location.href = redirectUrl;
      return;
    }
    window.location.reload();
  },
};

// Map entity names to API endpoints
const entityEndpoints = {
  TradeOffer: 'offers',
  Escrow: 'escrows',
  Dispute: 'disputes',
  User: 'users',
  Notification: 'notifications'
};

const entities = new Proxy(
  {},
  {
    get: (_, rawName) => {
      const name = String(rawName);
      const endpoint = entityEndpoints[name] || name.toLowerCase() + 's'; // Fallback to plural
      return createEntityClient(endpoint);
    },
  }
);

const functions = new Proxy(
  {
    invoke: async (name, payload) => {
      // TODO: Map specific functions to endpoints if needed
      console.warn(`Function ${name} invoked but not fully implemented in base44Client`);
      return { ok: true, name, payload };
    },
  },
  {
    get: (target, rawName) => {
      if (rawName in target) return target[rawName];
      const name = String(rawName);
      return async (payload) => ({
        ok: true,
        name,
        payload,
      });
    },
  }
);

const integrations = {
  Core: {
    InvokeLLM: async () => ({
      suggested_ruling: "split",
      confidence_score: 50,
      reasoning: "Placeholder response until LLM integration is wired.",
      factors: {
        chat_sentiment: "Neutral",
        evidence_quality: "Moderate",
        pattern_confidence: "Low",
      },
      key_points: ["LLM integration pending"],
    }),
    UploadFile: async () => ({
      file_url: "about:blank",
    }),
    UploadPrivateFile: async () => ({
      file_url: "about:blank",
    }),
    CreateFileSignedUrl: async () => ({
      url: "about:blank",
      expires_at: new Date().toISOString(),
    }),
    ExtractDataFromUploadedFile: async () => ({
      fields: {},
      confidence: 0,
    }),
    SendEmail: async () => ({
      ok: true,
    }),
    GenerateImage: async () => ({
      image_url: "about:blank",
    }),
  },
};

export const base44 = {
  auth,
  entities,
  functions,
  integrations,
  asServiceRole: {
    entities,
  },
};

export default base44;

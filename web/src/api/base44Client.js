import { sessionStore } from "@/lib/session";

const memoryStore = new Map();

const getCollection = (name) => {
  if (!memoryStore.has(name)) {
    memoryStore.set(name, []);
  }
  return memoryStore.get(name);
};

const nowIso = () => new Date().toISOString();

const matchesFilter = (item, filter) => {
  if (!filter) return true;
  return Object.entries(filter).every(([key, value]) => {
    if (value && typeof value === "object" && "$in" in value) {
      return value.$in.includes(item[key]);
    }
    if (value && typeof value === "object") {
      return false;
    }
    return item[key] === value;
  });
};

const listEntity = (name, sort, limit) => {
  const collection = [...getCollection(name)];
  if (typeof limit === "number") {
    return collection.slice(0, limit);
  }
  return collection;
};

const filterEntity = (name, filter, sort, limit) => {
  const collection = getCollection(name).filter((item) => matchesFilter(item, filter));
  if (typeof limit === "number") {
    return collection.slice(0, limit);
  }
  return collection;
};

const createEntity = (name, payload) => {
  const collection = getCollection(name);
  const id = payload?.id ?? `${name}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const record = {
    ...payload,
    id,
    created_date: payload?.created_date ?? nowIso(),
    updated_date: payload?.updated_date ?? nowIso(),
  };
  collection.unshift(record);
  return record;
};

const updateEntity = (name, id, payload) => {
  const collection = getCollection(name);
  const index = collection.findIndex((item) => item.id === id);
  if (index === -1) {
    return createEntity(name, { ...payload, id });
  }
  const record = {
    ...collection[index],
    ...payload,
    id,
    updated_date: nowIso(),
  };
  collection[index] = record;
  return record;
};

const deleteEntity = (name, id) => {
  const collection = getCollection(name);
  const index = collection.findIndex((item) => item.id === id);
  if (index >= 0) {
    collection.splice(index, 1);
  }
  return { id };
};

const resolveRole = (roles = []) => {
  if (roles.includes("ADMIN")) return "admin";
  if (roles.includes("ARBITRATOR")) return "arbitrator";
  if (roles.includes("SUPER_ADMIN")) return "super_admin";
  return "user";
};

const auth = {
  isAuthenticated: async () => {
    const session = sessionStore.get();
    return Boolean(session?.accessToken);
  },
  me: async () => {
    const session = sessionStore.get();
    if (!session?.address) {
      return null;
    }
    return {
      email: session.address,
      role: resolveRole(session.roles),
      full_name: "Trustfy User",
    };
  },
  logout: async () => {
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

const entities = new Proxy(
  {},
  {
    get: (_, rawName) => {
      const name = String(rawName);
      return {
        list: async (sort, limit) => listEntity(name, sort, limit),
        filter: async (filter, sort, limit) => filterEntity(name, filter, sort, limit),
        create: async (payload) => createEntity(name, payload),
        update: async (id, payload) => updateEntity(name, id, payload),
        delete: async (id) => deleteEntity(name, id),
      };
    },
  }
);

const functions = new Proxy(
  {
    invoke: async (name, payload) => ({
      ok: true,
      name,
      payload,
    }),
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
      expires_at: nowIso(),
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

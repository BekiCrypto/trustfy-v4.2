
import { sessionStore } from "@/lib/session";

export const getAuthToken = () => {
  const session = sessionStore.get();
  return session?.accessToken || null;
};

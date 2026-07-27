import { create } from "zustand";
import { api, type MeResponse, type User } from "../lib/api";

interface AuthState {
  user: User | null;
  me: MeResponse | null;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setMe: (me: MeResponse | null) => void;
  setToken: (token: string | null) => void;
  initialize: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  me: null,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setMe: (me) => set({ me, user: me ? { id: me.id, email: me.email, role: me.role } : null }),

  setToken: (token) => {
    api.setToken(token);
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const stored = api.getStoredToken();
      if (stored) {
        api.setToken(stored);
        try {
          const me = await api.getMe();
          set({ me, user: { id: me.id, email: me.email, role: me.role } });
          return;
        } catch {
          api.setToken(null);
        }
      }

      const refreshed = await api.refresh();
      if (refreshed) {
        set({ user: refreshed.user });
        const me = await api.getMe();
        set({ me, user: { id: me.id, email: me.email, role: me.role } });
      }
    } catch {
      api.setToken(null);
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  logout: async () => {
    await api.logout();
    api.setToken(null);
    set({ user: null, me: null });
  },
}));

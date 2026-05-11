import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, setAuthToken } from "../services/api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      hydrateAuthHeader: () => {
        const { token } = get();
        setAuthToken(token);
      },
      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/register", payload);
          setAuthToken(data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || "Registration failed.";
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },
      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post("/auth/login", payload);
          setAuthToken(data.token);
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || "Login failed.";
          set({ isLoading: false, error: message });
          return { success: false, message };
        }
      },
      fetchMe: async () => {
        if (!get().token) {
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user, isAuthenticated: true, isLoading: false });
        } catch {
          setAuthToken(null);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // The local session should always clear on logout.
        }

        setAuthToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: "volatrix-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

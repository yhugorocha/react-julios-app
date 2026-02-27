import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthResponse, Role } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  tokenType: string | null;
  expiresAt: string | null;
  userId: number | null;
  role: Role | null;
  isAuthenticated: boolean;
  setSession: (session: AuthResponse) => void;
  clearSession: () => void;
}

const initialState = {
  accessToken: null,
  tokenType: null,
  expiresAt: null,
  userId: null,
  role: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setSession: (session) => {
        set({
          accessToken: session.accessToken,
          tokenType: session.tokenType,
          expiresAt: session.expiresAt,
          userId: session.userId,
          role: session.role,
          isAuthenticated: true,
        });
      },
      clearSession: () => set({ ...initialState }),
    }),
    {
      name: "expense-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt,
        userId: state.userId,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);


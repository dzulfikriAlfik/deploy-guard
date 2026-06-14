import { create } from "zustand";

import type { AuthProfile } from "../types/auth";

interface AuthState {
  profile: AuthProfile | null;
  isAuthenticated: boolean;
  setProfile: (profile: AuthProfile) => void;
  clearProfile: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  isAuthenticated: false,
  setProfile: (profile) =>
    set({
      profile,
      isAuthenticated: true,
    }),
  clearProfile: () =>
    set({
      profile: null,
      isAuthenticated: false,
    }),
}));
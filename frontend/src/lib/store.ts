import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  isCartOpen: false,
  setIsCartOpen: (open) => set({ isCartOpen: open }),
}));

interface AuthState {
  user: { name: string; role: string } | null;
  setUser: (user: { name: string; role: string } | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: { name: "Admin User", role: "admin" }, // Mocked for now
  setUser: (user) => set({ user }),
}));

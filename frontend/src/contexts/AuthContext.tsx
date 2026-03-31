// Refresh
"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { apiService } from "@/services/api";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface Tenant {
  id: number;
  name: string;
  subdomain: string;
  logo_url?: string | null;
}

interface User {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  created_at?: string;
  last_message_read_at?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  tenant_id?: number;
  tenant?: Tenant;
  role: {
    name: string;
  };
  member?: {
    id: number;
    member_code: string;
    avatar_url?: string;
    phone?: string;
    address?: string;
  };
  impersonating?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<{ redirect_url?: string | null }>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUser: (partialUser: Partial<User>) => void;
  handleCallback: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Session storage helpers ─────────────────────────────────────────────
  const saveSession = (token: string, userData: User) => {
    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userData));
    
    // Sync to cookie for Next.js middleware
    // Use a wild-card domain if possible to share session between subdomains
    const host = window.location.hostname;
    let cookieDomain = "";
    
    if (host.includes("lvh.me")) {
      cookieDomain = "; domain=.lvh.me";
    } else if (host.includes("cleverarchives.com")) {
      cookieDomain = "; domain=.cleverarchives.com";
    } else {
      const parts = host.split('.');
      if (parts.length > 1 && !host.includes("localhost")) {
        cookieDomain = `; domain=.${parts.slice(-2).join('.')}`;
      }
    }
    
    document.cookie = `auth_token=${token}; path=/${cookieDomain}; SameSite=Lax`;
  };

  const clearSession = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    
    const host = window.location.hostname;
    let cookieDomain = "";
    
    if (host.includes("lvh.me")) {
      cookieDomain = "; domain=.lvh.me";
    } else if (host.includes("cleverarchives.com")) {
      cookieDomain = "; domain=.cleverarchives.com";
    } else {
      const parts = host.split('.');
      if (parts.length > 1 && !host.includes("localhost")) {
        cookieDomain = `; domain=.${parts.slice(-2).join('.')}`;
      }
    }
    
    document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    if (cookieDomain) {
      document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${cookieDomain}`;
    }
  };

  // ─── Inactivity timer ────────────────────────────────────────────────────
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      sessionStorage.setItem("session_expired", "1");
      clearSession();
      setUser(null);
      // Redirect to home
      window.location.href = "/";
    }, INACTIVITY_TIMEOUT_MS);
  }, []);

  // Start timer when user is present, clear when user is null
  useEffect(() => {
    if (!user) {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      return;
    }

    const events: (keyof WindowEventMap)[] = ["mousemove", "click", "keypress", "scroll"];
    events.forEach(e => window.addEventListener(e, resetInactivityTimer, { passive: true }));
    resetInactivityTimer(); // start immediately

    return () => {
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [user, resetInactivityTimer]);

  // ─── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        clearSession();
      }
    }
    setLoading(false);
  }, []);

  // ─── Login ───────────────────────────────────────────────────────────────
  const login = async (credentials: any): Promise<{ redirect_url?: string | null }> => {
    const data = await apiService.auth.login(credentials);

    if (data.redirect_url) {
      // Tenant owner → redirect to subdomain callback
      // Store token temporarily so callback can find it if needed
      sessionStorage.setItem("pending_token", data.token);
      return { redirect_url: data.redirect_url };
    }

    // System owner → no subdomain redirect
    saveSession(data.token, data.user);
    setUser(data.user);
    return { redirect_url: null };
  };

  // ─── Callback (subdomain token exchange) ─────────────────────────────────
  const handleCallback = async (token: string) => {
    const data = await apiService.auth.callback(token);
    saveSession(data.token, data.user);
    setUser(data.user);
  };

  // ─── Register ────────────────────────────────────────────────────────────
  const register = async (formData: any) => {
    const data = await apiService.auth.register(formData);
    saveSession(data.token, data.user);
    setUser(data.user);
    const locale = window.location.pathname.split('/')[1] || 'en';
    router.push(`/${locale}/dashboard`);
  };

  // ─── Logout ──────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    clearSession();
    setUser(null);
    // Redirect to home
    window.location.href = "/";
  }, []);

  // ─── Update user ─────────────────────────────────────────────────────────
  const updateUser = (partialUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...partialUser };
      sessionStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // ─── Dynamic Favicon ───────────────────────────────────────────────────
  useEffect(() => {
    if (user?.tenant?.logo_url) {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || "http://localhost:3001";
      const fullLogoUrl = user.tenant.logo_url.startsWith('http') 
        ? user.tenant.logo_url 
        : `${apiBaseUrl}${user.tenant.logo_url}`;
      
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = fullLogoUrl;
    }
  }, [user?.tenant?.logo_url]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetInactivityTimer,
    updateUser,
    handleCallback
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

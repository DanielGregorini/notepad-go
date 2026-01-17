"use client";

import { createContext, useContext, useState } from "react";

/* =======================
   Types
======================= */

type User = {
  id: string;
  name: string;
  email: string;
};

type SlugToken = {
  slug: string;
  token: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;

  saveSlugToken: (slug: string, token: string) => void;
  getSlugToken: (slug: string) => string | null;
  hasSlugToken: (slug: string) => boolean;
  removeSlugToken: (slug: string) => void;
  listSlugTokens: () => SlugToken[];
};

/* =======================
   Consts
======================= */

const USER_TOKEN_KEY = "token";
const USER_KEY = "user";
const SLUG_TOKENS_KEY = "slug_tokens";

/* =======================
   Context
======================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* =======================
   Helpers
======================= */

function readInitialAuth() {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }

  const token = localStorage.getItem(USER_TOKEN_KEY);
  const userRaw = localStorage.getItem(USER_KEY);

  return {
    token,
    user: userRaw ? JSON.parse(userRaw) : null,
  };
}

function readSlugTokens(): SlugToken[] {
  const raw = localStorage.getItem(SLUG_TOKENS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeSlugTokens(tokens: SlugToken[]) {
  localStorage.setItem(SLUG_TOKENS_KEY, JSON.stringify(tokens));
}

/* =======================
   Provider
======================= */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ✅ estado inicial resolvido UMA VEZ
  const [auth, setAuth] = useState(readInitialAuth);

  /* ===== User auth ===== */

  const login = (token: string, user: User) => {
    localStorage.setItem(USER_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuth({ token, user });
  };

  const updateUser = (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setAuth((prev) => ({
      token: prev.token,
      user,
    }));
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, user: null });
  };

  /* ===== Slug auth ===== */

  const saveSlugToken = (slug: string, token: string) => {
    const tokens = readSlugTokens().filter((t) => t.slug !== slug);
    tokens.push({ slug, token });
    writeSlugTokens(tokens);
  };

  const getSlugToken = (slug: string) =>
    readSlugTokens().find((t) => t.slug === slug)?.token ?? null;

  const hasSlugToken = (slug: string) => !!getSlugToken(slug);

  const removeSlugToken = (slug: string) => {
    writeSlugTokens(readSlugTokens().filter((t) => t.slug !== slug));
  };

  const listSlugTokens = () => readSlugTokens();

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        token: auth.token,
        isAuthenticated: !!auth.user,

        login,
        logout,
        updateUser,

        saveSlugToken,
        getSlugToken,
        hasSlugToken,
        removeSlugToken,
        listSlugTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =======================
   Hook
======================= */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

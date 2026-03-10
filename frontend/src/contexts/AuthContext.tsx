"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "READER" | "AUTHOR" | "ADMIN";
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: unknown) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function login(credentials: unknown) {
    try {
      const response = await api.post("/auth/login", credentials);
      setUser(response.data);
    } catch (error) {
      console.error("Error while logging in:", error);
      throw error;
    }
  }

  function logout() {
    // TODO
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

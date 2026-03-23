"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "READER" | "AUTHOR" | "ADMIN";
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  async function login(credentials: LoginCredentials) {
    try {
      const response = await api.post("/auth/login", credentials);
      setUser(response.data);
    } catch (error) {
      console.error("Error while logging in:", error);
      throw error;
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (err: unknown) {
      console.error("Error communicating the logout to the server:", err);
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
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

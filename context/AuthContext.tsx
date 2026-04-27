"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface User {
  id: number;
  name: string;
  email: string;
  region: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token on mount
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      setToken(storedToken);
      fetchUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (authToken: string) => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      // If token is invalid, clear it
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(userData);
    router.push("/");
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      localStorage.removeItem("auth_token");
      setToken(null);
      setUser(null);
      router.push("/login");
      toast.success("Logged out successfully");
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

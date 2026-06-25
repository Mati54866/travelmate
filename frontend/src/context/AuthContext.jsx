import { createContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/services";

export const AuthContext = createContext(null);

const TOKEN_KEY = "travelmate_token";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [sessionCheckFailed, setSessionCheckFailed] = useState(false);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistAuth = (nextToken, nextUser) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  };

  const hydrateUser = async () => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      setSessionCheckFailed(false);
      return;
    }

    try {
      const { data } = await authApi.me();
      setUser(data.user);
      setSessionCheckFailed(false);
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        clearAuth();
      } else {
        setSessionCheckFailed(true);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    hydrateUser();
  }, []);

  const login = async (payload) => {
    const { data } = await authApi.login(payload);
    persistAuth(data.token, data.user);
    toast.success("Welcome back!");
    return data;
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    persistAuth(data.token, data.user);
    toast.success("Your account is ready");
    return data;
  };

  const loginWithGoogle = async (payload) => {
    const { data } = await authApi.google(payload);
    persistAuth(data.token, data.user);
    toast.success("Signed in with Google");
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await authApi.updateProfile(payload);
    setUser(data.user);
    toast.success("Profile updated");
    return data;
  };

  const logout = () => {
    clearAuth();
    toast.success("Signed out");
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      sessionCheckFailed,
      login,
      register,
      loginWithGoogle,
      updateProfile,
      setUser,
      logout,
      hydrateUser
    }),
    [token, user, loading, sessionCheckFailed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

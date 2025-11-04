import { createContext, useState, useEffect, useCallback } from "react";
import { login as apiLogin, getProfile } from "../api/auth"; 
import api from "../api/axiosInstance"; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("access_token") || null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, []);
  
  // Tự động thêm token vào header cho MỌI request
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = "Bearer " + token;
      localStorage.setItem("access_token", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }, [token]);

  // Tự động lấy thông tin user nếu F5 trang mà vẫn còn token
  useEffect(() => {
    if (token && !user) {
      (async () => {
        try {
          const res = await getProfile();
          // res is an axios response; profile is in res.data
          const profileData = res?.data ?? res;
          setUser(profileData?.data ?? profileData);
        } catch (error) {
          console.error("Failed to fetch profile, logging out.", error);
          setToken(null); // Token hỏng, tự động logout
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [token, user, logout]);

  const login = async (email, password) => {
    try {
      // apiLogin returns an axios response
      const res = await apiLogin(email, password);
      const data = res?.data ?? res;

      // Hỗ trợ cả access_token hoặc accessToken tuỳ backend
      const access = data?.access_token || data?.accessToken || data?.token;
      const refresh = data?.refresh_token || data?.refreshToken;

      if (access) {
        setToken(access);
      }
      if (refresh) {
        localStorage.setItem("refresh_token", refresh);
      }

      // Try to set user from returned payload, or fetch profile later
      const userData = data?.user ?? data?.data ?? null;

      // If backend returns user in login response, use it immediately.
      if (userData) {
        setUser(userData);
        return data;
      }

      // Otherwise, try to fetch profile right away so callers (e.g. Login.jsx)
      // have `user` available when login resolves. This avoids a race where
      // the app navigates to a protected route before the profile is fetched
      // and ProtectedRoute redirects back to /auth/login.
      try {
        // Ensure axios has the header for immediate profile fetch
        if (access) api.defaults.headers.common["Authorization"] = "Bearer " + access;
        const profileRes = await getProfile();
        const profileData = profileRes?.data ?? profileRes;
        const profile = profileData?.data ?? profileData;
        if (profile) {
          setUser(profile);
          return {...data, user: profile};
        }
      } catch (err) {
        // If fetching profile fails here, we don't throw — login succeeded
        // (tokens saved) but profile will be attempted again by the effect.
        console.warn("Could not fetch profile immediately after login:", err);
      }

      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error; 
    }
  };

  const value = { user, token, loading, setUser, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
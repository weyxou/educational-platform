import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function safeParse(jsonString) {
  try {
    if (!jsonString) return null;
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Ошибка JSON.parse в AuthContext:", e);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = safeParse(localStorage.getItem("user"));

    if (savedToken && savedUser) {
      // Приводим role к строке
      const normalizedUser = { ...savedUser, role: savedUser?.role?.role || savedUser?.role };
      setToken(savedToken);
      setUser(normalizedUser);
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }

    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    // Приводим role к строке
    const normalizedUser = { ...userData, role: userData?.role?.role || userData?.role };
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setToken(jwtToken);
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const authFetch = async (url, options = {}) => {
    if (!token) throw new Error("No token");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      logout();
      window.location.href = "/login";
      throw new Error("Token expired");
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        role: user?.role || null,
        isAuthenticated: !!token,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

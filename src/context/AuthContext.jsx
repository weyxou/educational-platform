import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function safeParse(jsonString) {
  try {
    return jsonString ? JSON.parse(jsonString) : null;
  } catch (e) {
    console.error("Ошибка JSON.parse в AuthContext:", e);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("jwtToken");
    const savedUser = safeParse(localStorage.getItem("user"));

    if (savedToken && savedUser) {
      const normalizedUser = {
        ...savedUser,
        role: savedUser?.role?.role || savedUser?.role || null
      };
      setUser(normalizedUser);
    } else {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    const normalizedUser = {
      ...userData,
      role: userData?.role?.role || userData?.role || null
    };
    localStorage.setItem("user", JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
        role: user?.role || null,
        isAuthenticated: !!user,
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

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  console.log('From user auth context')

  useEffect(() => {
    // Check local storage or cookies for a persisted user session
    const persistedUser = localStorage.getItem('realchat_user');
    if (persistedUser) {
      setUser(JSON.parse(persistedUser));
    }
  }, []);

  const login = (userData) => {
    // Save user data to state
    setUser(userData);
    // Save user data to local storage for persistence
    localStorage.setItem('realchat_user', JSON.stringify(userData));
  };

  const logout = () => {
    // Remove user data from state
    setUser(null);
    // Clear user data from local storage
    localStorage.removeItem('realchat_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

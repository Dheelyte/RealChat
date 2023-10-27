import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Api from '../Api';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}


export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage or cookies for a persisted user session
    const persistedUser = localStorage.getItem('realchat_user');
    if (persistedUser) {
      setUser(JSON.parse(persistedUser));
    }
    setLoading(false); // Set loading to false when authentication check is done
  }, []);

  const login = (userData) => {
    // Save user data to state
    setUser(userData);
    // Save user data to local storage for persistence
    localStorage.setItem('realchat_user', JSON.stringify(userData));
  };

  const logout = () => {
    // Remove user data from 
      try {
        Api.post('user/logout/', {}, {
          headers: {
              'Authorization': `Token ${user.token}`
          }
        })
        setUser(null);
        // Clear user data from local storage
        localStorage.removeItem('realchat_user');
        navigate("/login", { replace: true });
      } catch {

      }
    
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {!loading && (
        // Render the children only when authentication check is complete
        children
      )}
    </AuthContext.Provider>
  );
}

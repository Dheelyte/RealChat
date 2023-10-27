import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';


export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    // user is not authenticated
    return <Navigate to="/login" />;
  }
  return children;
};
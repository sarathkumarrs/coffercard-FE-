import React, { useEffect } from 'react';
import { Navigate, Outlet , useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for token expiration
    const token = localStorage.getItem('access_token');
    if (!token) {
        navigate('/login');
    }
    
    // Optional: Check token expiration if you have expiry time
    const tokenData = localStorage.getItem('user');
    if (!tokenData) {
        navigate('/login');
    }
}, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
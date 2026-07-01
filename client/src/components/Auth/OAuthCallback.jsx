import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import instance from '../../axios';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');

      if (error) {
        navigate('/login', { state: { error: 'Google authentication failed' } });
        return;
      }

      if (token) {
        try {
          // Store the token in localStorage
          localStorage.setItem('token', token);
          
          // Set the token in axios headers
          instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user details from backend
          const response = await instance.get('/users/me');
          const userData = response.data;
          
          // Set user in auth context and localStorage
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // Redirect to dashboard
          navigate('/', { replace: true });
        } catch (error) {
          console.error('Error handling OAuth callback:', error);
          
          // Fallback: decode token to get basic info
          try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const decoded = JSON.parse(jsonPayload);
            
            setUser({
              _id: decoded.id,
              role: decoded.role,
              name: decoded.name || 'Google User',
              email: decoded.email || ''
            });
            
            navigate('/', { replace: true });
          } catch (decodeError) {
            console.error('Error decoding token:', decodeError);
            navigate('/login', { state: { error: 'Authentication failed' } });
          }
        }
      } else {
        navigate('/login', { state: { error: 'No token received' } });
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
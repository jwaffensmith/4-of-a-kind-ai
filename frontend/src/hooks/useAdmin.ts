import { useState, useEffect } from 'react';
import { adminApi, ApiError } from '../services/adminApi';
import { useNavigate } from 'react-router-dom';

export const useAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await adminApi.login(password);
      sessionStorage.setItem('admin_token', response.token);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        throw new Error('Invalid password');
      }
      throw new Error('Login failed. Please try again.');
    }
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('admin_token');
      setIsAuthenticated(false);
      navigate('/admin/login');
    }
  };

  const handleApiError = (error: unknown) => {
    if (error instanceof ApiError && error.statusCode === 401) {
      sessionStorage.removeItem('admin_token');
      setIsAuthenticated(false);
      navigate('/admin/login');
    }
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    handleApiError,
  };
};


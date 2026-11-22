import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, supabaseClient } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ambil sesi user saat pertama kali load
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Error init auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Supabase auth state change listener jika terhubung
    if (supabaseClient) {
      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            setUser(session.user);
            localStorage.setItem('brewspace_token', session.access_token);
          } else {
            setUser(null);
            localStorage.removeItem('brewspace_token');
          }
        }
      );
      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email, password) => {
    const loggedUser = await authService.signIn(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (email, password, fullName) => {
    const registeredUser = await authService.signUp(email, password, fullName);
    setUser(registeredUser);
    return registeredUser;
  };

  const updateUserName = async (fullName) => {
    const updatedUser = await authService.updateFullName(fullName);
    setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUserName, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

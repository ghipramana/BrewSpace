import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, supabaseClient } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (supabaseClient) {
      let receivedAuthEvent = false;
      const applySession = (session) => {
        if (!active) return;
        const nextUser = session?.user || null;
        setUser(nextUser);
        setIsAdmin(false);
        setAdminLoading(Boolean(nextUser));
        if (session?.access_token) {
          localStorage.setItem('brewspace_token', session.access_token);
        } else {
          localStorage.removeItem('brewspace_token');
        }
        setLoading(false);
      };

      const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
        (_event, session) => {
          receivedAuthEvent = true;
          applySession(session);
        }
      );

      supabaseClient.auth.getSession().then(({ data, error }) => {
        if (error) console.error('Gagal memuat sesi login:', error.message);
        if (!receivedAuthEvent) applySession(data?.session || null);
      }).catch((error) => {
        console.error('Gagal memuat sesi login:', error);
        if (active) setLoading(false);
      });

      return () => {
        active = false;
        subscription.unsubscribe();
      };
    }

    authService.getCurrentUser()
      .then((currentUser) => {
        if (active) {
          setUser(currentUser);
          setIsAdmin(false);
          setAdminLoading(false);
        }
      })
      .catch((error) => console.error('Error init auth:', error))
      .finally(() => { if (active) { setLoading(false); setAdminLoading(false); } });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!user || !supabaseClient) {
      setIsAdmin(false);
      setAdminLoading(false);
      return () => { active = false; };
    }

    setAdminLoading(true);
    supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error('Gagal memeriksa akses admin:', error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(Boolean(data));
      })
      .finally(() => { if (active) setAdminLoading(false); });

    return () => { active = false; };
  }, [user]);

  const login = async (email, password) => {
    const loggedUser = await authService.signIn(email, password);
    setIsAdmin(false);
    setAdminLoading(true);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (email, password, fullName) => {
    const result = await authService.signUp(email, password, fullName);
    if (!result.requiresEmailConfirmation) setUser(result.user);
    return result;
  };

  const updateUserName = async (fullName) => {
    if (!user) return null;
    const updatedUser = await authService.updateFullName(fullName);
    if (updatedUser) setUser(updatedUser);
    return updatedUser;
  };

  const logout = async () => {
    await authService.signOut();
    setIsAdmin(false);
    setAdminLoading(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, adminLoading, isAdmin, login, register, updateUserName, logout, isAuthenticated: Boolean(user) }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

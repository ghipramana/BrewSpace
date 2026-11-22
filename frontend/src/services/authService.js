import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/constants';

const isConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  SUPABASE_ANON_KEY &&
  SUPABASE_ANON_KEY.length > 20
);

export const supabaseClient = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Mock user untuk pengujian jika belum setup Supabase
const defaultMockUser = {
  id: 'u0000000-0000-0000-0000-000000000001',
  email: 'mahasiswa@brewspace.ac.id',
  user_metadata: {
    full_name: 'Penikmat Kopi Praktikum',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  }
};

export const authService = {
  /**
   * Pendaftaran akun baru
   */
  async signUp(email, password, fullName) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      if (error) throw error;
      if (data.session?.access_token) {
        localStorage.setItem('brewspace_token', data.session.access_token);
      }
      return data.user;
    }

    // Fallback registration
    const mockUser = {
      id: 'mock-user-' + Date.now(),
      email,
      user_metadata: { full_name: fullName }
    };
    localStorage.setItem('brewspace_token', 'demo-token-' + Date.now());
    localStorage.setItem('brewspace_user', JSON.stringify(mockUser));
    return mockUser;
  },

  /**
   * Masuk dengan email & password
   */
  async signIn(email, password) {
    if (supabaseClient) {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      if (data.session?.access_token) {
        localStorage.setItem('brewspace_token', data.session.access_token);
      }
      return data.user;
    }

    // Fallback login
    const user = {
      ...defaultMockUser,
      email
    };
    localStorage.setItem('brewspace_token', 'demo-token-for-testing');
    localStorage.setItem('brewspace_user', JSON.stringify(user));
    return user;
  },

  /**
   * Keluar / Logout
   */
  async signOut() {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('brewspace_token');
    localStorage.removeItem('brewspace_user');
  },

  /**
   * Cek sesi pengguna saat ini
   */
  async getCurrentUser() {
    if (supabaseClient) {
      const { data } = await supabaseClient.auth.getUser();
      return data?.user || null;
    }

    const saved = localStorage.getItem('brewspace_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultMockUser;
      }
    }
    return defaultMockUser;
  }
};

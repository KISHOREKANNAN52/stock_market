import { create } from 'zustand';
import api from '../utils/api';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => void;
}

const stored = localStorage.getItem('nifty_user');

export const useAuthStore = create<AuthState>((set) => ({
  user: stored ? JSON.parse(stored) : null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('nifty_user', JSON.stringify(data));
    set({ user: data, loading: false });
  },

  register: async (name, email, password) => {
    set({ loading: true });
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('nifty_user', JSON.stringify(data));
    set({ user: data, loading: false });
  },

  loginAsGuest: () => {
    const guestUser: User = {
      _id: 'guest',
      name: 'Guest User',
      email: 'guest@nifty50.app',
      token: ''
    };
    localStorage.setItem('nifty_user', JSON.stringify(guestUser));
    set({ user: guestUser });
  },

  logout: () => {
    localStorage.removeItem('nifty_user');
    set({ user: null });
  }
}));

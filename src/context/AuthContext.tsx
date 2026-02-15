import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('@finance_app_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    // Mock login
    const mockUser = { email, name: 'Vishakh', id: '123' };
    setUser(mockUser);
    await AsyncStorage.setItem('@finance_app_user', JSON.stringify(mockUser));
  };

  const googleLogin = async () => {
    // Mock Google Login
    const mockUser = { email: 'vishakh@gmail.com', name: 'Vishakh K', id: 'google_123', photo: null };
    setUser(mockUser);
    await AsyncStorage.setItem('@finance_app_user', JSON.stringify(mockUser));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@finance_app_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
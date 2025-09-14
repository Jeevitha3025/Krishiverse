import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Farm, UserProgress } from '@shared/schema';

interface UserContextType {
  user: User | null;
  farm: Farm | null;
  progress: UserProgress | null;
  language: string;
  setUser: (user: User | null) => void;
  setFarm: (farm: Farm | null) => void;
  setProgress: (progress: UserProgress | null) => void;
  setLanguage: (language: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [language, setLanguage] = useState('hi');

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('krishigrow_user');
    const savedFarm = localStorage.getItem('krishigrow_farm');
    const savedProgress = localStorage.getItem('krishigrow_progress');
    const savedLanguage = localStorage.getItem('krishigrow_language');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedFarm) setFarm(JSON.parse(savedFarm));
    if (savedProgress) setProgress(JSON.parse(savedProgress));
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('krishigrow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('krishigrow_user');
    }
  }, [user]);

  useEffect(() => {
    if (farm) {
      localStorage.setItem('krishigrow_farm', JSON.stringify(farm));
    } else {
      localStorage.removeItem('krishigrow_farm');
    }
  }, [farm]);

  useEffect(() => {
    if (progress) {
      localStorage.setItem('krishigrow_progress', JSON.stringify(progress));
    } else {
      localStorage.removeItem('krishigrow_progress');
    }
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('krishigrow_language', language);
  }, [language]);

  const logout = () => {
    setUser(null);
    setFarm(null);
    setProgress(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        farm,
        progress,
        language,
        setUser,
        setFarm,
        setProgress,
        setLanguage,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

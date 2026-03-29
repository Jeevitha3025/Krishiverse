import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Farm, UserProgress } from '@shared/schema';
import { auth, db } from '../firebaseConfig'; // 👈 Import our new database
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // 👈 Import Firestore tools

interface UserContextType {
  user: User | null;
  farm: Farm | null;
  progress: UserProgress | null;
  language: string;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setFarm: (farm: Farm | null) => void;
  setProgress: (progress: UserProgress | null) => void;
  setLanguage: (language: string) => void;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [farm, setFarm] = useState<Farm | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(true);

  // --- REAL CLOUD DATA CONNECTION ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // 1. Set the basic user identity
        setUser({
          id: firebaseUser.uid as any, 
          username: firebaseUser.email?.split('@')[0] || 'Farmer',
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Farmer',
          password: '', 
        } as User);

        // 2. Fetch their actual Farm and Progress from Firestore!
        try {
          const farmDoc = await getDoc(doc(db, "farms", firebaseUser.uid));
          const progressDoc = await getDoc(doc(db, "progress", firebaseUser.uid));

          if (farmDoc.exists()) {
            setFarm(farmDoc.data() as Farm);
          } else {
            setFarm(null); // No farm found = Needs Onboarding
          }

          if (progressDoc.exists()) {
            setProgress(progressDoc.data() as UserProgress);
          } else {
            setProgress(null);
          }
        } catch (error) {
          console.error("Error fetching cloud data:", error);
        }

      } else {
        // Logged out state
        setUser(null);
        setFarm(null);
        setProgress(null);
      }
      
      setIsLoading(false); // Done checking the cloud!
    });

    return () => unsubscribe();
  }, []);

  // Language preference can still safely live in local storage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('krishigrow_language');
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    localStorage.setItem('krishigrow_language', language);
  }, [language]);

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setFarm(null);
      setProgress(null);
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        farm,
        progress,
        language,
        isLoading,
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
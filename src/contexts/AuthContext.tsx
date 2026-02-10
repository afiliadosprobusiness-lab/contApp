import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ensureUserProfile, onAuthChange, UserProfile } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAuthenticated: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const bootstrapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bootstrapInFlight = useRef(false);
  const BOOTSTRAP_KEY_PREFIX = "contapp_bootstrap_user_";

  const clearBootstrapTimer = () => {
    if (bootstrapTimer.current) {
      clearTimeout(bootstrapTimer.current);
      bootstrapTimer.current = null;
    }
  };

  const bootstrapProfile = async (firebaseUser: User, attempt = 0) => {
    if (!firebaseUser || bootstrapInFlight.current) return;
    bootstrapInFlight.current = true;

    try {
      await ensureUserProfile(firebaseUser);
      localStorage.setItem(`${BOOTSTRAP_KEY_PREFIX}${firebaseUser.uid}`, String(Date.now()));
      clearBootstrapTimer();
    } catch (error) {
      if (attempt < 2) {
        const delay = 2000 * (attempt + 1);
        clearBootstrapTimer();
        bootstrapTimer.current = setTimeout(() => {
          bootstrapProfile(firebaseUser, attempt + 1);
        }, delay);
      }
    } finally {
      bootstrapInFlight.current = false;
    }
  };

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!firebaseUser) {
        setUserProfile(null);
        clearBootstrapTimer();
        setLoading(false);
        return;
      }

      const bootstrapKey = `${BOOTSTRAP_KEY_PREFIX}${firebaseUser.uid}`;
      if (!localStorage.getItem(bootstrapKey)) {
        bootstrapProfile(firebaseUser, 0);
      }

      const profileRef = doc(db, "users", firebaseUser.uid);
      unsubscribeProfile = onSnapshot(
        profileRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setUserProfile(null);
            setLoading(false);
            return;
          }

          const data = snapshot.data();
          setUserProfile({
            uid: data.uid || firebaseUser.uid,
            email: data.email || firebaseUser.email || "",
            displayName: data.displayName,
            plan: data.plan || "FREE",
            role: data.role || "USER",
            status: data.status,
            trialEndsAt: data.trialEndsAt?.toDate?.(),
            createdAt: data.createdAt?.toDate?.(),
            updatedAt: data.updatedAt?.toDate?.(),
            phone: data.phone,
            sunatSecondaryUser: data.sunatSecondaryUser,
            sunatSecondaryPassword: data.sunatSecondaryPassword,
          });
          setLoading(false);
        },
        () => {
          setUserProfile(null);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/config/supabaseClient";
import type { UserProfile } from "@/types";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMountedRef = useRef(true);

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("email", currentUser.email)
        .single();

      if (error) {
        throw error;
      }

      // Déconnexion automatique si le compte est désactivé
      if (!data.est_actif) {
        await supabase.auth.signOut();

        if (isMountedRef.current) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        return;
      }

      if (isMountedRef.current) {
        setProfile(data);
      }
    } catch (error: unknown) {
      console.error(
        "Erreur lors de la récupération du profil :",
        error
      );

      if (isMountedRef.current) {
        setProfile(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMountedRef.current) {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMountedRef.current) {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setIsLoading(true);
        fetchProfile(session.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider"
    );
  }

  return context;
};
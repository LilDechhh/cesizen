import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/config/supabaseClient";
import type { UserProfile } from "@/types";


// Type du contexte
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMountedRef = useRef(true);

  // Fonction pour récupérer le profil
  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("utilisateur")
        .select("*")
        .eq("email", currentUser.email)
        .single();

      if (error) throw error;

      if (isMountedRef.current) {
        setProfile(data);
      }
    } catch (error: unknown) {
      console.error("Erreur lors de la récupération du profil :", error);
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

    // Initialisation
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setIsLoading(false);
      }
    });

    // Écouteur des changements d'état
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMountedRef.current) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Utilisateur connecté
        fetchProfile(session.user);
      } else {
        // Utilisateur déconnecté
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
    <AuthContext.Provider value={{ session, user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
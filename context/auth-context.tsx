import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../src/supabaseClient";

// =========================================================================
// 1. DÉFINITION ET INITIALISATION
// =========================================================================

// On définit "le moule" (le typage) de notre boîte globale
interface AuthContextType {
  session: Session | null;
  user: User | null;
}

// On crée le Contexte React (vide par défaut)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =========================================================================
// 2. LE FOURNISSEUR (PROVIDER) - Celui qui englobe l'application
// =========================================================================

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // --- ÉTATS ---
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // --- CYCLE DE VIE (Écouteur Supabase) ---
  useEffect(() => {
    // A. Au premier chargement de l'app, on récupère la session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // B. On s'abonne aux événements (si l'utilisateur se connecte ou se déconnecte)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Nettoyage de l'écouteur quand on quitte l'application
    return () => subscription.unsubscribe();
  }, []);

  // --- RENDU ---
  // On "enveloppe" les enfants (toutes tes pages) en leur passant les données
  return (
    <AuthContext.Provider value={{ session, user }}>
      {children}
    </AuthContext.Provider>
  );
};

// =========================================================================
// 3. LE HOOK PERSONNALISÉ (USE AUTH) - L'outil pour utiliser les données
// =========================================================================

// C'est cette fonction que tu importes dans tes pages (ex: Navbar, Profil)
// const { user } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);

  // Sécurité : on vérifie que le développeur n'essaie pas d'utiliser ce hook
  // en dehors des balises <AuthProvider> dans main.tsx
  if (context === undefined) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un AuthProvider",
    );
  }

  return context;
};

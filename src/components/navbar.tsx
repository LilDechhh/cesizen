import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/supabaseClient";
import { Menu, X, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/auth-context"; // <-- On importe le hook

export function Navbar() {
  const { session, user } = useAuth(); // <-- Plus besoin du useState "session"
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // On vérifie le rôle uniquement si l'utilisateur est connecté
    if (user?.email) {
      checkAdminStatus(user.email);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const checkAdminStatus = async (email: string) => {
    const { data } = await supabase
      .from("utilisateur")
      .select("role_id")
      .eq("email", email)
      .single();

    setIsAdmin(data?.role_id === 2);
  };

  return (
    <nav className="border-b bg-white relative z-50">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/" className="text-xl font-bold text-slate-900">
          CesiZen
        </Link>

        {/* Liens de navigation Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/exercice"
            className="text-sm font-medium hover:text-slate-600"
          >
            Exercice
          </Link>
          <Link
            to="/infos"
            className="text-sm font-medium hover:text-slate-600"
          >
            Informations
          </Link>

          {/* AJOUT : BOUTON ADMIN DESKTOP */}
          {isAdmin && (
            <Link to="/admin">
              <Button
                variant="secondary"
                className="gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200"
              >
                <ShieldAlert className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          )}

          {session ? (
            <Link to="/profil">
              <Button variant="outline">Mon Profil</Button>
            </Link>
          ) : (
            <Link to="/connexion">
              <Button variant="outline">Se connecter</Button>
            </Link>
          )}
        </div>

        {/* Bouton Menu Mobile */}
        <button
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg flex flex-col p-4 gap-4">
          <Link
            to="/exercice"
            className="text-sm font-medium hover:text-slate-600 p-2 hover:bg-slate-50 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Exercice
          </Link>
          <Link
            to="/infos"
            className="text-sm font-medium hover:text-slate-600 p-2 hover:bg-slate-50 rounded-md"
            onClick={() => setIsMenuOpen(false)}
          >
            Informations
          </Link>

          {/* BOUTON ADMIN MOBILE */}
          {isAdmin && (
            <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
              <Button
                variant="secondary"
                className="w-full gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 justify-start"
              >
                <ShieldAlert className="w-4 h-4" />
                Admninistration
              </Button>
            </Link>
          )}

          {session ? (
            <Link to="/profil" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start">
                Mon Profil
              </Button>
            </Link>
          ) : (
            <Link to="/connexion" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-start">
                Se connecter
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

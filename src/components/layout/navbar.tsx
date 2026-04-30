import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Menu, X, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function Navbar() {
  const { session, profile } = useAuth(); // Récupération du profil
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Si c'est un admin on affiche le bouton admin
  const isAdmin = profile?.role_id === 2;
  return (
    <nav className="border-b bg-white relative z-50">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-8">
        <Link to="/" className="text-xl font-bold text-slate-900">
          CesiZen
        </Link>
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
          {/* Bouton admin */}
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
          aria-expanded={isMenuOpen}
          aria-label="Ouvrir le menu"
        >
          <motion.div
            animate={{ rotate: isMenuOpen ? 90 : 0, scale: isMenuOpen ? 1.05 : 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </motion.div>
        </button>
      </div>

      {/* Menu Mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-16 left-0 w-full bg-white border-b shadow-lg"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <motion.div
              className="flex flex-col p-4 gap-4"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
                visible: { transition: { staggerChildren: 0.06, delayChildren: 0.02 } },
              }}
            >
              <motion.div variants={{ hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } }}>
                <Link
                  to="/exercice"
                  className="text-sm font-medium hover:text-slate-600 p-2 hover:bg-slate-50 rounded-md block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Exercice
                </Link>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } }}>
                <Link
                  to="/infos"
                  className="text-sm font-medium hover:text-slate-600 p-2 hover:bg-slate-50 rounded-md block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Informations
                </Link>
              </motion.div>

              {/* BOUTON ADMIN MOBILE */}
              {isAdmin && (
                <motion.div variants={{ hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } }}>
                  <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="secondary"
                      className="w-full gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 justify-start"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Administration
                    </Button>
                  </Link>
                </motion.div>
              )}

              <motion.div variants={{ hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0 } }}>
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
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

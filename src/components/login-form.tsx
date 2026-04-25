import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Leaf, ArrowLeft } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (isForgotPassword) {
        // MPD oublié
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/profil`,
        });
        if (error) throw error;
        setSuccessMsg(
          "Un email de réinitialisation a été envoyé si ce compte existe.",
        );
        setIsForgotPassword(false); // On repasse sur l'écran de connexion
      } else if (isLogin) {
        //Connexion
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate("/profil");
      } else {
        //Insciption
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        navigate("/profil");
        setSuccessMsg("Compte créé avec succès ! Bienvenue.");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGithub = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/profil` },
    });
    if (error) setError(error.message);
  };

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/profil` },
    });
    if (error) setError(error.message);
  };

  return (
    <div
      className={cn("flex flex-col gap-6 drop-shadow-2xl", className)}
      {...props}
    >
      <Card className="overflow-hidden border-0 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-xl">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[650px]">
          {/* CÔTÉ GAUCHE : FORMULAIRE */}
          <div className="p-8 md:p-14 flex flex-col justify-center gap-8 bg-white z-10 relative">
            {/* Bouton retour si on est sur la vue "Mot de passe oublié" */}
            {isForgotPassword && (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setError("");
                  setSuccessMsg("");
                }}
                className="absolute top-8 left-8 text-slate-400 hover:text-emerald-600 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
            )}

            <div className="flex flex-col items-center gap-3 text-center mt-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                <Leaf className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {isForgotPassword
                  ? "Mot de passe oublié ?"
                  : isLogin
                    ? "Ravi de vous revoir"
                    : "Rejoignez CesiZen"}
              </h1>
              <p className="text-slate-500 text-balance text-sm md:text-base">
                {isForgotPassword
                  ? "Entrez votre adresse email pour recevoir un lien de réinitialisation."
                  : isLogin
                    ? "Prenez un instant pour vous reconnecter à votre espace de bien-être."
                    : "Créez votre espace personnel pour accéder à tous nos exercices de respiration."}
              </p>
            </div>

            <form onSubmit={handleAuth} className="flex flex-col gap-5">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">
                  Adresse e-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus-visible:ring-emerald-500 h-11"
                />
              </div>

              {/* On cache le mot de passe si on est en mode "oublié" */}
              {!isForgotPassword && (
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label
                      htmlFor="password"
                      className="text-slate-700 font-medium"
                    >
                                         </Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="ml-auto text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                      >
                       Mot de passe oublié ?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus-visible:ring-emerald-500 h-11"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm font-medium text-red-500 text-center">
                  {error}
                </p>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 text-center">
                  {successMsg}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white mt-4 text-base shadow-lg shadow-emerald-200"
                disabled={loading}
              >
                {loading
                  ? "Chargement..."
                  : isForgotPassword
                    ? "Envoyer le lien"
                    : isLogin
                      ? "Se connecter"
                      : "S'inscrire"}
              </Button>
            </form>

            {!isForgotPassword && (
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-400 font-medium">
                      Ou continuer avec
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={loginWithGithub}
                    variant="outline"
                    className="w-full gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 h-11"
                  >
                    <Github className="w-4 h-4" /> GitHub
                  </Button>
                  <Button
                    type="button"
                    onClick={loginWithDiscord}
                    variant="outline"
                    className="w-full gap-2 bg-[#5865F2] text-white hover:bg-[#4752C4] border-transparent h-11 shadow-md shadow-indigo-100"
                  >
                    <svg
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 127.14 96.36"
                    >
                      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                    </svg>{" "}
                    Discord
                  </Button>
                </div>

                <div className="text-center text-sm text-slate-500 mt-2">
                  {isLogin ? "Nouveau ici ? " : "Déjà membre ? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                      setSuccessMsg("");
                    }}
                    className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline"
                  >
                    {isLogin ? "Créer un compte" : "Se connecter"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* CÔTÉ DROIT : IMAGE ZEN AVEC TEXTE */}
          <div className="relative hidden h-full w-full bg-slate-100 md:block">
            <img
              src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000&auto=format&fit=crop"
              alt="Pierres zen et équilibre"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <h2 className="text-3xl font-medium leading-tight mb-4">
                "Texte à mettre"
              </h2>
              <p className="text-emerald-100/80">
               Texte à mettre.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

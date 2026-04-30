import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github, Leaf, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Schema de validation des données
const authSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise.")
    .email("Veuillez entrer une adresse e-mail valide."),
  password: z
    .string()
    .min(1, "Le mot de passe est requis."),
});
type AuthFormValues = z.infer<typeof authSchema>;

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const [authError, setAuthError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: "", password: "" },
  });

  // Fonction de soumission 
  const onSubmit = async (data: AuthFormValues) => {
    setAuthError("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        // --- CONNEXION ---
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        navigate("/profil");

      } else {
        // --- INSCRIPTION ---
        if (!data.password || data.password.length < 6) {
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
        }
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password
        });
        if (error) throw error;
        setSuccessMsg("Compte créé avec succès ! Bienvenue.");
        navigate("/profil");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Traduction des erreurs
        let frenchErrorMessage = "Une erreur inattendue est survenue.";

        const msg = err.message;
        if (msg.includes("Invalid login credentials")) {
          frenchErrorMessage = "Adresse e-mail ou mot de passe incorrect.";
        } else if (msg.includes("User already registered")) {
          frenchErrorMessage = "Un compte existe déjà avec cette adresse e-mail.";
        } else if (msg.includes("Password should be at least 6 characters")) {
          frenchErrorMessage = "Le mot de passe est trop faible (6 caractères minimum).";
        } else if (msg.includes("Email not confirmed")) {
          frenchErrorMessage = "Veuillez confirmer votre adresse e-mail avant de vous connecter.";
        } else {
          // Affiche quand même l'erreur
          frenchErrorMessage = msg;
        }

        setAuthError(frenchErrorMessage);
      }
    }
  };

  const loginWithOAuth = async (provider: 'github' | 'discord') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/profil` },
    });
    if (error) setAuthError(error.message);
  };

  return (
    <div className={cn("flex flex-col gap-6 drop-shadow-2xl", className)} {...props}>
      <Card className="overflow-hidden border-0 rounded-3xl shadow-2xl bg-white/90 backdrop-blur-xl">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[650px]">
          {/* CÔTÉ GAUCHE : FORMULAIRE */}
          <div className="p-8 md:p-14 flex flex-col justify-center gap-8 bg-white z-10 relative">
            <div className="flex flex-col items-center gap-3 text-center mt-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2 shadow-inner">
                <Leaf className="w-7 h-7 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                {isLogin ? "Ravi de vous revoir" : "Rejoignez CesiZen"}
              </h1>
              <p className="text-slate-500 text-balance text-sm md:text-base">
                {isLogin
                  ? "Prenez un instant pour vous reconnecter à votre espace de bien-être."
                  : "Créez votre espace personnel pour accéder à tous nos exercices de respiration."}
              </p>
            </div>

            {/* On passe handleSubmit à la balise form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Adresse e-mail</Label>
                {/* On connecte l'input avec {...register("nomDuChamp")} */}
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  className={cn("focus-visible:ring-emerald-500 h-11", errors.email && "border-red-500")}
                  {...register("email")}
                />
                {/* Affichage automatique des erreurs Zod */}
                {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Mot de passe</Label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="ml-auto text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  className={cn("focus-visible:ring-emerald-500 h-11")}
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>}
              </div>


              {authError && <p className="text-sm font-medium text-red-500 text-center bg-red-50 p-2 rounded-md">{authError}</p>}
              {successMsg && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm font-medium text-emerald-700 text-center">{successMsg}</div>}

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white mt-4 text-base shadow-lg shadow-emerald-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Se connecter" : "S'inscrire"}
              </Button>
            </form>

            {/* Discord ou github  */}
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-400 font-medium">Ou continuer avec</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button type="button" onClick={() => loginWithOAuth('github')} variant="outline" className="w-full gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 h-11">
                  <Github className="w-4 h-4" /> GitHub
                </Button>
                <Button type="button" onClick={() => loginWithOAuth('discord')} variant="outline" className="w-full gap-2 bg-[#5865F2] text-white hover:bg-[#4752C4] border-transparent h-11 shadow-md shadow-indigo-100">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36">
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
                    setAuthError("");
                    setSuccessMsg("");
                    reset(); // on vide les champs
                  }}
                  className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline"
                >
                  {isLogin ? "Créer un compte" : "Se connecter"}
                </button>
              </div>
            </>
          </div>

          {/* CÔTÉ DROIT : IMAGE  AVEC TEXTE */}
          <div className="relative hidden h-full w-full bg-slate-100 md:block">
            <img src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000&auto=format&fit=crop" alt="Pierres zen et équilibre" className="absolute inset-0 h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-emerald-900/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
              <h2 className="text-3xl font-medium leading-tight mb-4">"Respirez, vous êtes au bon endroit"</h2>
              <p className="text-emerald-100/80">Connectez-vous pour reprendre votre routine de cohérence cardiaque.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
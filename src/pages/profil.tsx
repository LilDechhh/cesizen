import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Save, Loader2, LogOut, Lock } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function Profile() {
  const navigate = useNavigate();

  // États de l'interface (Chargement, succès, erreurs)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // États des données utilisateur (Base de données)
  const [nom, setNom] = useState("");
  const [username, setUsername] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [roleId, setRoleId] = useState(1);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // États pour la gestion du mot de passe (Auth)
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOAuth, setIsOAuth] = useState(false);



  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true);
        // Récupération de l'utilisateur connecté via l'authentification
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate("/connexion");
          return;
        }

        setEmail(user.email || "");
        setIsOAuth(user.app_metadata.provider !== "email");

        const url =
          user.user_metadata?.avatar_url || user.user_metadata?.picture;
        setAvatarUrl(url);

        // Récupération des informations complémentaires en base de données
        const { data: userData, error: dbError } = await supabase
          .from("utilisateur")
          .select("nom, prenom, username, role_id")
          .eq("email", user.email)
          .single();

        if (dbError) throw dbError;

        if (userData) {
          setNom(userData.nom || "");
          setPrenom(userData.prenom || "");
          setUsername(userData.username || "");
          setRoleId(userData.role_id || 1);
        }

        // Si l'utilisateur est admin
        if (userData.role_id === 2) {
          const { data: users } = await supabase
            .from("utilisateur")
            .select("*");
          if (users) setAllUsers(users);
        }
      } catch (err: any) {
        console.error("Erreur de chargement du profil:", err);
        setError("Impossible de charger vos informations.");
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [navigate]);



  // Sauvegarder les modifications du profil
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Gestion du changement de mot de passe (Si non OAuth)
      if (!isOAuth && newPassword) {
        if (newPassword.length < 6)
          throw new Error(
            "Le mot de passe doit contenir au moins 6 caractères.",
          );
        if (newPassword !== confirmPassword)
          throw new Error("Les mots de passe ne correspondent pas.");

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;

        setNewPassword("");
        setConfirmPassword("");
      }

      // Mise à jour des informations publiques dans la table utilisateur
      const { error: updateError } = await supabase
        .from("utilisateur")
        .update({ nom: nom, prenom: prenom, username: username })
        .eq("email", email);

      if (updateError) throw updateError;
      setSuccess("Profil mis à jour avec succès !");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  // Déconnexion de l'utilisateur
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/connexion");
  };



  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Chargement de votre profil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Card className="border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
        {/* En-tête avec dégradé */}
        <div className="h-32 bg-gradient-to-r from-emerald-400 to-cyan-500 relative"></div>

        <CardHeader className="relative pt-0 pb-6 px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-4">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white">
              <AvatarImage
                src={avatarUrl || ""}
                alt="Profil"
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-100">
                <User className="w-12 h-12 text-slate-300" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-2">
              <CardTitle className="text-3xl font-bold text-slate-800">
                {prenom} {nom}
              </CardTitle>
              <CardDescription className="text-lg text-slate-500 font-medium">
                @{username || "utilisateur"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-600">
                  Adresse Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-500"
                />
                <p className="text-[0.8rem] text-slate-400">
                  L'adresse email ne peut pas être modifiée.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-slate-700">
                    Prénom
                  </Label>
                  <Input
                    id="prenom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-slate-700">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700">
                  Nom d'utilisateur
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    @
                  </span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-8 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="pseudo"
                  />
                </div>
              </div>

              {/* Section changement de mot de passe (visible uniquement si non OAuth) */}
              {!isOAuth && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-medium text-slate-900">
                      Changer le mot de passe
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmer le mot de passe
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100 flex items-center gap-2">
                {success}
              </div>
            )}

            <div className="flex justify-end pt-4 gap-4">
              <Button
                type="button"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/adminService";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/auth-context";
import type { Seance } from "@/types";

type UserSession = Seance & {
  mode_respiratoire?: {
    libelle: string;
  } | null;
};

type UserStats = {
  total: number;
  sessions: UserSession[];
};

export function Profile() {
  const navigate = useNavigate();
  // récupération des données utilisateurs
  const { session, user, profile, isLoading } = useAuth();

  const [stats, setStats] = useState<UserStats>({ total: 0, sessions: [] });
  const [loadingStats, setLoadingStats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // États des données du formulaire
  const [nom, setNom] = useState("");
  const [username, setUsername] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");

  // États pour le changement de mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // récupération des données utilisateurs
  const isOAuth = user?.app_metadata?.provider !== "email";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // récupération des données utilisateurs
  useEffect(() => {
    if (profile) {
      setNom(profile.nom || "");
      setPrenom(profile.prenom || "");
      setUsername(profile.username || "");
      setEmail(profile.email || "");
    } else if (!isLoading && !session) {
      navigate("/connexion");
    }
  }, [profile, session, isLoading, navigate]);

  useEffect(() => {
    // Vérification de l'id utilisateur
    if (profile?.id) {
      const loadStats = async () => {
        try {
          const data = await adminService.getUserStats(profile.id); // On lui donne l'id
          setStats(data);
        } catch (err: unknown) {
          console.error("Erreur stats:", err);
        } finally {
          setLoadingStats(false);
        }
      };

      loadStats();
    }
  }, [profile]);

  const formatDuration = (durationSeconds: number) => {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return `${minutes} min ${seconds.toString().padStart(2, "0")} s`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Changement de mot de passe que pour les utilisateurs classiques
      if (!isOAuth && newPassword) {
        if (newPassword.length < 6)
          throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
        if (newPassword !== confirmPassword)
          throw new Error("Les mots de passe ne correspondent pas.");

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (passwordError) throw passwordError;

        setNewPassword("");
        setConfirmPassword("");
      }

      // Mise à jour des infos dans la table "utilisateur"
      const { error: updateError } = await supabase
        .from("utilisateur")
        .update({ nom, prenom, username })
        .eq("email", email);

      if (updateError) throw updateError;
      setSuccess("Profil mis à jour avec succès !");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la sauvegarde.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/connexion");
  };

  // Affichage du loader global du Context pendant la récupération des données
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-muted-foreground">Chargement de votre profil...</p>
      </div>
    );
  }


  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Card className="border-0 shadow-xl overflow-hidden bg-white/80 backdrop-blur-sm">
        <div className="h-32 bg-gradient-to-r from-emerald-400 to-cyan-500 relative"></div>

        <CardHeader className="relative pt-0 pb-6 px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-12 mb-4">
            <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white">
              <AvatarImage src={avatarUrl || ""} alt="Profil" className="object-cover" />
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
        {/* Section Statistiques Bien-être */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 px-8">
          <Card className="bg-emerald-50 border-emerald-100 shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-xl text-white">
                  <Loader2 className={loadingStats ? "animate-spin" : ""} />
                </div>
                <div>
                  <p className="text-sm text-emerald-800 font-medium">Séances terminées</p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {loadingStats ? "..." : stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-100 shadow-none">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-xl text-white">
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Dernière activité</p>
                  <p className="text-lg font-bold text-blue-900">
                    {stats.sessions[0]
                      ? new Date(stats.sessions[0].date_debut).toLocaleDateString("fr-FR")
                      : "Aucune séance"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <CardContent className="px-8 pb-8 pt-0">
          <Card className="border-slate-200 shadow-none mb-8">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800">Historique détaillé</CardTitle>
              <CardDescription>
                Vos 10 dernières séances avec le mode respiratoire et la durée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode respiratoire</TableHead>
                    <TableHead className="text-right">Durée</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStats ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        Chargement de l'historique...
                      </TableCell>
                    </TableRow>
                  ) : stats.sessions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        Aucune séance enregistrée.
                      </TableCell>
                    </TableRow>
                  ) : (
                    stats.sessions.slice(0, 10).map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {new Date(session.date_debut).toLocaleDateString("fr-FR")}
                        </TableCell>
                        <TableCell>
                          {session.mode_respiratoire?.libelle || "Mode inconnu"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDuration(session.duree_totale)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-600">Adresse Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-slate-50 border-slate-200 text-slate-50"
                />
                <p className="text-[0.8rem] text-slate-400">L'adresse email ne peut pas être modifiée.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="text-slate-700">Prénom</Label>
                  <Input
                    id="prenom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Votre prénom"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom" className="text-slate-700">Nom</Label>
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
                <Label htmlFor="username" className="text-slate-700">Nom d'utilisateur</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">@</span>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-8 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="pseudo"
                  />
                </div>
              </div>

              {!isOAuth && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-medium text-slate-900">Changer le mot de passe</h3>
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
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
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

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">{error}</div>}
            {success && <div className="p-4 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">{success}</div>}

            <div className="flex justify-end pt-4 gap-4">
              <Button type="button" onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
                <LogOut className="w-4 h-4 mr-2" /> Déconnexion
              </Button>
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[200px]">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ResetPassword() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (newPassword.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Mot de passe mis à jour avec succès.");
      setTimeout(() => {
        navigate("/connexion");
      }, 1200);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erreur lors de la réinitialisation du mot de passe.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Réinitialiser le mot de passe</CardTitle>
          <CardDescription>
            Saisissez un nouveau mot de passe sécurisé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
            </div>

            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : null}

            {success ? (
              <p className="text-sm text-emerald-700">{success}</p>
            ) : null}

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mettre à jour"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess("Un email de récupération a été envoyé.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Erreur lors de l'envoi de l'email de récupération.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Mot de passe oublié</CardTitle>
          <CardDescription>
            Entrez votre email pour recevoir un lien de réinitialisation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="vous@exemple.com"
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Envoyer le lien"}
            </Button>

            <p className="text-sm text-center text-slate-600">
              <Link to="/connexion" className="underline hover:text-slate-900">
                Retour à la connexion
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

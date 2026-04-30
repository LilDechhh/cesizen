import { useState, useEffect } from "react";
import { supabase } from "@/config/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { UserX, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UserProfile } from "@/types";

// Gère les comptes utilisateurs
export function UsersManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Charge tous les utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("utilisateur")
        .select("*")
        .order("id");

      if (error) throw error;
      setUsers(data || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors du chargement des utilisateurs.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Bascule le statut de l'utilisateur
  const toggleStatus = async (user: UserProfile) => {
    const { error } = await supabase
      .from("utilisateur")
      .update({ est_actif: !user.est_actif })
      .eq("id", user.id);

    if (!error) {
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, est_actif: !user.est_actif } : u
        )
      );
    }
  };

  if (loading) return <Loader2 className="animate-spin mx-auto" />;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-red-600">{error}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 text-slate-500 text-sm uppercase">
                <TableHead className="p-4">Utilisateur</TableHead>
                <TableHead className="p-4">Statut</TableHead>
                <TableHead className="p-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-slate-50/50">
                  <TableCell className="p-4 font-medium">
                    {user.username || user.email}
                  </TableCell>
                  <TableCell className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${user.est_actif
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {user.est_actif ? "Actif" : "Inactif"}
                    </span>
                  </TableCell>
                  <TableCell className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(user)}
                    >
                      {user.est_actif ? (
                        <UserX className="w-4 h-4 text-orange-500" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="md:hidden space-y-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4 space-y-3">
              <div>
                <p className="text-sm text-slate-500">Utilisateur</p>
                <p className="font-medium">{user.username || user.email}</p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Statut</p>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs ${user.est_actif
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                    }`}
                >
                  {user.est_actif ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => toggleStatus(user)}
                >
                  {user.est_actif ? (
                    <>
                      <UserX className="w-4 h-4 text-orange-500 mr-2" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600 mr-2" />
                      Réactiver
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
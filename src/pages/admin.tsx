import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldCheck,
  Trash2,
  UserX,
  UserCheck,
  Loader2,
  ArrowLeft,
  Users,
  Search,
  FileText,
  Edit,
  Plus,
  X,
  Save,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"users" | "content">("users");

  
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [ressourceToDelete, setRessourceToDelete] = useState<number | null>(
    null,
  );
 
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
 
  const [ressources, setRessources] = useState<any[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    tag: "",
    content: "",
  });

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  async function checkAdminAndFetchData() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/connexion");
        return;
      }

      const { data: currentUser } = await supabase
        .from("utilisateur")
        .select("role_id")
        .eq("email", user.email)
        .single();

      if (!currentUser || currentUser.role_id !== 2) {
        alert("Accès refusé : vous n'êtes pas administrateur.");
        navigate("/");
        return;
      }

      // Si admin, on charge tout
      await Promise.all([fetchUsers(), fetchRessources()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from("utilisateur")
      .select("*")
      .order("id");
    if (!error && data) setUsers(data);
  }

  async function fetchRessources() {
    const { data, error } = await supabase
      .from("info_articles")
      .select("*")
      .order("id");
    if (!error && data) setRessources(data);
  }

  // --- ACTIONS UTILISATEURS ---
  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("utilisateur")
      .update({ est_actif: !currentStatus })
      .eq("id", userId);
    if (!error)
      setUsers(
        users.map((u) =>
          u.id === userId ? { ...u, est_actif: !currentStatus } : u,
        ),
      );
  };

  // --- ACTIONS UTILISATEURS ---
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const { error } = await supabase
      .from("utilisateur")
      .delete()
      .eq("id", userToDelete);
    if (!error) {
      setUsers(users.filter((u) => u.id !== userToDelete));
    }
    setUserToDelete(null); // On ferme la modale
  };

  //--- ACTIONS RESSOURCES ---
  const confirmDeleteRessource = async () => {
    if (!ressourceToDelete) return;
    const { error } = await supabase
      .from("info_articles")
      .delete()
      .eq("id", ressourceToDelete);
    if (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Impossible de supprimer cet élément.");
    } else {
      setRessources(ressources.filter((r) => r.id !== ressourceToDelete));
    }
    setRessourceToDelete(null); // On ferme la modale
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({ title: "", tag: "", content: "" });
    setIsFormOpen(true);
  };

  const openEditForm = (resource: any) => {
    setEditingId(resource.id);
    setFormData({
      title: resource.title || "",
      tag: resource.tag || "",
      content: resource.content || "",
    });
    setIsFormOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from("info_articles")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("info_articles")
          .insert([formData]);
        if (error) throw error;
      }
      await fetchRessources();
      setIsFormOpen(false);
    } catch (err: any) {
      console.error("Détail de l'erreur Supabase :", err.message);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.username?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate("/profil")}
            className="mb-2 -ml-4 text-slate-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour au profil
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            Panneau d'administration
          </h1>
          <p className="text-slate-500">
            Gérez les comptes et les contenus de CesiZen
          </p>
        </div>
      </div>

      {/* SYSTÈME D'ONGLETS */}
      <div className="flex space-x-2 mb-6 border-b border-slate-200 pb-2">
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          onClick={() => setActiveTab("users")}
          className={
            activeTab === "users" ? "bg-emerald-600 hover:bg-emerald-700" : ""
          }
        >
          <Users className="w-4 h-4 mr-2" />
          Utilisateurs
        </Button>
        <Button
          variant={activeTab === "content" ? "default" : "ghost"}
          onClick={() => setActiveTab("content")}
          className={
            activeTab === "content" ? "bg-emerald-600 hover:bg-emerald-700" : ""
          }
        >
          <FileText className="w-4 h-4 mr-2" />
          Contenus & Menus
        </Button>
      </div>

      {/* ONGLET 1 : GESTION DES UTILISATEURS */}
      {activeTab === "users" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <Card className="bg-emerald-50 border-emerald-100 w-64">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Users className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-emerald-800 font-medium">
                      Total Membres
                    </p>
                    <p className="text-2xl font-bold text-emerald-900">
                      {users.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher un membre..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className="shadow-xl border-0 overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle>Liste des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Membre</th>
                    <th className="px-6 py-4 font-semibold">Rôle</th>
                    <th className="px-6 py-4 font-semibold">Statut</th>
                    <th className="px-6 py-4 font-semibold text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">
                          {u.username || "Sans pseudo"}
                        </div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${u.role_id === 2 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {u.role_id === 2 ? "ADMIN" : "USER"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.est_actif ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>{" "}
                            Actif
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-500 text-sm font-medium">
                            <span className="w-2 h-2 bg-red-400 rounded-full"></span>{" "}
                            Désactivé
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleUserStatus(u.id, u.est_actif)}
                        >
                          {u.est_actif ? (
                            <UserX className="w-4 h-4 text-orange-500" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setUserToDelete(u.id)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ONGLET 2 : GESTION DES CONTENUS ET MENUS */}
      {activeTab === "content" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {!isFormOpen ? (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Pages d'informations & Menus
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Ajoutez ou modifiez les textes du site.
                  </p>
                </div>
                <Button
                  onClick={openAddForm}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <Plus className="w-4 h-4" /> Ajouter une ressource
                </Button>
              </div>

              <Card className="shadow-xl border-0 overflow-hidden">
                <CardContent className="p-0">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Titre</th>
                        <th className="px-6 py-4 font-semibold">Tag</th>
                        <th className="px-6 py-4 font-semibold text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ressources.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {res.title}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            {res.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {res.tag || "Page"}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditForm(res)}
                              className="hover:bg-blue-50 text-blue-600"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRessourceToDelete(res.id)}
                              className="hover:bg-red-50 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ressources.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      Aucun contenu trouvé. Créez votre première ressource !
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle>
                  {editingId
                    ? "Modifier la ressource"
                    : "Ajouter une ressource"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveResource} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Titre</label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tag (Catégorie)
                    </label>
                    <Input
                      value={formData.tag}
                      onChange={(e) =>
                        setFormData({ ...formData, tag: e.target.value })
                      }
                      placeholder="Ex: Stress, Sommeil, Conseils..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contenu</label>
                    <textarea
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsFormOpen(false)}
                    >
                      <X className="w-4 h-4 mr-2" /> Annuler
                    </Button>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Save className="w-4 h-4 mr-2" /> Enregistrer
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      {/* MODALE DE SUPPRESSION UTILISATEUR */}
      <AlertDialog
        open={userToDelete !== null}
        onOpenChange={() => setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement le
              compte de cet utilisateur et effacera ses données de nos serveurs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MODALE DE SUPPRESSION RESSOURCE */}
      <AlertDialog
        open={ressourceToDelete !== null}
        onOpenChange={() => setRessourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce contenu ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action retirera définitivement cette ressource du site. Les
              utilisateurs n'y auront plus accès.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteRessource}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { adminService } from "@/services/adminService";
import type { InfoArticle } from "@/types";

// Gère les articles d'info
export function ContentManager() {
  const [articles, setArticles] = useState<InfoArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await adminService.getArticles();
      setArticles(data || []);
    } catch (err: unknown) {
      console.error("Erreur chargement articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    try {
      await adminService.deleteArticle(id);
      setArticles(articles.filter((a) => a.id !== id));
    } catch (err: unknown) {
      alert("Erreur lors de la suppression");
    }
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError("");

    if (!title.trim() || !content.trim()) {
      setCreateError("Le titre et le contenu sont obligatoires.");
      return;
    }

    setIsCreating(true);

    try {
      const newArticle = await adminService.createArticle({
        title: title.trim(),
        content: content.trim(),
        tag: tag.trim() || null,
      });

      setArticles((prev) => [newArticle, ...prev]);
      setTitle("");
      setContent("");
      setTag("");
      setShowCreateForm(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCreateError(err.message);
      } else {
        setCreateError("Erreur lors de la création de l'article.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) return <Loader2 className="animate-spin mx-auto" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Gestion des articles</h2>
        <Button className="bg-emerald-600" onClick={() => setShowCreateForm((prev) => !prev)}>
          <Plus className="w-4 h-4 mr-2" /> Nouvel article
        </Button>
      </div>

      {showCreateForm ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="article-title">Titre</Label>
                <Input
                  id="article-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Titre de l'article"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="article-content">Contenu</Label>
                <textarea
                  id="article-content"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Contenu de l'article"
                  className="w-full min-h-32 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="article-tag">Tag (optionnel)</Label>
                <Input
                  id="article-tag"
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                  placeholder="Ex: stress"
                />
              </div>

              {createError ? <p className="text-sm text-red-600">{createError}</p> : null}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateError("");
                  }}
                  disabled={isCreating}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-emerald-600 hover:bg-emerald-700">
                  {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {isCreating ? "Création..." : "Créer l'article"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {articles.map((art) => (
              <li key={art.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{art.title}</h3>
                  <p className="text-sm text-slate-500">{art.tag || "Pas de tag"}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(art.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
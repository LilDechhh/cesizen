import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeInfo } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Définition des types TypeScript
interface Article {
  id: string;
  title: string;
  content: string;
  tag: string;
}

interface Resource {
  id: string;
  title: string;
  items: string[];
}

export default function Informations() {
  // =========================================================================
  // 1. ÉTATS (STATES)
  // =========================================================================

  const [articles, setArticles] = useState<Article[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================================================================
  // 2. CYCLE DE VIE (USE EFFECT)
  // =========================================================================

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Récupération des articles d'information (Gérés via l'interface Admin)
        const { data: articlesData, error: articlesError } = await supabase
          .from("info_articles")
          .select("*")
          .order("created_at", { ascending: true });

        if (articlesError) throw articlesError;

        // Récupération des ressources complémentaires (Listes à puces)
        const { data: resourcesData, error: resourcesError } = await supabase
          .from("info_resources")
          .select("*");

        if (resourcesError) throw resourcesError;

        // Mise à jour des états
        if (articlesData) setArticles(articlesData);
        if (resourcesData) setResources(resourcesData);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // =========================================================================
  // 3. RENDU (JSX)
  // =========================================================================

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-500">
        Chargement des informations...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl mb-4 text-emerald-800 dark:text-emerald-400">
          Informations sur la Santé Mentale
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Découvrez des ressources et informations pour mieux comprendre et
          prendre soin de votre santé mentale.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {articles.map((article) => {
          const IconComponent = BadgeInfo;

          return (
            <Card
              key={article.id}
              className="border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-lg transition-all dark:bg-slate-900 dark:border-emerald-900"
            >
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-amber-400 rounded-full flex items-center justify-center mb-3">
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-100 dark:hover:bg-emerald-800"
                >
                  {article.tag}
                </Badge>
                <CardTitle className="text-xl text-emerald-700 dark:text-emerald-400">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  {article.content}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dynamique */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {resources.map((resource) => (
          <Card
            key={resource.id}
            className="bg-gradient-to-br from-emerald-50 to-amber-50 border-2 border-emerald-200 dark:from-slate-900 dark:to-slate-900 dark:border-emerald-900"
          >
            <CardHeader>
              <CardTitle className="text-2xl text-emerald-800 dark:text-emerald-400">
                {resource.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {resource.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="flex items-start text-gray-700 dark:text-gray-300"
                  >
                    <span className="text-emerald-500 mr-2 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Statique */}
      <Card className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-200 dark:from-slate-900 dark:to-slate-900 dark:border-amber-900">
        <CardContent className="p-8">
          <h2 className="text-2xl mb-4 text-amber-800 dark:text-amber-500">
            ⚠️ Information Importante
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Les informations et exercices proposés sur CESI ZEN sont à visée
            préventive et éducative. Ils ne remplacent en aucun cas un
            diagnostic médical ou un suivi psychologique professionnel.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Si vous rencontrez des difficultés psychologiques importantes, nous
            vous encourageons vivement à consulter un professionnel de santé
            qualifié (médecin, psychologue, psychiatre).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { supabase } from "@/config/supabaseClient";
import type { Seance } from "@/types";

type UserSession = Seance & {
  mode_respiratoire?: {
    libelle: string;
  } | null;
};

type UserStats = {
  sessions: UserSession[];
  total: number;
};

// Service centralisant les appels aux tables de données (Articles et Séances)
export const adminService = {

  // Récupération des articles d'information
  async getArticles() {
    const { data, error } = await supabase
      .from("info_articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Création d'un article
  async createArticle(article: {
    title: string;
    content: string;
    tag?: string | null;
  }) {
    const { data, error } = await supabase
      .from("info_articles")
      .insert([
        {
          title: article.title,
          content: article.content,
          tag: article.tag ?? null,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  // Récupération des statistiques et de l'historique d'un utilisateur
  async getUserStats(userId: number): Promise<UserStats> {
    const { data, count, error } = await supabase
  .from("seance")
  .select(
    `
      *,
      mode_respiratoire (
        libelle
      )
    `,
    { count: "exact" }
  )
  .eq("utilisateur_id", userId)
  .order("date_debut", { ascending: false })
  .limit(10);

    if (error) throw error;
    return {
      sessions: data || [],
      total: count || 0
    };
  },

  // Suppression d'un article
  async deleteArticle(id: string) {
    const { error } = await supabase
      .from("info_articles")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }
};
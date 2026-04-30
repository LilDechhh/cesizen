// src/types/index.ts

export interface UserProfile {
  id: number; // Integer dans ton SQL
  nom: string | null;
  prenom: string | null;
  email: string;
  username: string | null;
  role_id: number | null;
  est_actif: boolean;
}

export interface InfoArticle {
  id: string;
  created_at?: string;
  title: string;
  content: string;
  tag: string | null;
}

export interface ModeRespiratoire {
  id: number;
  libelle: string;
  description: string | null;
  temps_inspiration: number;
  temps_apnee: number | null;
  temps_expiration: number;
}

export interface Seance {
  id: number;
  date_debut: string;
  duree_totale: number;
  utilisateur_id: number;
  mode_respiratoire_id: number;
  mode_respiratoire?: {
    libelle: string;
  };
}
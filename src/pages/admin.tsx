import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Users, FileText, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { UsersManager } from "@/features/admin/UsersManager";
import { ContentManager } from "@/features/admin/ContentManager";

// Page d'administration
export function AdminPage() {
  const navigate = useNavigate();
  const { profile, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "content">("users");

  // Redirection si pas admin
  useEffect(() => {
    if (!isAuthLoading && (!profile || profile.role_id !== 2)) {
      navigate("/");
    }
  }, [profile, isAuthLoading, navigate]);

  if (isAuthLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <header>
        <Button variant="ghost" onClick={() => navigate("/profil")} className="mb-4 text-slate-500">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour au profil
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldCheck className="text-emerald-600" /> Panneau d'administration
        </h1>
      </header>

      {/* Onglets de navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "users" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Utilisateurs</div>
        </button>
        <button
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === "content" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
        >
          <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Contenus</div>
        </button>
      </div>

      {/* Rendu dynamique du module sélectionné */}
      <main className="mt-6">
        {activeTab === "users" ? <UsersManager /> : <ContentManager />}
      </main>
    </div>
  );
}
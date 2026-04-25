import { Link } from "react-router-dom"; // Correction de l'import (react-router-dom)
import { Brain, BookOpen, Wind, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";

export function Home() {
  const [session, setSession] = useState<any>(null);

  // On vérifie si l'utilisateur est connecté pour adapter les boutons
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  const features = [
    {
      icon: Brain,
      title: "Santé Mentale",
      description: "Ressources et conseils pour prendre soin de votre esprit",
    },
    {
      icon: Wind,
      title: "Respiration",
      description: "Exercices guidés de cohérence cardiaque",
    },
    {
      icon: BookOpen,
      title: "Apprentissage",
      description: "Articles et guides pour mieux vous comprendre",
    },
    {
      icon: Heart,
      title: "Bienveillance",
      description: "Un espace sûr, gratuit et accessible à tous",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-emerald-600 text-white">
        {" "}
        {/* Utilisation de couleurs emerald pour matcher ton thème */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              Bienvenue sur CesiZen
            </h1>

            <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 text-white/90">
              Votre compagnon pour une meilleure santé mentale. Découvrez des
              exercices de respiration, des ressources pédagogiques et des
              outils pour gérer votre stress au quotidien.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to="/exercice" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-white text-emerald-700 hover:bg-white/90"
                >
                  Commencer un exercice
                </Button>
              </Link>
              <Link to="/infos" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full bg-white text-emerald-700 hover:bg-white/90"
                >
                  Explorer les ressources
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-emerald-900">
            Comment CesiZen peut vous aider
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Des outils simples et efficaces pour votre bien-être mental
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 border-emerald-50 hover:border-emerald-500 transition-all shadow-sm"
              >
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-emerald-600" />
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 text-emerald-800">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Breathing Exercise Showcase */}
      <section className="bg-slate-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-emerald-900">
                Exercices de respiration
              </h2>

              <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                Découvrez des techniques de respiration basées sur la cohérence
                cardiaque, scientifiquement prouvées pour réduire le stress.
              </p>

              <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-700 font-bold">5-5</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Cohérence Cardiaque</p>
                    <p className="text-sm text-muted-foreground">
                      5s inspiration, 5s expiration. L'équilibre parfait.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-700 font-bold">4-6</span>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Relaxation Profonde</p>
                    <p className="text-sm text-muted-foreground">
                      Idéal pour s'endormir ou calmer une anxiété forte.
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/exercice">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Essayer maintenant
                </Button>
              </Link>
            </div>

            <div className="order-first lg:order-last">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop"
                  alt="Yoga et méditation"
                  className="w-full h-64 md:h-80 lg:h-96 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <Card className="border-2 border-slate-100 hover:border-emerald-500 transition-all overflow-hidden shadow-sm">
            <div className="h-48 overflow-hidden">
              <img
                src="/Bibliotheque.jpg"
                alt="Lecture et savoir"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardContent className="p-6 md:p-8 text-center sm:text-left">
              <h3 className="text-xl md:text-2xl font-bold mb-3 text-emerald-800">
                Ressources Pédagogiques
              </h3>
              <p className="text-muted-foreground mb-6">
                Accédez à des articles et guides pour mieux comprendre votre
                santé mentale. Aucune inscription requise.
              </p>
              <Link to="/infos">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                >
                  Découvrir
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!session && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-8">
          <Card className="bg-emerald-700 text-white border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                Prêt à transformer votre quotidien ?
              </h2>
              <p className="text-base md:text-lg mb-8 text-white/90 max-w-2xl mx-auto">
                Commencez votre voyage vers un meilleur équilibre mental dès
                aujourd'hui. C'est gratuit, simple et efficace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Link to="/connexion" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-white text-emerald-800 hover:bg-white/90 font-bold"
                  >
                    S'inscrire gratuitement
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

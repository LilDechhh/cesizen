import { useState, useEffect } from "react";
import { supabase } from "@/supabaseClient";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wind, Clock, Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModeRespiratoire {
  id: number;
  libelle: string;
  description: string | null;
  temps_inspiration: number;
  temps_apnee: number | null;
  temps_expiration: number;
}
export function Exercises() {
  const [exercises, setExercises] = useState<ModeRespiratoire[]>([]);
  // const [selectedExercise, setSelectedExercise] =
  //   useState<ModeRespiratoire | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] =
    useState<ModeRespiratoire | null>(null);

  const navExercice = (exerciceData: ModeRespiratoire) => {
    navigate("/breathing_exercice", {
      state: { exercise: exerciceData },
    });
  };

  useEffect(() => {
    async function fetchExercises() {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("mode_respiratoire")
          .select("*")
          .order("id");

        if (error) {
          throw error;
        }

        if (data) {
          setExercises(data);
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des exercices :", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExercises();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-emerald-800">Chargement des exercices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">
          Impossible de charger les exercices : {error}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl mb-4 text-emerald-800">
          Exercices de Respiration
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choisissez l'exercice de cohérence cardiaque qui vous convient le
          mieux pour gérer votre stress et améliorer votre bien-être.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {exercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-xl transition-all cursor-pointer flex flex-col"
            onClick={() => setSelectedExercise(exercise)}
          >
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wind className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-center text-2xl text-emerald-700">
                Exercice {exercise.libelle}
              </CardTitle>
              <CardDescription className="text-center">
                {exercise.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="text-gray-700">
                    Inspiration : {exercise.temps_inspiration}s
                  </span>
                </div>

                {/* Vérification que temps_apnee existe et est supérieur à 0 */}
                {exercise.temps_apnee && exercise.temps_apnee > 0 ? (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <span className="text-gray-700">
                      Apnée : {exercise.temps_apnee}s
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  {/* Utilisation de "temps_expiration" */}
                  <span className="text-gray-700">
                    Expiration : {exercise.temps_expiration}s
                  </span>
                </div>
              </div>

              <Button
                onClick={() => navExercice(exercise)}
                className="w-full mt-auto bg-gradient-to-r from-emerald-500 to-amber-400 hover:from-emerald-600 hover:to-amber-500"
              >
                Commencer
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Section inchangée */}
      <Card className="bg-gradient-to-r from-emerald-50 to-amber-50 border-emerald-200">
        <CardContent className="p-8">
          <h2 className="text-2xl mb-4 text-emerald-800">
            Qu'est-ce que la Cohérence Cardiaque ?
          </h2>
          <p className="text-gray-700 mb-4">
            La cohérence cardiaque est une technique de respiration contrôlée
            qui permet de réguler le système nerveux autonome. En synchronisant
            votre respiration, vous pouvez :
          </p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">-</span>
              Réduire le stress et l'anxiété
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">-</span>
              Améliorer la concentration et la clarté mentale
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">-</span>
              Favoriser un meilleur sommeil
            </li>
            <li className="flex items-start">
              <span className="text-emerald-500 mr-2">-</span>
              Renforcer le système immunitaire
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

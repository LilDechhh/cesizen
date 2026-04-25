import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Timer,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/supabaseClient";

type Phase = "inhale" | "hold" | "exhale" | "ready";

export function BreathingExercise() {
  const location = useLocation();
  const navigate = useNavigate();
  const exerciseData = location.state?.exercise;


  // États de l'exercice (temps, cycles, phases)
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // États utilitaires (Sauvegarde, Audio)
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Configuration extraite de la base de données
  const inhale = exerciseData?.temps_inspiration || 5;
  const hold = exerciseData?.temps_apnee || 0;
  const exhale = exerciseData?.temps_expiration || 5;
  const name = exerciseData?.libelle || "Exercice";

  // Variables de rendu (Textes et couleurs dynamiques)
  const phaseLabels = {
    ready: "Prêt à commencer",
    inhale: "Inspirez...",
    hold: "Bloquez...",
    exhale: "Expirez...",
  };

  const phaseColors = {
    ready: "from-slate-400 to-slate-500",
    inhale: "from-emerald-400 to-teal-600",
    hold: "from-amber-400 to-orange-500",
    exhale: "from-sky-400 to-indigo-600",
  };



  // Sécurité : Redirige si aucun exercice n'a été sélectionné
  useEffect(() => {
    if (!exerciseData) navigate("/exercice");
  }, [exerciseData, navigate]);

  // Logique principale : Le Timer (s'exécute chaque seconde quand isPlaying est true)
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        // Gestion de la transition entre les phases
        let nextPhase: Phase = "inhale";
        let nextTime = inhale;

        if (phase === "inhale") {
          if (hold > 0) {
            nextPhase = "hold";
            nextTime = hold;
          } else {
            nextPhase = "exhale";
            nextTime = exhale;
          }
        } else if (phase === "hold") {
          nextPhase = "exhale";
          nextTime = exhale;
        } else if (phase === "exhale") {
          setCycleCount((c) => c + 1); // Un cycle est complété à la fin de l'expiration
          nextPhase = "inhale";
          nextTime = inhale;
        }

        setPhase(nextPhase);
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, phase, inhale, hold, exhale, isMuted]);



  // Démarre l'exercice et initialise le premier cycle
  const handleStart = () => {
    if (phase === "ready") {
      setPhase("inhale");
      setTimeLeft(inhale);
      setStartTime(new Date());
    }
    setIsPlaying(true);
  };

  // Gestion des animations (Taille du cercle)
  const getCircleScale = () => {
    if (phase === "inhale") return 1.5;
    if (phase === "hold") return 1.5;
    if (phase === "exhale") return 0.8;
    return 1;
  };

  // Enregistrement de la séance en base de données
  const saveSession = async () => {
    if (cycleCount === 0 || !startTime) {
      alert("Vous n'avez pas encore complété de cycle.");
      return;
    }

    try {
      setIsSaving(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Vous devez être connecté pour sauvegarder une séance.");
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("utilisateur")
        .select("id")
        .eq("email", user.email)
        .single();

      if (userError || !userData) throw new Error("Utilisateur introuvable");

      const totalDuration = cycleCount * (inhale + hold + exhale);

      const { error: insertError } = await supabase.from("seance").insert([
        {
          utilisateur_id: userData.id,
          mode_respiratoire_id: exerciseData.id,
          date_debut: startTime.toISOString(),
          duree_totale: totalDuration,
        },
      ]);

      if (insertError) throw insertError;

      alert("Séance sauvegardée avec succès !");

      // Réinitialisation après sauvegarde
      setIsPlaying(false);
      setPhase("ready");
      setTimeLeft(0);
      setCycleCount(0);
      setStartTime(null);
    } catch (error: any) {
      console.error("Erreur de sauvegarde :", error);
      alert("Impossible de sauvegarder la séance.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!exerciseData) return null;

//VIsuel 

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      <div className="w-full max-w-5xl mx-auto p-6">
        {/* Navigation & Mute */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/exercice")}
            className="gap-2 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button> */}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        <div className="text-center mb-12 space-y-2">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 dark:text-slate-100">
            {name}
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <Timer className="w-4 h-4" />
            <span>{cycleCount} cycles terminés</span>
          </div>
        </div>

        {/* Breathing Animation Area */}
        <div className="relative h-80 w-80 flex items-center justify-center mb-16">
          {/* Cercles d'ambiance en arrière-plan */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
                className="absolute inset-0 rounded-full bg-emerald-500/20 dark:bg-emerald-400/10"
              />
            )}
          </AnimatePresence>

          {/* Cercle Principal */}
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{
              duration:
                phase === "ready"
                  ? 1
                  : timeLeft === getPhaseDuration(phase, inhale, hold, exhale)
                    ? 0.5
                    : 1,
              ease: "easeInOut",
            }}
            className={`w-64 h-64 rounded-full bg-gradient-to-br ${phaseColors[phase]} shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col items-center justify-center text-white z-10 relative overflow-hidden`}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />

            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium mb-1 relative z-10 tracking-wide"
            >
              {phaseLabels[phase]}
            </motion.span>

            {timeLeft > 0 && (
              <motion.span
                key={timeLeft}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-7xl font-light relative z-10"
              >
                {timeLeft}
              </motion.span>
            )}
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 mb-16">
          {!isPlaying ? (
            <Button
              size="lg"
              onClick={handleStart}
              className="rounded-full px-10 h-14 text-lg shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              {phase === "ready" ? "Commencer" : "Reprendre"}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsPlaying(false)}
              className="rounded-full px-10 h-14 text-lg border-2 hover:bg-slate-50"
            >
              <Pause className="w-5 h-5 mr-2 fill-current" /> Pause
            </Button>
          )}

          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              setIsPlaying(false);
              setPhase("ready");
              setTimeLeft(0);
              setCycleCount(0);
            }}
            className="rounded-full h-14 w-14 hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="Réinitialiser"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
          {cycleCount > 0 && (
            <Button
              variant="default"
              onClick={saveSession}
              disabled={isSaving}
              className="rounded-full h-14 px-6 bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? "Sauvegarde..." : "Terminer et Sauvegarder"}
            </Button>
          )}
        </div>

        {/* Stats de l'exercice */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Inspiration
            </span>
            <span className="text-2xl font-light text-slate-700 dark:text-slate-200">
              {inhale}s
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Rétention
            </span>
            <span className="text-2xl font-light text-slate-700 dark:text-slate-200">
              {hold}s
            </span>
          </div>
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
              Expiration
            </span>
            <span className="text-2xl font-light text-slate-700 dark:text-slate-200">
              {exhale}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper pour récupérer la durée initiale de la phase
function getPhaseDuration(
  phase: Phase,
  inhale: number,
  hold: number,
  exhale: number,
) {
  if (phase === "inhale") return inhale;
  if (phase === "hold") return hold;
  if (phase === "exhale") return exhale;
  return 0;
}

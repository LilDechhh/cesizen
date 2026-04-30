import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Square, Wind, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/config/supabaseClient";
import { useAuth } from "@/context/auth-context";
import type { ModeRespiratoire } from "@/types";

export function BreathingExercise() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();

  // Récupération du mode choisi ou redirection
  const selectedMode = location.state?.mode as ModeRespiratoire;

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inspire" | "apnee" | "expire">("inspire");
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [stopTime, setStopTime] = useState<Date | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [phaseRemainingSeconds, setPhaseRemainingSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [phaseStartedAt, setPhaseStartedAt] = useState<number | null>(null);

  const phaseDurations = useMemo(
    () => ({
      inspire: selectedMode?.temps_inspiration ?? 0,
      apnee: selectedMode?.temps_apnee ?? 0,
      expire: selectedMode?.temps_expiration ?? 0,
    }),
    [selectedMode]
  );

  const currentPhaseDuration = useMemo(() => phaseDurations[phase], [phaseDurations, phase]);

  const getNextPhase = useCallback(
    (currentPhase: "inspire" | "apnee" | "expire") => {
      if (currentPhase === "inspire") {
        return phaseDurations.apnee > 0 ? "apnee" : "expire";
      }
      if (currentPhase === "apnee") {
        return "expire";
      }
      return "inspire";
    },
    [phaseDurations.apnee]
  );

  const phaseLabel = useMemo(() => {
    if (phase === "inspire") return "Inspiration";
    if (phase === "apnee") return "Apnée";
    return "Expiration";
  }, [phase]);

  const formatClock = useCallback((totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const circleScale = useMemo(() => {
    return phase === "expire" ? 1 : 1.5;
  }, [phase]);

  const circleTransition = useMemo(
    () => ({
      duration: currentPhaseDuration,
      ease: phase === "apnee" ? ("linear" as const) : ("easeInOut" as const),
    }),
    [currentPhaseDuration, phase]
  );

  // enregistre la séance
  const saveSession = useCallback(async () => {
    if (!profile?.id || !startTime || !selectedMode) {
      throw new Error("Impossible de sauvegarder la séance.");
    }

    const sessionEndTime = stopTime || new Date();
    const durationSeconds = Math.floor((sessionEndTime.getTime() - startTime.getTime()) / 1000);

    const { error } = await supabase
      .from("seance")
      .insert([
        {
          utilisateur_id: profile.id,
          mode_respiratoire_id: selectedMode.id,
          date_debut: startTime.toISOString(),
          duree_totale: durationSeconds,
        },
      ]);

    if (error) throw error;
  }, [profile, startTime, selectedMode, stopTime]);

  // gère l'arrêt de l'exercice
  const handleStop = () => {
    setStopTime(new Date());
    setIsActive(false);
    setShowFeedback(true);
    setSaveError("");
  };

  const handleStart = useCallback(() => {
    setPhase("inspire");
    setIsActive(true);
    setShowFeedback(false);
    setFeedbackScore(null);
    setSaveError("");
    setStartTime(new Date());
    setStopTime(null);
    setElapsedSeconds(0);
  }, []);

  const handleConfirmFeedback = async () => {
    if (feedbackScore === null) {
      setSaveError("Veuillez choisir un ressenti avant de terminer.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await saveSession();
      navigate("/profil", { state: { feedbackScore } });
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSaveError(error.message);
      } else {
        setSaveError("Erreur lors de l'enregistrement de la séance.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Logique du cycle respiratoire
  useEffect(() => {
    if (!isActive || !selectedMode) return;

    setPhaseStartedAt(Date.now());
    setPhaseRemainingSeconds(currentPhaseDuration);

    const timeoutId = window.setTimeout(() => {
      setPhase((prev) => getNextPhase(prev));
    }, currentPhaseDuration * 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isActive, selectedMode, currentPhaseDuration, getNextPhase]);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = window.setInterval(() => {
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - startTime.getTime()) / 1000));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isActive, startTime]);

  useEffect(() => {
    if (!isActive || phaseStartedAt === null) return;

    const interval = window.setInterval(() => {
      const elapsedInPhase = Math.floor((Date.now() - phaseStartedAt) / 1000);
      setPhaseRemainingSeconds(Math.max(currentPhaseDuration - elapsedInPhase, 0));
    }, 120);

    return () => {
      window.clearInterval(interval);
    };
  }, [isActive, phaseStartedAt, currentPhaseDuration]);

  if (!selectedMode) return null;

  return (
    <div className="max-w-md mx-auto p-4 space-y-8 min-h-[80vh] flex flex-col justify-center">
      {/* UI de l'exercice avec Animation Framer Motion */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-emerald-900">{selectedMode.libelle}</h1>
        <p className="text-emerald-600 font-medium h-8">{phaseLabel}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-emerald-700 font-medium">Phase en cours</p>
            <p className="text-2xl font-bold text-emerald-900">
              {isActive ? formatClock(phaseRemainingSeconds) : formatClock(currentPhaseDuration)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-700 font-medium">Durée totale</p>
            <p className="text-2xl font-bold text-slate-900">{formatClock(elapsedSeconds)}</p>
          </div>
        </div>
      </div>

      <div className="relative flex justify-center items-center h-64">
        <motion.div
          animate={{ scale: circleScale }}
          transition={circleTransition}
          className="w-40 h-40 bg-emerald-500/20 rounded-full border-4 border-emerald-500 flex items-center justify-center"
        >
          <Wind className="w-12 h-12 text-emerald-600" />
        </motion.div>
      </div>

      {!showFeedback && (
        <div className="flex justify-center gap-4">
          {!isActive ? (
            <Button
              onClick={handleStart}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Play className="mr-2" /> Commencer
            </Button>
          ) : (
            <Button onClick={handleStop} variant="destructive">
              <Square className="mr-2" /> Terminer
            </Button>
          )}
        </div>
      )}

      {showFeedback && (
        <Card className="border-emerald-200 bg-emerald-50/60">
          <CardHeader>
            <CardTitle className="text-emerald-900 text-lg">Comment vous sentez-vous ?</CardTitle>
            <CardDescription>
              Sélectionnez votre ressenti avant d'enregistrer votre séance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <Button
                  key={score}
                  type="button"
                  variant={feedbackScore === score ? "default" : "outline"}
                  className={feedbackScore === score ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  onClick={() => setFeedbackScore(score)}
                >
                  {score}
                </Button>
              ))}
            </div>

            {saveError && (
              <p className="text-sm text-red-600">{saveError}</p>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowFeedback(false);
                  setFeedbackScore(null);
                  setSaveError("");
                }}
                disabled={isSaving}
              >
                Retour
              </Button>
              <Button
                type="button"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleConfirmFeedback}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isSaving ? "Enregistrement..." : "Valider et terminer"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
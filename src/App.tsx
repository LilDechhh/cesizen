import { Routes, Route } from "react-router-dom";
import { Navbar } from "./components/layout/navbar";
import { Home } from "./pages/home";
import Informations from "./pages/information";
import LoginPage from "./pages/connexion";
import { Exercises } from "./pages/exercice";
import { Profile } from "./pages/profil";
import { BreathingExercise } from "./pages/breathingExercice";
import { AdminPage } from "./pages/admin";
import { ForgotPassword } from "./pages/forgotPassword";
import { ResetPassword } from "./pages/resetPassword";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/infos" element={<Informations />} />
        <Route path="/exercice" element={<Exercises />} />
        <Route path="/connexion" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profil" element={<Profile />} />
        <Route path="/breathing_exercice" element={<BreathingExercise />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;

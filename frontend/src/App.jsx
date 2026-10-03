import { BrowserRouter as Router, Link, Routes, Route, useLocation } from "react-router-dom";
import { Home } from "lucide-react";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import HomePage from "./components/pages/Home";
import Dining from "./components/pages/Dining";
import DiningSubPage from "./components/pages/DiningSubPage";
import Food from "./components/pages/Food";
import FoodSubPage from "./components/pages/FoodSubPage";
import Music from "./components/pages/Music";
import MusicSchedule from "./components/pages/MusicSchedule";
import MusicTavernSchedule from "./components/pages/MusicTavernSchedule";
import MusicLegacy from "./components/pages/MusicLegacy";
import History from "./components/pages/History";
import HistoryTimeline from "./components/HistoryTimeline";
import HistoryYearPage from "./components/pages/HistoryYearPage";
import Press from "./components/pages/Press";
import Pride from "./components/pages/Pride";
import PrideLgbtqSubPage from "./components/pages/PrideLgbtqSubPage";
import Book from "./components/pages/Book";

import Dashboard from "./admin/Dashboard";
import AdminFood from "./admin/pages/FoodEditor";
import AdminDining from "./admin/pages/DiningEditor";
import AdminHistory from "./admin/pages/HistoryEditor";
import AdminMusic from "./admin/pages/MusicEditor";
import AdminPress from "./admin/pages/PressEditor";
import AdminBook from "./admin/pages/BookEditor";
import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";
import LoginPage from "./auth/LoginPage";
import IdleSessionGuard from "./auth/IdleSessionGuard";

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/dashboard";
  const isAdminIndex = location.pathname === "/admin" || location.pathname === "/dashboard";

  return (
    <div
      className={`min-h-screen bg-white text-gray-900 flex flex-col ${
        isAdminRoute ? "admin-font pt-5" : ""
      }`}
    >
      {!isAdminRoute && <Navbar />}

      {isAdminRoute && !isAdminIndex && (
        <Link
          to="/admin"
          className="fixed left-5 top-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-transform hover:scale-105"
          aria-label="Admin home"
        >
          <Home className="h-5 w-5" />
        </Link>
      )}

      <div className="grow">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/dining" element={<Dining />} />
          <Route path="/dining/:slug" element={<DiningSubPage />} />

          <Route path="/food" element={<Food />} />
          <Route path="/food/:slug" element={<FoodSubPage />} />
          <Route
            path="/food-indian"
            element={<FoodSubPage title="Indian" basePath="/food-indian" />}
          />
          <Route
            path="/food-chinese"
            element={<FoodSubPage title="Chinese" basePath="/food-chinese" />}
          />
          <Route
            path="/food-continental"
            element={<FoodSubPage title="Continental" basePath="/food-continental" />}
          />
          <Route
            path="/food-drinks"
            element={<FoodSubPage title="Drinks" basePath="/food-drinks" />}
          />
          <Route
            path="/food-cafe"
            element={<FoodSubPage title="Cafe" basePath="/food-cafe" />}
          />

          <Route path="/music" element={<Music />} />
          <Route path="/music-schedule" element={<MusicSchedule />} />
          <Route path="/music-tavern-schedule" element={<MusicTavernSchedule />} />
          <Route path="/music-legacy" element={<MusicLegacy />} />

          <Route path="/history" element={<History />} />
          <Route path="/history-timeline" element={<HistoryTimeline />} />
          <Route path="/history-timeline/:decade" element={<HistoryYearPage />} />
          <Route path="/history/:decade" element={<HistoryYearPage />} />

          <Route path="/press" element={<Press />} />
          <Route path="/pride" element={<Pride />} />
          <Route path="/pride-lgbtq" element={<PrideLgbtqSubPage />} />
          <Route path="/book" element={<Book />} />

          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/food" element={<ProtectedRoute><AdminFood /></ProtectedRoute>} />
          <Route path="/admin/dining" element={<ProtectedRoute><AdminDining /></ProtectedRoute>} />
          <Route path="/admin/history" element={<ProtectedRoute><AdminHistory /></ProtectedRoute>} />
          <Route path="/admin/music" element={<ProtectedRoute><AdminMusic /></ProtectedRoute>} />
          <Route path="/admin/press" element={<ProtectedRoute><AdminPress /></ProtectedRoute>} />
          <Route path="/admin/book" element={<ProtectedRoute><AdminBook /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <IdleSessionGuard />
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;

import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { supabase } from "./lib/supabase";

import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Home from "./components/pages/Home";
import Dining from "./components/pages/Dining";
import Food from "./components/pages/Food";
import Music from "./components/pages/Music";
import History from "./components/pages/History";
import FoodSubPage from "./components/pages/FoodSubPage";
import HistoryYearPage from "./components/pages/HistoryYearPage";
import Press from "./components/pages/Press";
import Pride from "./components/pages/Pride";
import PrideLgbtqSubPage from "./components/pages/PrideLgbtqSubPage";
import Dashboard from "./admin/Dashboard";
import AdminFood from "./admin/pages/FoodEditor";

function App() {

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white text-gray-900 flex flex-col">
        <Navbar />
        <div className="grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dining" element={<Dining />} />
            <Route path="/food" element={<Food />} />
            <Route path="/food/:slug" element={<FoodSubPage />} />
            <Route path="/food-indian" element={<FoodSubPage title="Indian" basePath="/food-indian" />} />
            <Route path="/food-chinese" element={<FoodSubPage title="Chinese" basePath="/food-chinese" />} />
            <Route path="/food-continental" element={<FoodSubPage title="Continental" basePath="/food-continental" />} />
            <Route path="/food-drinks" element={<FoodSubPage title="Drinks" basePath="/food-drinks" />} />
            <Route path="/food-cafe" element={<FoodSubPage title="Cafe" basePath="/food-cafe" />} />
            <Route path="/music" element={<Music />} />
            <Route path="/history" element={<History />} />
            <Route path="/history/:decade" element={<HistoryYearPage />} />
            <Route path="/press" element={<Press />} />
            <Route path="/pride" element={<Pride />} />
            <Route path="/pride-lgbtq" element={<PrideLgbtqSubPage />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/food" element={<AdminFood />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
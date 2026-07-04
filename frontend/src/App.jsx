import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Dining from './components/pages/Dining'
import Food from './components/pages/Food'
import Music from './components/pages/Music'
import History from './components/pages/History'
import FoodSubPage from './components/pages/FoodSubPage'
import Footer from './components/Footer'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#fefce8] text-gray-900 flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dining" element={<Dining />} />
            <Route path="/food" element={<Food />} />
            <Route path="/food-indian" element={<FoodSubPage title="Indian" basePath="/food-indian" />} />
            <Route path="/food-chinese" element={<FoodSubPage title="Chinese" basePath="/food-chinese" />} />
            <Route path="/food-continental" element={<FoodSubPage title="Continental" basePath="/food-continental" />} />
            <Route path="/food-cafe" element={<FoodSubPage title="Cafe" basePath="/food-cafe" />} />
            <Route path="/music" element={<Music />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App

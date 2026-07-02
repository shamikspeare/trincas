import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import Navbar from './components/Navbar'
import Home from './components/pages/Home'
import Dining from './components/pages/Dining'
import Food from './components/pages/Food'
import Music from './components/pages/Music'
import History from './components/pages/History'
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

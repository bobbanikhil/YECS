import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import FuturisticNavbar from './components/FuturisticNavbar';
import LoadingScreen from './components/LoadingScreen';
import UltraInteractiveHome from './pages/UltraInteractiveHome';
import UserRegistration from './pages/UserRegistration';
import BusinessProfile from './pages/BusinessProfile';
import FinancialData from './pages/FinancialData';
import ScoreCalculation from './pages/ScoreCalculation';
import Dashboard from './pages/Dashboard';
import BiasAnalysis from './pages/BiasAnalysis';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Router>
      <div className="App futuristic-app">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingScreen key="loading" />
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FuturisticNavbar />

              <div className="main-content">
                <Routes>
                  <Route path="/" element={<UltraInteractiveHome />} />
                  <Route path="/register" element={<UserRegistration />} />
                  <Route path="/business-profile/:userId" element={<BusinessProfile />} />
                  <Route path="/financial-data/:userId" element={<FinancialData />} />
                  <Route path="/calculate-score/:userId" element={<ScoreCalculation />} />
                  <Route path="/dashboard/:userId" element={<Dashboard />} />
                  <Route path="/bias-analysis" element={<BiasAnalysis />} />
                </Routes>
              </div>

              <ToastContainer
                position="top-right"
                autoClose={3000}
                theme="dark"
                toastClassName="futuristic-toast"
              />

              <div
                className="cursor-trail"
                style={{
                  left: mousePosition.x,
                  top: mousePosition.y
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;

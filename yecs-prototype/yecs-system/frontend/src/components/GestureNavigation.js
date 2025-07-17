import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './GestureNavigation.css';

const GestureNavigation = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const navigate = useNavigate();
  const constraintsRef = useRef(null);

  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-200, 0, 200], [0.8, 1, 0.8]);

  // Fixed: Wrapped in useMemo to prevent re-creation
  const sections = useMemo(() => [
    { id: 'home', label: 'Home', path: '/', icon: '🏠' },
    { id: 'register', label: 'Register', path: '/register', icon: '📝' },
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { id: 'analysis', label: 'Analysis', path: '/bias-analysis', icon: '🔍' }
  ], []);

  const handleTap = useCallback((index) => {
    setActiveSection(index);
    navigate(sections[index].path);
  }, [navigate, sections]);

  // Fixed: Removed unused PanInfo import
  const handlePan = (event, info) => {
    const threshold = 100;

    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 1 : -1;
      const newSection = Math.max(0, Math.min(sections.length - 1, activeSection + direction));

      if (newSection !== activeSection) {
        setActiveSection(newSection);
        setIsGestureActive(true);

        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }

        setTimeout(() => {
          navigate(sections[newSection].path);
          setIsGestureActive(false);
        }, 300);
      }
    }
  };

  return (
    <div className="gesture-navigation">
      <div className="gesture-hint">
        <motion.div
          className="swipe-indicator"
          animate={{ x: [-20, 20, -20] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          👆 Swipe to navigate
        </motion.div>
      </div>

      <div className="nav-container" ref={constraintsRef}>
        <motion.div
          className="nav-items"
          drag="x"
          dragConstraints={constraintsRef}
          onPan={handlePan}
          style={{ x, opacity, scale }}
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              className={`nav-item ${index === activeSection ? 'active' : ''}`}
              onClick={() => handleTap(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="nav-icon">{section.icon}</div>
              <div className="nav-label">{section.label}</div>
              <div className="nav-progress">
                <div
                  className="progress-bar"
                  style={{ width: index === activeSection ? '100%' : '0%' }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {isGestureActive && (
        <motion.div
          className="gesture-feedback"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
        >
          <div className="feedback-ripple"></div>
          <div className="feedback-text">Navigating to {sections[activeSection].label}</div>
        </motion.div>
      )}
    </div>
  );
};

export default GestureNavigation;

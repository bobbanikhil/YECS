import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './FloatingElements.css';

const FloatingElements = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const elements = container.querySelectorAll('.floating-element');

    elements.forEach((element, index) => {
      const duration = 10 + Math.random() * 20;
      const delay = index * 0.5;

      element.style.animationDuration = `${duration}s`;
      element.style.animationDelay = `${delay}s`;
    });
  }, []);

  const floatingElements = [
    { icon: '⚡', size: 'small', color: 'neon-1' },
    { icon: '💰', size: 'medium', color: 'neon-2' },
    { icon: '🚀', size: 'large', color: 'neon-3' },
    { icon: '📊', size: 'small', color: 'neon-1' },
    { icon: '🔮', size: 'medium', color: 'neon-2' },
    { icon: '⭐', size: 'small', color: 'neon-3' },
    { icon: '🌟', size: 'large', color: 'neon-1' },
    { icon: '💎', size: 'medium', color: 'neon-2' },
    { icon: '🔥', size: 'small', color: 'neon-3' },
    { icon: '🌈', size: 'large', color: 'neon-1' }
  ];

  return (
    <div className="floating-elements-container" ref={containerRef}>
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className={`floating-element ${element.size} ${element.color}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: index * 0.2,
            duration: 0.5,
            type: 'spring',
            stiffness: 100
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        >
          <div className="element-glow"></div>
          <span className="element-icon">{element.icon}</span>
        </motion.div>
      ))}

      {/* Geometric shapes */}
      <div className="geometric-shapes">
        <div className="shape triangle"></div>
        <div className="shape circle"></div>
        <div className="shape square"></div>
        <div className="shape diamond"></div>
      </div>
    </div>
  );
};

export default FloatingElements;

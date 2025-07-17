import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './UltraInteractiveHome.css';

const UltraInteractiveHome = () => {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const { scrollYProgress } = useScroll({ target: containerRef });
  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const scaleX = useSpring(useTransform(scrollYProgress, [0, 1], [1, 1.2]), springConfig);
  const rotateZ = useSpring(useTransform(scrollYProgress, [0, 1], [0, 360]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Advanced GSAP animations
    gsap.registerPlugin();

    // Floating particles animation
    gsap.to('.floating-particle', {
      y: 'random(-100, 100)',
      x: 'random(-100, 100)',
      duration: 'random(2, 4)',
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: 0.1
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleScoreDemo = () => {
    navigate('/register');
  };

  return (
    <div className="ultra-interactive-home" ref={containerRef}>
      {/* Dynamic Background */}
      <div className="dynamic-background">
        <motion.div
          className="gradient-orb orb-1"
          animate={{
            x: mousePosition.x / 20,
            y: mousePosition.y / 20,
            scale: isHovered ? 1.2 : 1
          }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="gradient-orb orb-2"
          animate={{
            x: -mousePosition.x / 30,
            y: -mousePosition.y / 30,
            scale: isHovered ? 0.8 : 1
          }}
          transition={{ type: 'spring', stiffness: 40, damping: 25 }}
        />

        {/* Floating Particles */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <motion.section className="hero-section" style={{ y }}>
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.h1
            className="hero-title"
            style={{ scaleX, rotateZ: rotateZ }}
          >
            <span className="title-word">YECS</span>
            <motion.span
              className="title-highlight"
              animate={{
                color: ['#00ff88', '#0088ff', '#ff0088', '#00ff88']
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Revolution
            </motion.span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            AI-Powered Credit Scoring for Young Entrepreneurs
          </motion.p>

          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            <div className="stat-item">
              <motion.div
                className="stat-number"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                98%
              </motion.div>
              <div className="stat-label">Accuracy</div>
            </div>
            <div className="stat-item">
              <motion.div
                className="stat-number"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                50K+
              </motion.div>
              <div className="stat-label">Users</div>
            </div>
            <div className="stat-item">
              <motion.div
                className="stat-number"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                $2B+
              </motion.div>
              <div className="stat-label">Funded</div>
            </div>
          </motion.div>

          <motion.div
            className="hero-cta"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <motion.button
              className="cta-button primary"
              onClick={handleScoreDemo}
              whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0, 255, 136, 0.8)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Get Your Score</span>
              <div className="button-glow"></div>
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Interactive Features Grid */}
      <motion.section className="features-section">
        <div className="features-grid">
          {[
            { title: 'AI-Powered', icon: '🤖', color: '#00ff88' },
            { title: 'Real-Time', icon: '⚡', color: '#0088ff' },
            { title: 'Bias-Free', icon: '⚖️', color: '#ff0088' },
            { title: 'Secure', icon: '🔒', color: '#ffaa00' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                boxShadow: `0 20px 40px ${feature.color}40`
              }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <div className="feature-glow" style={{ backgroundColor: feature.color }}></div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Cursor Follower */}
      <motion.div
        className="cursor-follower"
        animate={{
          x: mousePosition.x - 10,
          y: mousePosition.y - 10
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </div>
  );
};

export default UltraInteractiveHome;

import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import './FuturisticNavbar.css';

const FuturisticNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: 0.2
      }
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/register', label: 'Get Started' },
    { path: '/bias-analysis', label: 'Bias Analysis' }
  ];

  return (
    <motion.nav
      className={`futuristic-navbar ${scrolled ? 'scrolled' : ''}`}
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <Container>
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <motion.div
              className="brand-container"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="brand-icon">
                <div className="icon-core"></div>
                <div className="icon-ring"></div>
              </div>
              <div className="brand-text">
                <span className="brand-name">YECS</span>
                <span className="brand-subtitle">AI Credit Scoring</span>
              </div>
            </motion.div>
          </Link>

          <div className="navbar-nav">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                className="nav-item"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-text">{item.label}</span>
                  <div className="nav-indicator"></div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </motion.nav>
  );
};

export default FuturisticNavbar;

import React from 'react';
import { motion } from 'framer-motion';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="loading-content">
        <motion.div
          className="logo-container"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="loading-title">YECS</h1>
          <p className="loading-subtitle">Young Entrepreneur Credit Score</p>
        </motion.div>

        <motion.div
          className="loading-animation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="circuit-board">
            <div className="circuit-line line-1"></div>
            <div className="circuit-line line-2"></div>
            <div className="circuit-line line-3"></div>
            <div className="circuit-node node-1"></div>
            <div className="circuit-node node-2"></div>
            <div className="circuit-node node-3"></div>
          </div>
        </motion.div>

        <motion.div
          className="loading-progress"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.5, delay: 0.5 }}
        >
          <div className="progress-bar"></div>
        </motion.div>

        <motion.p
          className="loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          Initializing AI Credit Scoring System...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;

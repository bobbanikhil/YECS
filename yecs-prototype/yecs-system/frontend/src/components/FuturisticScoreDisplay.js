import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './FuturisticScoreDisplay.css';

const ScoreOrb = ({ score, color }) => {
  const orbRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      orbRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      orbRef.current.scale.setScalar(hovered ? 1.2 : 1);
    }
  });

  return (
    <mesh
      ref={orbRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        emissive={color}
        emissiveIntensity={0.2}
      />
      <Text
        position={[0, 0, 1.1]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {score}
      </Text>
    </mesh>
  );
};

const FuturisticScoreDisplay = ({ scoreData }) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const controls = useAnimation();
  const containerRef = useRef();

  const { yecs_score, component_scores, risk_level } = scoreData;

  useEffect(() => {
    // Sequential animation phases
    const animateScore = async () => {
      // Phase 1: Appear
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 1, ease: "easeOut" }
      });

      // Phase 2: Pulse
      await controls.start({
        scale: [1, 1.1, 1],
        transition: { duration: 0.5, times: [0, 0.5, 1] }
      });

      setAnimationPhase(1);
    };

    animateScore();
  }, [controls]);

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW': return '#00ff88';
      case 'MEDIUM': return '#ffaa00';
      case 'HIGH': return '#ff4444';
      default: return '#888888';
    }
  };

  return (
    <div className="futuristic-score-display" ref={containerRef}>
      {/* Main Score Display */}
      <motion.div
        className="main-score-container"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={controls}
      >
        <div className="score-hologram">
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <ScoreOrb score={yecs_score} color={getRiskColor(risk_level)} />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>

        <div className="score-info">
          <motion.h1
            className="score-number"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {yecs_score}
          </motion.h1>
          <motion.p
            className="score-label"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            YECS Score
          </motion.p>
          <motion.div
            className={`risk-badge ${risk_level.toLowerCase()}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
          >
            {risk_level} RISK
          </motion.div>
        </div>
      </motion.div>

      {/* Component Scores Visualization */}
      <motion.div
        className="component-scores-3d"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <div className="components-grid">
          {Object.entries(component_scores).map(([key, value], index) => (
            <motion.div
              key={key}
              className="component-item"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ delay: 1.4 + index * 0.1 }}
            >
              <div className="component-name">
                {key.replace('_', ' ').toUpperCase()}
              </div>
              <div className="component-value">
                <div
                  className="progress-ring"
                  style={{
                    '--progress': `${value}%`,
                    '--color': getRiskColor(value > 75 ? 'LOW' : value > 50 ? 'MEDIUM' : 'HIGH')
                  }}
                >
                  <svg className="progress-svg">
                    <circle className="progress-circle-bg" cx="50%" cy="50%" r="45%" />
                    <circle className="progress-circle" cx="50%" cy="50%" r="45%" />
                  </svg>
                  <div className="progress-text">{value.toFixed(1)}%</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Interactive Data Streams */}
      <div className="data-streams">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="data-stream"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default FuturisticScoreDisplay;

import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Remove the unused 'motion' import
// import { motion } from 'framer-motion';

const ParticleField = ({ mouse }) => {
  const ref = useRef();
  const { viewport } = useThree();

  const particlesPosition = React.useMemo(() => {
    const positions = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * viewport.width * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * viewport.height * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, [viewport]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.05;
      ref.current.rotation.y = state.clock.elapsedTime * 0.075;

      // Mouse interaction
      const mouseX = (mouse.x / window.innerWidth) * 2 - 1;
      const mouseY = -(mouse.y / window.innerHeight) * 2 + 1;

      ref.current.rotation.x += mouseY * 0.01;
      ref.current.rotation.y += mouseX * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00ff88"
        size={0.01}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const FloatingOrbs = ({ mouse }) => {
  const orbsRef = useRef();

  useFrame((state) => {
    if (orbsRef.current) {
      orbsRef.current.children.forEach((orb, index) => {
        orb.position.y = Math.sin(state.clock.elapsedTime + index) * 0.5;
        orb.position.x = Math.cos(state.clock.elapsedTime + index) * 0.3;
      });
    }
  });

  return (
    <group ref={orbsRef}>
      {[...Array(8)].map((_, i) => (
        <Sphere key={i} args={[0.1, 32, 32]} position={[
          Math.sin(i * Math.PI * 2 / 8) * 3,
          Math.cos(i * Math.PI * 2 / 8) * 3,
          0
        ]}>
          <meshBasicMaterial
            color={`hsl(${120 + i * 30}, 100%, 50%)`}
            transparent
            opacity={0.6}
          />
        </Sphere>
      ))}
    </group>
  );
};

const InteractiveBackground = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="interactive-background">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ParticleField mouse={mouse} />
        <FloatingOrbs mouse={mouse} />
      </Canvas>
    </div>
  );
};

export default InteractiveBackground;

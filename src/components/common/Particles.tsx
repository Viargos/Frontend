"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ParticleProps {
  className?: string;
  count?: number;
  colors?: string[];
  size?: "sm" | "md" | "lg";
  speed?: "slow" | "normal" | "fast";
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

export default function Particles({
  className = "",
  count = 20,
  colors = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981", "#F59E0B"],
  size = "md",
  speed = "normal",
}: ParticleProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const sizeMap = {
    sm: { min: 2, max: 6 },
    md: { min: 4, max: 12 },
    lg: { min: 8, max: 20 },
  };

  const speedMap = {
    slow: { min: 8, max: 15 },
    normal: { min: 5, max: 12 },
    fast: { min: 3, max: 8 },
  };

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        size: Math.random() * (sizeMap[size].max - sizeMap[size].min) + sizeMap[size].min,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: Math.random() * (speedMap[speed].max - speedMap[speed].min) + speedMap[speed].min,
        delay: Math.random() * 2,
      });
    }

    setParticles(newParticles);
  }, [dimensions, count, colors, size, speed]);

  if (particles.length === 0) return null;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            y: [particle.y, particle.y - 100, particle.y],
            x: [particle.x, particle.x + 50, particle.x - 30, particle.x],
            scale: [0.5, 1, 0.8, 0.5],
            opacity: [0, 0.8, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// Floating geometric shapes component
export function FloatingShapes({ className = "" }: { className?: string }) {
  const shapes = [
    { type: "circle", size: 40, color: "bg-blue-200/20" },
    { type: "square", size: 30, color: "bg-purple-200/20" },
    { type: "triangle", size: 35, color: "bg-indigo-200/20" },
    { type: "circle", size: 25, color: "bg-cyan-200/20" },
    { type: "square", size: 45, color: "bg-pink-200/20" },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.color}`}
          style={{
            width: shape.size,
            height: shape.size,
            left: `${10 + index * 20}%`,
            top: `${20 + index * 15}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, -10, 0],
            rotate: [0, 180, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 6 + index * 2,
            delay: index * 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {shape.type === "circle" && (
            <div className="w-full h-full rounded-full" />
          )}
          {shape.type === "square" && (
            <div className="w-full h-full rounded-lg rotate-45" />
          )}
          {shape.type === "triangle" && (
            <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-current opacity-30" />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Gradient orbs component
export function GradientOrbs({ className = "" }: { className?: string }) {
  const orbs = [
    {
      gradient: "from-blue-400 to-cyan-300",
      size: "w-32 h-32",
      position: "top-10 right-10",
      duration: 8,
    },
    {
      gradient: "from-purple-400 to-pink-300",
      size: "w-24 h-24",
      position: "bottom-20 left-10",
      duration: 6,
    },
    {
      gradient: "from-indigo-400 to-blue-300",
      size: "w-40 h-40",
      position: "top-1/2 right-1/4",
      duration: 10,
    },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.size} ${orb.position} bg-gradient-to-br ${orb.gradient} rounded-full opacity-20 blur-xl`}
          animate={{
            scale: [1, 1.5, 1.2, 1],
            opacity: [0.1, 0.3, 0.2, 0.1],
            x: [0, 50, -30, 0],
            y: [0, -30, 20, 0],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 1.5,
          }}
        />
      ))}
    </div>
  );
}

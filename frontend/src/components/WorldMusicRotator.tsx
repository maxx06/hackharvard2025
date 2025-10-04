'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Drum, Guitar, Piano, Volume2, Mic } from "lucide-react";

const worldMusicStyles = [
  { icon: Drum, label: "West African", region: "Djembe", color: "from-orange-500/20 to-red-500/10" },
  { icon: Guitar, label: "Flamenco", region: "Spain", color: "from-red-500/20 to-yellow-500/10" },
  { icon: Piano, label: "Classical", region: "Europe", color: "from-blue-500/20 to-purple-500/10" },
  { icon: Volume2, label: "Bollywood", region: "India", color: "from-pink-500/20 to-orange-500/10" },
  { icon: Mic, label: "Opera", region: "Italy", color: "from-green-500/20 to-blue-500/10" },
  { icon: Drum, label: "Samba", region: "Brazil", color: "from-yellow-500/20 to-green-500/10" },
  { icon: Guitar, label: "Blues", region: "USA", color: "from-indigo-500/20 to-blue-500/10" },
  { icon: Piano, label: "Jazz", region: "New Orleans", color: "from-purple-500/20 to-pink-500/10" },
];

export default function WorldMusicRotator() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % worldMusicStyles.length);
        setIsTransitioning(false);
      }, 300); // Half transition duration
    }, 3000); // Rotate every 3 seconds

    const activeInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 5); // Rotate active state through 5 positions
    }, 4000); // Change active every 4 seconds

    return () => {
      clearInterval(interval);
      clearInterval(activeInterval);
    };
  }, []);

  const currentStyles = worldMusicStyles.slice(currentIndex, currentIndex + 5);
  const paddedStyles = currentStyles.length < 5 
    ? [...currentStyles, ...worldMusicStyles.slice(0, 5 - currentStyles.length)]
    : currentStyles;

  return (
    <div className="grid grid-cols-5 gap-3">
      {paddedStyles.map((item, i) => (
        <Card
          key={`${currentIndex}-${i}`}
          className={`p-4 text-center space-y-2 border-slate-700/30 backdrop-blur-sm transition-all duration-700 hover:scale-105 ${
            isTransitioning 
              ? "opacity-50 scale-95 transform rotate-1" 
              : "opacity-100 scale-100 transform rotate-0"
          } ${
            i === activeIndex 
              ? `bg-gradient-to-br ${item.color} border-blue-400/40 shadow-lg shadow-blue-500/10` 
              : "bg-slate-800/30 hover:bg-slate-700/40"
          }`}
          style={{
            animationDelay: `${i * 0.1}s`,
            transition: isTransitioning 
              ? "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)" 
              : "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          <div className={`text-2xl transition-all duration-500 ${
            isTransitioning 
              ? "scale-90 opacity-60" 
              : "scale-100 opacity-100"
          } ${i === activeIndex ? "text-blue-400" : "text-slate-500"}`}>
            <item.icon className="w-6 h-6 mx-auto" />
          </div>
          <p className={`text-xs font-medium transition-all duration-500 ${
            isTransitioning 
              ? "translate-y-1 opacity-60" 
              : "translate-y-0 opacity-100"
          } ${i === activeIndex ? "text-blue-300" : "text-slate-500"}`}>
            {item.label}
          </p>
          <p className={`text-xs transition-all duration-500 ${
            isTransitioning 
              ? "translate-y-1 opacity-40" 
              : "translate-y-0 opacity-100"
          } ${i === activeIndex ? "text-blue-200" : "text-slate-600"}`}>
            {item.region}
          </p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 4 }).map((_, j) => (
              <div
                key={j}
                className={`size-1 rounded-full transition-all duration-500 ${
                  isTransitioning 
                    ? "scale-75 opacity-40" 
                    : "scale-100 opacity-100"
                } ${
                  i === activeIndex 
                    ? "bg-blue-400 animate-pulse" 
                    : "bg-slate-600/30"
                }`}
                style={{animationDelay: `${j * 0.1}s`}}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

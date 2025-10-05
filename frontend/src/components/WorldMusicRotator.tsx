'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Drum, Guitar, Piano, Volume2, Mic } from "lucide-react";

const worldMusicStyles = [
  { icon: Drum, label: "West African", region: "Djembe", color: "from-orange-500/20 to-red-500/10" },
  { icon: Guitar, label: "Flamenco", region: "Spain", color: "from-red-500/20 to-yellow-500/10" },
  { icon: Piano, label: "Classical", region: "Europe", color: "from-blue-500/20 to-purple-500/10" },
  { icon: Volume2, label: "Yangqin", region: "China", color: "from-pink-500/20 to-orange-500/10" },
  { icon: Mic, label: "Opera", region: "Italy", color: "from-green-500/20 to-blue-500/10" },
];

export default function WorldMusicRotator() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const activeInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 5);
    }, 2500); // Change active every 2.5 seconds

    return () => {
      clearInterval(activeInterval);
    };
  }, []);

  return (
    <div className="grid grid-cols-5 gap-3">
      {worldMusicStyles.map((item, i) => {
        const isActive = i === activeIndex;
        const Icon = item.icon;

        return (
          <Card
            key={i}
            className={`p-4 text-center space-y-2 border-slate-700/30 backdrop-blur-sm hover:scale-105 transition-all duration-500 ease-in-out ${
              isActive
                ? `bg-gradient-to-br ${item.color} border-blue-400/40 shadow-lg shadow-blue-500/10`
                : "bg-slate-800/30 hover:bg-slate-700/40"
            }`}
          >
            <div className={`transition-all duration-500 ease-in-out ${isActive ? "text-blue-400 scale-110" : "text-slate-500 scale-100"}`}>
              <Icon className="w-6 h-6 mx-auto" />
            </div>
            <p className={`text-xs font-medium transition-all duration-500 ease-in-out ${isActive ? "text-blue-300" : "text-slate-500"}`}>
              {item.label}
            </p>
            <p className={`text-xs transition-all duration-500 ease-in-out ${isActive ? "text-blue-200" : "text-slate-600"}`}>
              {item.region}
            </p>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <div
                  key={j}
                  className={`size-1 rounded-full transition-all duration-500 ease-in-out ${
                    isActive
                      ? "bg-blue-400 animate-pulse"
                      : "bg-slate-600/30"
                  }`}
                  style={{animationDelay: `${j * 100}ms`}}
                />
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

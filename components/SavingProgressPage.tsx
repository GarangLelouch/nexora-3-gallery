/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState, useEffect} from 'react';

const STEPS = [
  "Initialisation du moteur Veo 3.1...",
  "Analyse sémantique du script...",
  "Synchronisation de la cohérence temporelle...",
  "Rendu des vecteurs de mouvement...",
  "Spatialisation cinématique...",
  "Optimisation HDR..."
];

interface SavingProgressPageProps {
  currentSegment?: number;
  totalSegments?: number;
}

export const SavingProgressPage: React.FC<SavingProgressPageProps> = ({ 
  currentSegment = 1, 
  totalSegments = 1 
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-[#07080a] flex flex-col items-center justify-center z-50 animate-fade-in overflow-hidden"
      aria-live="polite"
      aria-busy="true">
      
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-10">
        <div className="relative w-24 h-24 mb-12">
          <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full animate-spin"></div>
        </div>

        <div className="text-center space-y-6 w-full">
          <div className="space-y-2">
            <h2 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.4em] animate-pulse">
              Production en cours
            </h2>
            <div className="text-3xl font-black text-white italic tracking-tighter">
              SEGMENT {currentSegment} <span className="text-gray-700">/ {totalSegments}</span>
            </div>
          </div>

          <div className="h-4 flex items-center justify-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              {STEPS[step]}
            </p>
          </div>
        </div>

        <div className="mt-12 w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
          <div 
            className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-1000"
            style={{ width: `${(currentSegment / totalSegments) * 100}%` }}
          ></div>
        </div>
        
        <p className="mt-6 text-[8px] text-gray-700 uppercase font-black tracking-[0.3em]">
          Ne fermez pas Nexora - Le rendu long métrage demande de la puissance
        </p>
      </div>
    </div>
  );
};

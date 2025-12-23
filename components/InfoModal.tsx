/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {XMarkIcon} from './icons.tsx';

interface InfoModalProps {
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({onClose}) => {
  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center animate-fade-in p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog">
      <div
        className="bg-[#0f1115] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}>
        
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#161920]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Maîtriser Nexora 3
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-8 text-sm leading-relaxed">
          <section className="bg-purple-600/10 border border-purple-500/20 p-5 rounded-2xl">
            <h3 className="text-purple-400 font-bold uppercase tracking-widest text-xs mb-3">⚠️ Pourquoi 8 secondes ?</h3>
            <p className="text-gray-300 mb-4">
              Le moteur <strong>Veo 3.1</strong> génère des segments de base de 5 à 8 secondes pour maintenir une physique parfaite. Pour créer des vidéos plus longues, utilisez le <strong>Chaînage Temporel</strong>.
            </p>
            <div className="flex items-center gap-4 text-[10px] font-mono text-purple-300">
              <div className="p-2 border border-purple-500/30 rounded">CLIP BASE (8s)</div>
              <span>→</span>
              <div className="p-2 border border-purple-500/30 rounded">EXT. (+7s)</div>
              <span>→</span>
              <div className="p-2 border border-purple-500/30 rounded">EXT. (+7s)</div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <h4 className="text-white font-semibold mb-2">Mode Remix</h4>
              <p className="text-gray-400 text-xs">Reprend le prompt original pour générer une nouvelle variante de 8 secondes.</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
              <h4 className="text-white font-semibold mb-2">Mode Extension</h4>
              <p className="text-gray-400 text-xs">Ajoute 7 secondes à la fin du clip sélectionné en conservant la continuité visuelle.</p>
            </div>
          </section>

          <section>
            <h3 className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-3">Pipeline Technique</h3>
            <ul className="space-y-2 text-gray-300 text-xs">
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Modèle d'extension</span>
                <span className="font-mono text-purple-400">veo-3.1-generate-preview</span>
              </li>
              <li className="flex justify-between border-b border-gray-800 pb-2">
                <span>Résolution Extension</span>
                <span className="font-mono text-purple-400">720p HD Fixe</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="p-4 bg-[#161920] border-t border-gray-800 text-center">
          <button 
            onClick={onClose}
            className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
          >
            J'ai compris le workflow
          </button>
        </div>
      </div>
    </div>
  );
};
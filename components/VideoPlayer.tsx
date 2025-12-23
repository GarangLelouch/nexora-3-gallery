/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {Video} from '../types.ts';
import {PencilSquareIcon, XMarkIcon, PlusIcon} from './icons.tsx';

interface VideoPlayerProps {
  video: Video;
  onClose: () => void;
  onEdit: (video: Video) => void;
  onExtend: (video: Video) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  onClose,
  onEdit,
  onExtend,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center animate-fade-in backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog">
      <div
        className="bg-[#0f1115] border border-white/5 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-5xl relative overflow-hidden flex flex-col max-h-[95vh] m-4"
        onClick={(e) => e.stopPropagation()}>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white z-20 p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all border border-white/5"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="flex-shrink-0 p-4">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group">
            <video
              key={video.id}
              className="w-full h-full object-contain"
              src={video.videoUrl}
              controls
              autoPlay
              loop
            />
          </div>
        </div>

        <div className="flex-1 p-8 pt-2 overflow-y-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-black text-white">{video.title}</h2>
              <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-sm text-gray-400 leading-relaxed italic">
                  "{video.description}"
                </p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => onEdit(video)}
                className="flex items-center justify-center gap-3 bg-white text-black font-black py-4 px-8 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest shadow-lg shadow-white/5"
              >
                <PencilSquareIcon className="w-5 h-5" />
                Remixer le prompt
              </button>
              <button
                onClick={() => onExtend(video)}
                className="flex items-center justify-center gap-3 bg-purple-600/10 border border-purple-500/30 text-purple-400 font-black py-4 px-8 rounded-2xl transition-all hover:bg-purple-600/20 hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-widest"
              >
                <PlusIcon className="w-5 h-5" />
                Étendre la vidéo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {Video} from '../types.ts';
import {PlayIcon} from './icons.tsx';

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({video, onPlay}) => {
  return (
    <button
      type="button"
      className="group w-full text-left bg-gray-900/40 border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl hover:border-purple-500/30 transform transition-all duration-500 hover:-translate-y-2 cursor-pointer focus:outline-none"
      onClick={() => onPlay(video)}
      aria-label={`Lire la vidéo : ${video.title}`}>
      <div className="relative aspect-video">
        <video
          className="w-full h-full object-cover pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
          src={video.videoUrl}
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-sm">
          <PlayIcon className="w-12 h-12 text-white transform group-hover:scale-110 transition-transform" />
        </div>
        
        {video.duration && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-[8px] font-black text-white uppercase tracking-widest">
            {video.duration}
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xs font-black text-white uppercase tracking-widest truncate">
          {video.title}
        </h3>
        <p className="text-[10px] text-gray-600 mt-2 font-bold uppercase tracking-widest">Cinematic Engine v3.1</p>
      </div>
    </button>
  );
};

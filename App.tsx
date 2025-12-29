/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, useState, useEffect from 'react';
import StudioPage from './components/StudioPage.tsx';
import ErrorModal from './components/ErrorModal.tsx';
import InfoModal from './components/InfoModal.tsx';
import VideoCameraIcon, PlusIcon from './components/icons.tsx';
import SavingProgressPage from './components/SavingProgressPage.tsx';
import VideoGrid from './components/VideoGrid.tsx';
import VideoPlayer from './components/VideoPlayer.tsx';
import MOCK_VIDEOS from './constants.ts';
import Video, GenerationConfig from './types.ts';

import {GoogleGenAI} from '@google/genai';

const VEO3_FAST_MODEL = 'veo-3.1-fast-generate-preview';
const VEO3_QUALITY_MODEL = 'veo-3.1-generate-preview';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Logic to generate a single block (8s or 7s extension)
async function generateBlock(
  prompt: string,
  config: Partial<GenerationConfig>,
  isExtension: boolean
): Promise<{base64: string, videoObj: any}> {
  const modelName = config.model === 'quality' || !!config.extensionSourceVideo || !!config.referenceImage 
    ? VEO3_QUALITY_MODEL 
    : VEO3_FAST_MODEL;

  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

  const payload: any = {
    model: modelName,
    prompt: prompt || 'Cinematic visual sequence',
    config: {
      numberOfVideos: 1,
      aspectRatio: config.aspectRatio || '16:9',
      resolution: config.resolution || '720p',
    },
  };

  if (!isExtension && config.referenceImage) {
    payload.image = {
      imageBytes: config.referenceImage,
      mimeType: 'image/png',
    };
  }

  if (isExtension && config.extensionSourceVideo) {
    payload.video = config.extensionSourceVideo;
  }

  let operation = await ai.models.generateVideos(payload);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const generatedVideo = operation.response?.generatedVideos?.[0];
  const downloadLink = generatedVideo?.video?.uri;

  if (downloadLink) {
    const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const blob = await res.blob();
    const base64 = await blobToBase64(blob);
    return { base64, videoObj: generatedVideo.video };
  } else {
    throw new Error('No video URI returned from the model.');
  }
}

export const App: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>(MOCK_VIDEOS);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [inStudio, setInStudio] = useState(false);
  const [studioContext, setStudioContext] = useState<{video?: Video, isExtension?: boolean} | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState({current: 1, total: 1});
  const [showInfo, setShowInfo] = useState(false);
  const [generationError, setGenerationError] = useState<string[] | null>(null);
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // @ts-ignore
        if (window.aistudio?.hasSelectedApiKey) {
          // @ts-ignore
          const selected = await window.aistudio.hasSelectedApiKey();
          setHasKey(selected);
        } else {
          setHasKey(true);
        }
      } catch (e) {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSaveEdit = async (prompt: string, config: GenerationConfig) => {
    setInStudio(false);
    setIsSaving(true);
    setGenerationError(null);

    // Calculate how many extensions are needed
    // Base is 8s. Each extension is 7s.
    const numExtensions = Math.max(0, Math.ceil((config.targetDuration - 8) / 7));
    const totalSteps = 1 + numExtensions;
    setProgress({ current: 1, total: totalSteps });

    try {
      // Step 1: Initial Block
      let lastResult = await generateBlock(prompt, config, !!config.extensionSourceVideo);
      let currentMetadata = lastResult.videoObj;
      let finalBase64 = lastResult.base64;

      // Step 2: Loop Extensions if needed
      for (let i = 0; i < numExtensions; i++) {
        setProgress({ current: i + 2, total: totalSteps });
        // Use the same prompt but inform the model it is a continuation
        const extensionResult = await generateBlock(prompt, {
          ...config,
          extensionSourceVideo: currentMetadata,
          resolution: '720p' // Extensions must be 720p
        }, true);
        
        currentMetadata = extensionResult.videoObj;
        finalBase64 = extensionResult.base64; // In a real production app, we would concatenate files, but here we show the final completed segment
      }

      const newVideo: Video = {
        id: self.crypto.randomUUID(),
        title: config.targetDuration >= 60 ? 'Long Feature' : 'Cinematic Short',
        description: prompt,
        videoUrl: `data:video/mp4;base64,${finalBase64}`,
        duration: `${config.targetDuration}s`,
        aspectRatio: config.aspectRatio,
        rawMetadata: currentMetadata
      };

      setVideos((prev) => [newVideo, ...prev]);
      setPlayingVideo(newVideo);
    } catch (error: any) {
      console.error('Production Error:', error);
      setGenerationError(['Échec de rendu multi-segments.', error.message || 'Le pipeline a été interrompu.']);
    } finally {
      setIsSaving(false);
    }
  };

  if (hasKey === null) return <div className="min-h-screen bg-[#0b0c10]" />;
  if (hasKey === false) return <ApiKeyGate onAuth={() => setHasKey(true)} />;
  if (isSaving) return <SavingProgressPage currentSegment={progress.current} totalSegments={progress.total} />;

  return (
    <div className="min-h-screen bg-[#0b0c10] text-gray-100 font-sans selection:bg-purple-500/30">
      {inStudio ? (
        <StudioPage
          initialVideo={studioContext?.video}
          isExtension={studioContext?.isExtension}
          onSave={handleSaveEdit}
          onCancel={() => setInStudio(false)}
        />
      ) : (
        <div className="mx-auto max-w-[1600px] animate-fade-in">
          <header className="p-8 md:p-12 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start group cursor-default">
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-white to-gray-600 text-transparent bg-clip-text flex items-center gap-5 italic tracking-tighter">
                <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  <VideoCameraIcon className="w-8 h-8 text-white" />
                </div>
                NEXORA <span className="text-purple-500 font-serif">3</span>
              </h1>
              <p className="text-gray-600 mt-3 text-[10px] md:text-xs font-black tracking-[0.4em] uppercase opacity-70">
                Computational Cinema Engineering
              </p>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => { setStudioContext(null); setInStudio(true); }}
                className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-purple-500 hover:text-white transition-all shadow-[0_15px_40px_rgba(255,255,255,0.1)] active:scale-95 uppercase text-[10px] tracking-widest"
              >
                Nouveau Projet
              </button>
              <button 
                onClick={() => setShowInfo(true)} 
                className="w-12 h-12 flex items-center justify-center bg-gray-900 border border-white/5 rounded-2xl text-gray-500 hover:text-white hover:border-white/20 transition-all"
                title="Système"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              </button>
            </div>
          </header>
          <main className="p-8 md:p-12">
            <VideoGrid videos={videos} onPlayVideo={setPlayingVideo} />
          </main>
        </div>
      )}

      {playingVideo && (
        <VideoPlayer
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          onEdit={(v) => { setStudioContext({video: v, isExtension: false}); setInStudio(true); }}
          onExtend={(v) => { setStudioContext({video: v, isExtension: true}); setInStudio(true); }}
        />
      )}

      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
      {generationError && (
        <ErrorModal
          message={generationError}
          onClose={() => setGenerationError(null)}
          onSelectKey={async () => {
            // @ts-ignore
            if (window.aistudio?.openSelectKey) await window.aistudio.openSelectKey();
            setHasKey(true);
            setGenerationError(null);
          }}
        />
      )}
    </div>
  );
};

const ApiKeyGate: React.FC<{onAuth: () => void}> = ({onAuth}) => (
  <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6 text-center">
    <div className="max-w-md space-y-8 animate-fade-in bg-gray-900/40 p-10 rounded-[2.5rem] border border-white/5 backdrop-blur-2xl shadow-2xl">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-purple-600/20 rounded-full flex items-center justify-center border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)]">
          <VideoCameraIcon className="w-12 h-12 text-purple-400" />
        </div>
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Nexora <span className="text-purple-500">3</span></h1>
        <p className="text-gray-500 text-xs font-bold tracking-[0.2em] uppercase">Engine Activation Required</p>
      </div>
      <p className="text-gray-400 leading-relaxed text-sm font-light px-4">
        Accédez au laboratoire cinématique le plus avancé. Une clé API Google Cloud facturable est nécessaire pour les opérations Veo 3.1.
      </p>
      <div className="space-y-4 pt-6">
        <button
          onClick={async () => {
            try {
              // @ts-ignore
              if (window.aistudio?.openSelectKey) await window.aistudio.openSelectKey();
              onAuth();
            } catch (err) {
              onAuth();
            }
          }}
          className="w-full py-5 bg-white text-black font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl uppercase text-xs tracking-widest"
        >
          Sélectionner ma clé API
        </button>
      </div>
    </div>
  </div>
);

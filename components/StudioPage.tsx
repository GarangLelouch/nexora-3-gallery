/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState, useRef, useEffect} from 'react';
import {Video, GenerationConfig, ChatMessage} from '../types.ts';
import {ChatBubbleIcon, PlusIcon, XMarkIcon} from './icons.tsx';
import {GoogleGenAI} from '@google/genai';

interface StudioPageProps {
  initialVideo?: Video | null;
  isExtension?: boolean;
  onSave: (prompt: string, config: GenerationConfig) => void;
  onCancel: () => void;
}

const DURATIONS = [
  { label: '8s', value: 8 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '10m', value: 600 }
];

export const StudioPage: React.FC<StudioPageProps> = ({
  initialVideo,
  isExtension,
  onSave,
  onCancel,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {role: 'model', text: isExtension 
      ? `Mode Extension Activé : Je vais prolonger votre séquence. Choisissez la durée totale cible.`
      : initialVideo 
        ? `Mode Remix : Améliorons cette scène. Quelle durée visez-vous pour cette version ?` 
        : `Bienvenue dans le Studio. Quelle vision cinématique souhaitez-vous réaliser aujourd'hui ?`}
  ]);
  const [userInput, setUserInput] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(initialVideo?.description || '');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  const [config, setConfig] = useState<GenerationConfig>({
    model: isExtension ? 'quality' : 'fast',
    aspectRatio: initialVideo?.aspectRatio || '16:9',
    resolution: '720p',
    targetDuration: 8,
  });

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage((reader.result as string).split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const newMessages: ChatMessage[] = [...messages, {role: 'user', text: userInput}];
    setMessages(newMessages);
    setUserInput('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: "Tu es le Directeur Artistique Nexora. Aide l'utilisateur à créer des prompts cinématiques. Si l'utilisateur veut une vidéo longue, explique que tu vas générer plusieurs segments enchaînés. Format de réponse obligatoire : [PROMPT: texte].",
        }
      });

      const response = await chat.sendMessage({message: userInput});
      setMessages([...newMessages, {role: 'model', text: response.text || ""}]);

      const promptMatch = response.text?.match(/\[PROMPT:\s*(.*?)\]/i);
      if (promptMatch) setCurrentPrompt(promptMatch[1]);
    } catch (err) {
      setMessages([...newMessages, {role: 'model', text: "L'assistant est hors-ligne."}]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-gray-200 flex flex-col animate-fade-in overflow-hidden">
      <header className="h-24 border-b border-white/5 bg-[#0b0c10] flex items-center justify-between px-10 z-10">
        <div className="flex items-center gap-8">
          <button onClick={onCancel} className="text-[10px] font-black text-gray-500 hover:text-white transition-all uppercase tracking-[0.3em]">
            ← RETOUR
          </button>
          <div className="h-10 w-px bg-white/5"></div>
          <h2 className="text-sm font-black text-white flex items-center gap-4 uppercase tracking-[0.3em]">
            Studio Nexora v3.1
          </h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
             <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Cible temporelle :</span>
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                {DURATIONS.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setConfig({...config, targetDuration: d.value})}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                      config.targetDuration === d.value ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-gray-500 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-96px)] overflow-hidden">
        {/* Assistant Chat */}
        <div className="w-full lg:w-[420px] border-r border-white/5 flex flex-col bg-[#0b0c10]">
          <div className="p-6 border-b border-white/5 flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] bg-white/[0.02]">
            Conseiller de Production
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] rounded-3xl px-6 py-4 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white shadow-xl shadow-purple-900/20' 
                    : 'bg-[#12141a] text-gray-300 border border-white/5'
                }`}>
                  {msg.text.replace(/\[PROMPT:.*?\]/gi, '').trim()}
                </div>
              </div>
            ))}
            {isTyping && <div className="flex gap-2 p-2 opacity-50"><div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce"></div><div className="w-1 h-1 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div></div>}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChat} className="p-8 border-t border-white/5 bg-[#0f1115]">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ex: Fais une scène de 1 minute..."
              className="w-full bg-[#07080a] border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </form>
        </div>

        {/* Main View */}
        <div className="flex-1 p-10 flex flex-col items-center justify-center bg-[#07080a] overflow-y-auto no-scrollbar">
          <div className="w-full max-w-4xl space-y-8">
             <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative">
                {initialVideo ? (
                  <video src={initialVideo.videoUrl} className="w-full h-full object-contain" controls />
                ) : referenceImage ? (
                  <img src={`data:image/png;base64,${referenceImage}`} className="w-full h-full object-cover opacity-50" />
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center text-gray-700 p-12 cursor-pointer hover:bg-white/[0.01] transition-all">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <PlusIcon className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Scène visuelle de départ</p>
                  </label>
                )}
             </div>

             <div className="w-full space-y-3">
                <textarea
                  value={currentPrompt}
                  onChange={(e) => setCurrentPrompt(e.target.value)}
                  className="w-full bg-[#0b0c10] border border-white/5 rounded-[1.5rem] p-8 text-sm text-gray-200 focus:outline-none focus:border-purple-500/30 transition-all resize-none h-40 leading-relaxed"
                  placeholder="Décrivez votre vision épique..."
                />
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[380px] border-l border-white/5 bg-[#0b0c10] flex flex-col p-8 space-y-10">
           <div className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] border-b border-white/5 pb-4">Specs Cinéma</div>
           
           <div className="space-y-8">
              <div className="bg-purple-600/5 border border-purple-500/10 p-5 rounded-2xl">
                <h4 className="text-purple-400 text-[10px] font-black uppercase mb-2">Note sur la durée</h4>
                <p className="text-[9px] text-gray-500 leading-relaxed italic">
                  Pour les vidéos longues ({config.targetDuration}s), Nexora va générer {Math.ceil((config.targetDuration - 8) / 7) + 1} segments consécutifs. Cela peut prendre quelques minutes.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Moteur</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['fast', 'quality'] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setConfig({...config, model: m})}
                      className={`py-3 rounded-xl text-[9px] font-black border transition-all uppercase tracking-widest ${
                        config.model === m ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-gray-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Format d'image</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['16:9', '9:16'] as const).map(ar => (
                    <button
                      key={ar}
                      onClick={() => setConfig({...config, aspectRatio: ar})}
                      className={`py-3 rounded-xl text-[9px] font-black border transition-all uppercase tracking-widest ${
                        config.aspectRatio === ar ? 'bg-purple-600 border-purple-500 text-white' : 'bg-transparent border-white/10 text-gray-600'
                      }`}
                    >
                      {ar}
                    </button>
                  ))}
                </div>
              </div>
           </div>

           <div className="pt-6 mt-auto">
              <button
                onClick={() => onSave(currentPrompt, {
                  ...config, 
                  referenceImage: referenceImage || undefined,
                  extensionSourceVideo: isExtension ? initialVideo?.rawMetadata : undefined
                })}
                disabled={!currentPrompt.trim()}
                className="w-full py-6 rounded-2xl bg-purple-600 text-white font-black text-[10px] tracking-[0.3em] shadow-2xl disabled:opacity-20 transition-all uppercase hover:scale-[1.02] active:scale-95"
              >
                Générer {config.targetDuration} secondes
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Asset, Clip, Track, TrackType } from './types';
import Sidebar from './components/Editor/Sidebar';
import Player from './components/Editor/Player';
import Timeline from './components/Editor/Timeline';
import Inspector from './components/Editor/Inspector';
import Modal from './components/UI/Modal';
import { generateStoryboard } from './services/geminiService';
import { Wand2, Play, Download } from 'lucide-react';

const INITIAL_TRACKS: Track[] = [
  { id: 't1', type: TrackType.TEXT, name: 'Text Layer', isMuted: false, isHidden: false },
  { id: 't2', type: TrackType.VIDEO, name: 'Video Track Main', isMuted: false, isHidden: false },
  { id: 't3', type: TrackType.AUDIO, name: 'Background Music', isMuted: false, isHidden: false },
];

export default function App() {
  // Project State
  const [tracks] = useState<Track[]>(INITIAL_TRACKS);
  const [clips, setClips] = useState<Clip[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(40); // Pixels per second
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

  // UI State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  // Playback Loop
  useEffect(() => {
    if (isPlaying) {
      lastTimeRef.current = performance.now();
      const loop = (time: number) => {
        const delta = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;
        setCurrentTime(prev => {
           const next = prev + delta;
           if (next > 30) { // Loop at 30s for demo
               setIsPlaying(false);
               return 0;
           }
           return next;
        });
        animationRef.current = requestAnimationFrame(loop);
      };
      animationRef.current = requestAnimationFrame(loop);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  // Handlers
  const handleAddAsset = (asset: Asset) => {
    const track = tracks.find(t => t.type === (asset.type === 'video' || asset.type === 'image' ? TrackType.VIDEO : TrackType.AUDIO));
    if (!track) return;

    const newClip: Clip = {
      id: Math.random().toString(36).substr(2, 9),
      trackId: track.id,
      type: track.type,
      name: asset.name,
      startTime: currentTime,
      duration: asset.type === 'image' ? 3 : 5, // Default duration
      offset: 0,
      content: asset.url,
      properties: { opacity: 1, scale: 1, x: 50, y: 50 }
    };

    setClips(prev => [...prev, newClip]);
  };

  const handleAddText = (text: string) => {
      const track = tracks.find(t => t.type === TrackType.TEXT);
      if(!track) return;

      const newClip: Clip = {
          id: Math.random().toString(36).substr(2, 9),
          trackId: track.id,
          type: TrackType.TEXT,
          name: text.substring(0, 10),
          startTime: currentTime,
          duration: 3,
          offset: 0,
          content: text,
          properties: { opacity: 1, scale: 1, fontSize: 48, color: '#ffffff' }
      };
      setClips(prev => [...prev, newClip]);
  };

  const handleUpdateClip = (id: string, updates: Partial<Clip>) => {
      setClips(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handleDeleteClip = (id: string) => {
      setClips(prev => prev.filter(c => c.id !== id));
      if(selectedClipId === id) setSelectedClipId(null);
  };

  const handleAiGenerate = async () => {
      if(!aiPrompt) return;
      setIsGenerating(true);
      
      const storyboard = await generateStoryboard(aiPrompt);
      
      // Clear existing? Maybe. For now, just append.
      const newClips: Clip[] = [];
      let timeCursor = 0;

      const videoTrack = tracks.find(t => t.type === TrackType.VIDEO);
      const textTrack = tracks.find(t => t.type === TrackType.TEXT);

      if(videoTrack && textTrack) {
          storyboard.forEach((seg, idx) => {
              // Placeholder Video Clip
              newClips.push({
                  id: `ai-vid-${idx}-${Date.now()}`,
                  trackId: videoTrack.id,
                  type: TrackType.VIDEO,
                  name: `Scene ${idx + 1}`,
                  startTime: timeCursor,
                  duration: seg.duration,
                  offset: 0,
                  content: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Fallback placeholder video
                  properties: { opacity: 1, scale: 1 }
              });

              // Placeholder Text Clip
              newClips.push({
                  id: `ai-txt-${idx}-${Date.now()}`,
                  trackId: textTrack.id,
                  type: TrackType.TEXT,
                  name: 'Overlay',
                  startTime: timeCursor,
                  duration: seg.duration,
                  offset: 0,
                  content: seg.suggestedText,
                  properties: { 
                      opacity: 1, 
                      scale: 1, 
                      fontSize: 40, 
                      y: 80, // Bottom text
                      color: '#ffffff' 
                    }
              });

              timeCursor += seg.duration;
          });
      }

      setClips(newClips); // Replace for now to show full generated state
      setIsGenerating(false);
      setIsAiModalOpen(false);
      setCurrentTime(0);
  };

  const selectedClip = clips.find(c => c.id === selectedClipId) || null;

  return (
    <div className="flex flex-col h-screen bg-black text-white font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 flex-shrink-0">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Play size={16} fill="white" className="ml-1" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">GemCut</h1>
            <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">BETA</span>
         </div>
         
         <div className="flex items-center gap-4">
             <div className="text-xs text-zinc-500">Untitled Project</div>
             <button className="bg-editor-accent hover:bg-editor-accentHover text-black px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2 transition">
                <Download size={14} /> Export
             </button>
         </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
            onAddAsset={handleAddAsset} 
            onAddText={handleAddText}
            onOpenAI={() => setIsAiModalOpen(true)}
        />
        
        <div className="flex flex-col flex-1 min-w-0">
            {/* Top Section: Player (Center) */}
            <div className="flex-1 bg-zinc-950 flex relative">
                <div className="flex-1 p-4 flex items-center justify-center">
                    <div className="aspect-video w-full max-w-4xl bg-black shadow-2xl rounded-lg overflow-hidden border border-zinc-800 ring-1 ring-black">
                        <Player 
                            clips={clips} 
                            currentTime={currentTime}
                            isPlaying={isPlaying}
                            onTogglePlay={() => setIsPlaying(!isPlaying)}
                            onSeek={setCurrentTime}
                        />
                    </div>
                </div>
                {/* Inspector Panel */}
                <Inspector 
                    clip={selectedClip}
                    onUpdate={handleUpdateClip}
                    onDelete={handleDeleteClip}
                />
            </div>

            {/* Bottom Section: Timeline */}
            <div className="h-[300px] flex-shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <Timeline 
                    tracks={tracks}
                    clips={clips}
                    currentTime={currentTime}
                    duration={30} // Canvas duration
                    zoom={zoom}
                    onSeek={setCurrentTime}
                    onSelectClip={setSelectedClipId}
                    selectedClipId={selectedClipId}
                />
            </div>
        </div>
      </div>

      {/* AI Modal */}
      <Modal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)}
        title="AI Magic Storyboard"
      >
          <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                  Describe your video idea, and Gemini will generate a complete timeline structure with scenes, durations, and captions.
              </p>
              <textarea 
                className="w-full h-32 bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-600 focus:ring-2 focus:ring-editor-accent focus:border-transparent outline-none resize-none"
                placeholder="e.g. A 30-second energetic vlog intro about traveling to Tokyo, featuring street food and neon lights."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              />
              
              <div className="flex justify-end gap-2 pt-2">
                  <button 
                    onClick={() => setIsAiModalOpen(false)}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
                  >
                      Cancel
                  </button>
                  <button 
                    onClick={handleAiGenerate}
                    disabled={!aiPrompt || isGenerating}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                      {isGenerating ? (
                          <>
                             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                             Dreaming...
                          </>
                      ) : (
                          <>
                            <Wand2 size={16} /> Generate Project
                          </>
                      )}
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
}

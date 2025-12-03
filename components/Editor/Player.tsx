import React, { useRef, useEffect, useState } from 'react';
import { Clip, TrackType } from '../../types';
import { Play, Pause, SkipBack, SkipForward } from '../UI/Icons';

interface PlayerProps {
  clips: Clip[];
  currentTime: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void; // Not used by video player specifically to drive state, but for controls
}

const Player: React.FC<PlayerProps> = ({ clips, currentTime, isPlaying, onTogglePlay }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeVideoClip, setActiveVideoClip] = useState<Clip | null>(null);
  
  // Find active clips at current time
  const visibleClips = clips.filter(
    clip => currentTime >= clip.startTime && currentTime < (clip.startTime + clip.duration)
  );

  const videoClip = visibleClips.find(c => c.type === TrackType.VIDEO);
  const textClips = visibleClips.filter(c => c.type === TrackType.TEXT);

  // Sync Video Element
  useEffect(() => {
    if (videoClip) {
      setActiveVideoClip(videoClip);
      if (videoRef.current) {
        // Calculate relative time within the clip
        const clipRelativeTime = currentTime - videoClip.startTime + videoClip.offset;
        
        // Only update if significant drift to avoid stutter
        if (Math.abs(videoRef.current.currentTime - clipRelativeTime) > 0.3) {
            videoRef.current.currentTime = clipRelativeTime;
        }
      }
    } else {
       // No video clip, maybe show black or hold last frame? 
       // For simple implementation, we might just not update or hide video.
    }
  }, [currentTime, videoClip]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && videoClip) {
        videoRef.current.play().catch(() => {/* ignore autoplay policy */});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, videoClip]);


  return (
    <div className="flex flex-col h-full bg-black relative group">
      {/* Viewport */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {activeVideoClip ? (
           <video
             ref={videoRef}
             src={activeVideoClip.content}
             className="max-w-full max-h-full object-contain"
             muted // Muted for auto-play simplicity in demo
           />
        ) : (
            <div className="text-zinc-600 flex flex-col items-center">
                <div className="text-4xl font-bold opacity-20">NO SIGNAL</div>
                <p className="text-sm opacity-40 mt-2">Drag a video to the timeline</p>
            </div>
        )}

        {/* Overlays Layer */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {textClips.map(clip => (
            <div
              key={clip.id}
              className="absolute flex items-center justify-center text-center whitespace-pre-wrap"
              style={{
                left: `${clip.properties.x || 50}%`,
                top: `${clip.properties.y || 50}%`,
                transform: `translate(-50%, -50%) scale(${clip.properties.scale || 1})`,
                opacity: clip.properties.opacity ?? 1,
                color: clip.properties.color || 'white',
                fontSize: `${clip.properties.fontSize || 48}px`,
                textShadow: '0px 2px 4px rgba(0,0,0,0.8)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '800'
              }}
            >
              {clip.content}
            </div>
          ))}
        </div>
      </div>

      {/* Player Controls */}
      <div className="h-12 bg-editor-panel border-t border-editor-border flex items-center justify-center gap-4 px-4">
         <button className="text-zinc-400 hover:text-white" onClick={() => {/* prev frame */}}>
             <SkipBack size={18} />
         </button>
         <button 
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-zinc-200 transition"
            onClick={onTogglePlay}
         >
             {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
         </button>
         <button className="text-zinc-400 hover:text-white">
             <SkipForward size={18} />
         </button>
         
         <div className="absolute right-4 text-xs font-mono text-zinc-400">
             {new Date(currentTime * 1000).toISOString().substr(14, 5)} / 00:30
         </div>
      </div>
    </div>
  );
};

export default Player;
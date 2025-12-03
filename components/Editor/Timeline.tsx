import React, { useRef, useEffect } from 'react';
import { Clip, Track, TrackType } from '../../types';
import { Video, Type, Music } from '../UI/Icons';

interface TimelineProps {
  tracks: Track[];
  clips: Clip[];
  currentTime: number;
  duration: number;
  zoom: number;
  onSeek: (time: number) => void;
  onSelectClip: (id: string) => void;
  selectedClipId: string | null;
}

const TIMELINE_HEADER_HEIGHT = 32;
const TRACK_HEIGHT = 64;

const Timeline: React.FC<TimelineProps> = ({
  tracks,
  clips,
  currentTime,
  duration,
  zoom,
  onSeek,
  onSelectClip,
  selectedClipId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - 200; // 200px sidebar width
      const newTime = Math.max(0, offsetX / zoom);
      onSeek(newTime);
    }
  };

  // Generate time markers
  const markers = [];
  const step = zoom < 20 ? 5 : 1; // 5 seconds or 1 second based on zoom
  for (let i = 0; i <= Math.max(duration, 60); i += step) {
    markers.push(
      <div key={i} className="absolute top-0 h-2 border-l border-zinc-600 text-[10px] text-zinc-500 pl-1 select-none" style={{ left: i * zoom }}>
        {i}s
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-editor-bg border-t border-editor-border select-none">
      {/* Timeline Toolbar / Ruler */}
      <div className="flex h-8 border-b border-editor-border bg-editor-panel relative">
        <div className="w-[200px] flex-shrink-0 border-r border-editor-border flex items-center px-4 text-xs text-zinc-400 font-medium">
          Tracks
        </div>
        <div 
          className="flex-1 relative overflow-hidden cursor-pointer"
          ref={containerRef}
          onClick={handleTimelineClick}
        >
          {markers}
          {/* Playhead Indicator Triangle */}
          <div 
            className="absolute top-0 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-editor-accent transform -translate-x-1/2 pointer-events-none z-20"
            style={{ left: currentTime * zoom }}
          />
        </div>
      </div>

      {/* Scrollable Tracks Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex relative">
        {/* Track Headers (Left Sidebar of Timeline) */}
        <div className="w-[200px] flex-shrink-0 bg-editor-panel border-r border-editor-border z-10">
          {tracks.map(track => (
            <div key={track.id} className="h-16 border-b border-editor-border flex items-center px-4 gap-3 text-sm text-zinc-300">
              {track.type === TrackType.VIDEO && <Video size={16} className="text-blue-400" />}
              {track.type === TrackType.TEXT && <Type size={16} className="text-green-400" />}
              {track.type === TrackType.AUDIO && <Music size={16} className="text-orange-400" />}
              <span className="truncate">{track.name}</span>
            </div>
          ))}
        </div>

        {/* Track Lanes */}
        <div className="flex-1 relative min-w-0 bg-zinc-950/50" onClick={handleTimelineClick}>
           {/* Current Time Vertical Line */}
           <div 
            className="absolute top-0 bottom-0 w-px bg-editor-accent z-20 pointer-events-none"
            style={{ left: currentTime * zoom }}
          />

          {tracks.map(track => (
            <div key={track.id} className="h-16 border-b border-editor-border relative w-[2000px]"> 
              {/* Background grid lines could go here */}
              
              {clips.filter(c => c.trackId === track.id).map(clip => (
                <div
                  key={clip.id}
                  onClick={(e) => { e.stopPropagation(); onSelectClip(clip.id); }}
                  className={`absolute h-12 top-2 rounded-md border cursor-pointer overflow-hidden group
                    ${selectedClipId === clip.id ? 'border-editor-accent ring-1 ring-editor-accent z-10' : 'border-zinc-700 hover:border-zinc-500'}
                    ${track.type === TrackType.VIDEO ? 'bg-blue-900/30' : ''}
                    ${track.type === TrackType.TEXT ? 'bg-green-900/30' : ''}
                    ${track.type === TrackType.AUDIO ? 'bg-orange-900/30' : ''}
                  `}
                  style={{
                    left: clip.startTime * zoom,
                    width: clip.duration * zoom,
                  }}
                >
                  {/* Clip Content Preview */}
                  <div className="w-full h-full flex items-center px-2 text-xs text-zinc-200 whitespace-nowrap overflow-hidden">
                    {track.type === TrackType.VIDEO && (
                      <div className="flex gap-1 opacity-50 w-full">
                         {/* Simulated frames strip */}
                         <div className="w-4 h-8 bg-zinc-800 rounded"></div>
                         <div className="w-4 h-8 bg-zinc-800 rounded"></div>
                         <div className="w-4 h-8 bg-zinc-800 rounded"></div>
                      </div>
                    )}
                    <span className="ml-2 drop-shadow-md font-medium truncate">{clip.name}</span>
                  </div>

                  {/* Drag handles (Simulated) */}
                  <div className="absolute left-0 top-0 bottom-0 w-2 hover:bg-white/20 cursor-w-resize"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-2 hover:bg-white/20 cursor-e-resize"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
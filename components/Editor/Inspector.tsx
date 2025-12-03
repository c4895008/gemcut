import React, { useState } from 'react';
import { Clip, TrackType } from '../../types';
import { Trash2, Wand2 } from '../UI/Icons';
import { refineText } from '../../services/geminiService';

interface InspectorProps {
  clip: Clip | null;
  onUpdate: (id: string, updates: Partial<Clip>) => void;
  onDelete: (id: string) => void;
}

const Inspector: React.FC<InspectorProps> = ({ clip, onUpdate, onDelete }) => {
  const [isThinking, setIsThinking] = useState(false);

  if (!clip) {
    return (
      <div className="w-[250px] bg-editor-panel border-l border-editor-border p-6 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-zinc-800 mb-4 flex items-center justify-center">
            <div className="w-2 h-2 bg-zinc-600 rounded-full" />
        </div>
        <p className="text-sm text-zinc-500">Select a clip to edit properties</p>
      </div>
    );
  }

  const handlePropChange = (key: string, value: any) => {
      onUpdate(clip.id, { 
          properties: { ...clip.properties, [key]: value } 
      });
  };

  const handleMagicRewrite = async (style: string) => {
      setIsThinking(true);
      const newText = await refineText(clip.content, style);
      onUpdate(clip.id, { content: newText });
      setIsThinking(false);
  };

  return (
    <div className="w-[250px] bg-editor-panel border-l border-editor-border flex flex-col h-full overflow-y-auto">
      <div className="h-12 border-b border-editor-border flex items-center px-4 font-medium text-sm">
        {clip.type} Properties
      </div>

      <div className="p-4 space-y-6">
          {/* Common Properties */}
          <div className="space-y-2">
              <label className="text-xs text-zinc-400">Scale ({((clip.properties.scale || 1) * 100).toFixed(0)}%)</label>
              <input 
                type="range" min="0.1" max="3" step="0.1"
                value={clip.properties.scale || 1}
                onChange={(e) => handlePropChange('scale', parseFloat(e.target.value))}
                className="w-full accent-editor-accent h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
          </div>

          <div className="space-y-2">
              <label className="text-xs text-zinc-400">Opacity ({((clip.properties.opacity ?? 1) * 100).toFixed(0)}%)</label>
              <input 
                type="range" min="0" max="1" step="0.1"
                value={clip.properties.opacity ?? 1}
                onChange={(e) => handlePropChange('opacity', parseFloat(e.target.value))}
                className="w-full accent-editor-accent h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
          </div>

          {/* Text Specific */}
          {clip.type === TrackType.TEXT && (
              <>
                <div className="space-y-2">
                    <label className="text-xs text-zinc-400">Content</label>
                    <textarea 
                        value={clip.content}
                        onChange={(e) => onUpdate(clip.id, { content: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:ring-1 focus:ring-editor-accent outline-none"
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-zinc-400">AI Actions</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            disabled={isThinking}
                            onClick={() => handleMagicRewrite('funny')}
                            className="px-3 py-2 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 rounded text-xs font-medium flex items-center justify-center gap-1 border border-indigo-600/20 transition"
                        >
                            {isThinking ? '...' : <><Wand2 size={12} /> Funny</>}
                        </button>
                        <button 
                            disabled={isThinking}
                            onClick={() => handleMagicRewrite('professional')}
                            className="px-3 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 rounded text-xs font-medium flex items-center justify-center gap-1 border border-emerald-600/20 transition"
                        >
                             {isThinking ? '...' : <><Wand2 size={12} /> Formal</>}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                     <label className="text-xs text-zinc-400">Color</label>
                     <div className="flex gap-2">
                        {['#ffffff', '#ef4444', '#facc15', '#4ade80', '#3b82f6', '#a855f7'].map(c => (
                            <button 
                                key={c}
                                onClick={() => handlePropChange('color', c)}
                                className={`w-6 h-6 rounded-full border ${clip.properties.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                     </div>
                </div>
              </>
          )}

          <div className="pt-4 border-t border-zinc-800">
            <button 
                onClick={() => onDelete(clip.id)}
                className="w-full py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-sm font-medium flex items-center justify-center gap-2 transition"
            >
                <Trash2 size={14} /> Delete Clip
            </button>
          </div>
      </div>
    </div>
  );
};

export default Inspector;
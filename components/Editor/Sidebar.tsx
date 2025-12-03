import React, { useState } from 'react';
import { Asset, MOCK_ASSETS } from '../../types';
import { ImageIcon, Video, Sparkles, Type, Plus } from '../UI/Icons';

interface SidebarProps {
  onAddAsset: (asset: Asset) => void;
  onAddText: (text: string) => void;
  onOpenAI: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddAsset, onAddText, onOpenAI }) => {
  const [activeTab, setActiveTab] = useState<'media' | 'text' | 'ai'>('media');

  return (
    <div className="w-[300px] bg-editor-panel border-r border-editor-border flex flex-col h-full">
      {/* Tabs */}
      <div className="flex h-12 border-b border-editor-border">
        <button 
            onClick={() => setActiveTab('media')}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'media' ? 'text-editor-accent border-b-2 border-editor-accent' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
            <Video size={16} /> Media
        </button>
        <button 
            onClick={() => setActiveTab('text')}
            className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${activeTab === 'text' ? 'text-editor-accent border-b-2 border-editor-accent' : 'text-zinc-400 hover:text-zinc-200'}`}
        >
            <Type size={16} /> Text
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        
        {activeTab === 'media' && (
          <div className="grid grid-cols-2 gap-3">
             {MOCK_ASSETS.map(asset => (
                 <div 
                    key={asset.id} 
                    className="aspect-video bg-zinc-800 rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-editor-accent group relative"
                    onClick={() => onAddAsset(asset)}
                 >
                     {asset.type === 'video' ? (
                         <video src={asset.url} className="w-full h-full object-cover" />
                     ) : (
                         <img src={asset.url} className="w-full h-full object-cover" />
                     )}
                     <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="text-white" />
                     </div>
                     <div className="absolute bottom-1 left-1 text-[10px] text-white bg-black/50 px-1 rounded truncate max-w-[90%]">
                         {asset.name}
                     </div>
                 </div>
             ))}
             
             <div className="col-span-2 border-2 border-dashed border-zinc-700 rounded-lg h-24 flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 cursor-pointer transition">
                 <span className="text-xs">Import Local File</span>
             </div>
          </div>
        )}

        {activeTab === 'text' && (
            <div className="space-y-3">
                <button 
                    onClick={() => onAddText("Default Text")}
                    className="w-full h-16 bg-zinc-800 rounded-md flex items-center justify-center hover:bg-zinc-700 border border-zinc-700"
                >
                    <span className="text-xl font-bold text-white">Default Text</span>
                </button>
                <button 
                    onClick={() => onAddText("NEON TITLE")}
                    className="w-full h-16 bg-zinc-900 rounded-md flex items-center justify-center hover:bg-black border border-editor-accent shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                >
                    <span className="text-2xl font-black text-editor-accent" style={{ textShadow: '0 0 5px cyan' }}>NEON</span>
                </button>
            </div>
        )}
      </div>

      {/* AI Promo Section (Always visible at bottom or separate tab) */}
      <div className="p-4 border-t border-editor-border bg-gradient-to-b from-editor-panel to-zinc-900">
          <button 
            onClick={onOpenAI}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
              <Sparkles size={18} />
              AI Magic Create
          </button>
          <p className="text-[10px] text-zinc-500 text-center mt-2">Powered by Gemini 2.5</p>
      </div>
    </div>
  );
};

export default Sidebar;
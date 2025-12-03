export enum TrackType {
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  TEXT = 'TEXT',
  OVERLAY = 'OVERLAY'
}

export interface Clip {
  id: string;
  trackId: string;
  type: TrackType;
  name: string;
  startTime: number; // In seconds (position on timeline)
  duration: number; // In seconds
  offset: number; // Start time within the source media
  content: string; // URL for media, or text content for text layers
  properties: {
    opacity?: number;
    scale?: number;
    x?: number;
    y?: number;
    color?: string;
    fontSize?: number;
    backgroundColor?: string;
  };
}

export interface Track {
  id: string;
  type: TrackType;
  name: string;
  isMuted: boolean;
  isHidden: boolean;
}

export interface ProjectState {
  tracks: Track[];
  clips: Clip[];
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  zoom: number; // Pixels per second
  selectedClipId: string | null;
}

export interface Asset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
}

export const MOCK_ASSETS: Asset[] = [
  { id: '1', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', name: 'Big Buck Bunny' },
  { id: '2', type: 'video', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', name: 'Elephants Dream' },
  { id: '3', type: 'image', url: 'https://picsum.photos/800/450', name: 'Random Landscape' },
  { id: '4', type: 'image', url: 'https://picsum.photos/800/451', name: 'Cityscape' },
];

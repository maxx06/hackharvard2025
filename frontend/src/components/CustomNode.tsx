import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface CustomNodeData {
  label: string;
  type?: 'bassline' | 'drum' | 'melody' | 'genre' | 'chord' | 'vocal' | 'fx' | 'synth';
  key?: string;
  bpm?: number;
}

const CustomNode = ({ data }: NodeProps<CustomNodeData>) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'bassline':
        return { bg: 'bg-purple-600', icon: '🎸' };
      case 'drum':
        return { bg: 'bg-red-500', icon: '🥁' };
      case 'melody':
        return { bg: 'bg-blue-500', icon: '🎹' };
      case 'genre':
        return { bg: 'bg-pink-500', icon: '🎵' };
      case 'chord':
        return { bg: 'bg-indigo-500', icon: '🎼' };
      case 'vocal':
        return { bg: 'bg-green-500', icon: '🎤' };
      case 'fx':
        return { bg: 'bg-orange-500', icon: '✨' };
      case 'synth':
        return { bg: 'bg-cyan-500', icon: '🎛️' };
      default:
        return { bg: 'bg-gray-500', icon: '🔊' };
    }
  };

  const style = getNodeStyle();

  return (
    <div className={`px-4 py-2 shadow-md rounded-md border-2 border-white ${style.bg} text-white min-w-[140px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex flex-col items-center">
        <div className="text-lg mb-1">{style.icon}</div>
        <div className="text-sm font-bold text-center">{data.label}</div>
        <div className="flex gap-2 mt-1 text-xs opacity-90">
          {data.type && <span className="capitalize">{data.type}</span>}
          {data.key && <span>• {data.key}</span>}
          {data.bpm && <span>• {data.bpm} BPM</span>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default memo(CustomNode);

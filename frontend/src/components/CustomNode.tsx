import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface CustomNodeData {
  label: string;
  type?: 'bassline' | 'drum' | 'melody' | 'genre' | 'chord' | 'vocal' | 'fx' | 'synth' | 'section';
  key?: string;
  bpm?: number;
  section?: string;
  isSection?: boolean;
}

const CustomNode = ({ data }: NodeProps<CustomNodeData>) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'section':
        return { bg: 'bg-purple-700', icon: '', border: 'border-4 border-purple-400', ring: 'ring-4 ring-purple-400/30', textSize: 'text-base', padding: 'px-6 py-3' };
      case 'bassline':
        return { bg: 'bg-purple-600', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      case 'drum':
        return { bg: 'bg-red-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      case 'melody':
        return { bg: 'bg-blue-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      case 'genre':
        return { bg: 'bg-pink-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      case 'chord':
        return { bg: 'bg-indigo-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      case 'vocal':
        return { bg: 'bg-green-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      case 'fx':
        return { bg: 'bg-orange-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      case 'synth':
        return { bg: 'bg-cyan-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
      default:
        return { bg: 'bg-gray-500', icon: '', border: 'border-2 border-white', ring: '', textSize: 'text-sm', padding: 'px-4 py-2' };
    }
  };

  const style = getNodeStyle();

  return (
    <div className={`shadow-md rounded-md ${style.border} ${style.ring} ${style.bg} text-white min-w-[140px] ${style.padding}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex flex-col items-center">
        {style.icon && <div className="text-lg mb-1">{style.icon}</div>}
        <div className={`${style.textSize} font-bold text-center`}>{data.label}</div>
        {data.type !== 'section' && (
          <div className="flex gap-2 mt-1 text-xs opacity-90">
            {data.type && <span className="capitalize">{data.type}</span>}
            {data.key && <span>• {data.key}</span>}
            {data.bpm && <span>• {data.bpm} BPM</span>}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default memo(CustomNode);

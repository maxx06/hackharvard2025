import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Mic, Music, Guitar, Drum, Sparkles, Activity, Radio, Layers } from 'lucide-react';

export interface CustomNodeData {
  label: string;
  type?: 'bassline' | 'drum' | 'melody' | 'genre' | 'chord' | 'vocal' | 'fx' | 'synth' | 'section';
  key?: string;
  bpm?: number;
  section?: string;
  isSection?: boolean;
  details?: string;
}

const CustomNode = ({ data }: NodeProps<CustomNodeData>) => {
  const getNodeStyle = () => {
    switch (data.type) {
      case 'section':
        return {
          icon: <Layers className="w-6 h-6" />,
          iconBg: 'bg-blue-500/20',
          textSize: 'text-lg',
          padding: 'px-8 py-4'
        };
      case 'vocal':
        return {
          icon: <Mic className="w-5 h-5" />,
          iconBg: 'bg-cyan-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
      case 'bassline':
        return {
          icon: <Activity className="w-5 h-5" />,
          iconBg: 'bg-blue-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
      case 'drum':
        return {
          icon: <Drum className="w-5 h-5" />,
          iconBg: 'bg-red-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
      case 'melody':
        return {
          icon: <Music className="w-5 h-5" />,
          iconBg: 'bg-blue-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
      case 'synth':
        return {
          icon: <Radio className="w-5 h-5" />,
          iconBg: 'bg-cyan-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
      case 'chord':
        return {
          icon: <Guitar className="w-5 h-5" />,
          iconBg: 'bg-indigo-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
      case 'fx':
        return {
          icon: <Sparkles className="w-5 h-5" />,
          iconBg: 'bg-orange-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
      default:
        return {
          icon: <Music className="w-5 h-5" />,
          iconBg: 'bg-gray-500/20',
          textSize: 'text-base',
          padding: 'px-6 py-3'
        };
    }
  };

  const style = getNodeStyle();

  return (
    <div className="bg-gradient-to-br from-black via-blue-950 to-blue-900 backdrop-blur-sm border border-cyan-400/50 rounded-2xl shadow-xl text-white min-w-[180px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-cyan-400" />
      <div className={`flex flex-col items-center gap-3 ${style.padding}`}>
        <div className={`${style.iconBg} rounded-full p-3`}>
          {style.icon}
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className={`${style.textSize} font-semibold text-center`}>{data.label}</div>
          {data.details && (
            <div className="text-xs text-cyan-200/70 italic text-center max-w-[160px]">
              {data.details}
            </div>
          )}
          {data.type !== 'section' && (data.key || data.bpm) && (
            <div className="flex gap-2 mt-1 text-xs text-cyan-200/60">
              {data.key && <span>{data.key}</span>}
              {data.key && data.bpm && <span>•</span>}
              {data.bpm && <span>{data.bpm} BPM</span>}
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-cyan-400" />
    </div>
  );
};

export default memo(CustomNode);

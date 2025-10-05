'use client';

import React, { useState } from 'react';
import { CustomNodeData } from './CustomNode';

interface GraphControlsProps {
  onAddNode: (label: string, type: CustomNodeData['type'], key?: string, bpm?: number) => void;
  onClearGraph: () => void;
}

const nodeTypes: { value: CustomNodeData['type']; label: string; icon: string }[] = [
  { value: 'section', label: 'Section', icon: '📍' },
  { value: 'bassline', label: 'Bassline', icon: '🎸' },
  { value: 'drum', label: 'Drum', icon: '🥁' },
  { value: 'melody', label: 'Melody', icon: '🎵' },
  { value: 'genre', label: 'Genre', icon: '🎭' },
  { value: 'chord', label: 'Chord', icon: '🎹' },
  { value: 'vocal', label: 'Vocal', icon: '🎤' },
  { value: 'fx', label: 'FX', icon: '✨' },
  { value: 'synth', label: 'Synth', icon: '🎛️' },
];

const GraphControls = ({ onAddNode, onClearGraph }: GraphControlsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<CustomNodeData['type']>('melody');
  const [newNodeKey, setNewNodeKey] = useState('');
  const [newNodeBpm, setNewNodeBpm] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: CustomNodeData['type']) => {
    if (!nodeType) return;
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleAddNode = () => {
    if (newNodeLabel.trim()) {
      onAddNode(
        newNodeLabel,
        newNodeType,
        newNodeKey || undefined,
        newNodeBpm ? parseInt(newNodeBpm) : undefined
      );

      // Reset form
      setNewNodeLabel('');
      setNewNodeKey('');
      setNewNodeBpm('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-lg border border-blue-400/30 p-4 shadow-lg">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
          <span>🎼</span> Drag & Drop Elements
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {nodeTypes.map((nodeType) => (
            <div
              key={nodeType.value}
              draggable
              onDragStart={(e) => onDragStart(e, nodeType.value)}
              className="bg-slate-800/50 hover:bg-slate-700/50 text-white text-xs px-3 py-2 rounded-lg cursor-move text-center font-semibold hover:scale-105 active:scale-95 transition-all shadow-md border border-slate-600/30 hover:border-blue-400/40 flex flex-col items-center gap-1"
            >
              <span className="text-base">{nodeType.icon}</span>
              <span>{nodeType.label}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-blue-300/60 mt-3 text-center">
          Drag elements onto the canvas
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-blue-400/20">
        <button
          onClick={onClearGraph}
          className="w-full px-4 py-2 text-sm rounded-lg font-semibold bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all shadow-md hover:shadow-lg"
        >
          🗑️ Clear All
        </button>
        <p className="text-xs text-slate-400 mt-3 text-center">
          Right-click nodes/edges to delete
        </p>
      </div>
    </div>
  );
};

export default GraphControls;

'use client';

import React, { useState } from 'react';
import { CustomNodeData } from './CustomNode';

interface GraphControlsProps {
  onAddNode: (label: string, type: CustomNodeData['type'], key?: string, bpm?: number) => void;
  onClearGraph: () => void;
}

const nodeTypes: { value: CustomNodeData['type']; label: string; color: string }[] = [
  { value: 'section', label: 'Section', color: 'bg-purple-700' },
  { value: 'bassline', label: 'Bassline', color: 'bg-purple-600' },
  { value: 'drum', label: 'Drum', color: 'bg-red-500' },
  { value: 'melody', label: 'Melody', color: 'bg-blue-500' },
  { value: 'genre', label: 'Genre', color: 'bg-pink-500' },
  { value: 'chord', label: 'Chord', color: 'bg-indigo-500' },
  { value: 'vocal', label: 'Vocal', color: 'bg-green-500' },
  { value: 'fx', label: 'FX', color: 'bg-orange-500' },
  { value: 'synth', label: 'Synth', color: 'bg-cyan-500' },
];

const GraphControls = ({ onAddNode, onClearGraph }: GraphControlsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<CustomNodeData['type']>('melody');
  const [newNodeKey, setNewNodeKey] = useState('');
  const [newNodeBpm, setNewNodeBpm] = useState('');

  const onDragStart = (event: React.DragEvent, nodeType: CustomNodeData['type']) => {
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
    <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-3">
      <div className="mb-3">
        <h3 className="text-xs font-bold text-white mb-2">Drag & Drop Nodes</h3>
        <div className="grid grid-cols-3 gap-1.5">
          {nodeTypes.map((nodeType) => (
            <div
              key={nodeType.value}
              draggable
              onDragStart={(e) => onDragStart(e, nodeType.value)}
              className={`${nodeType.color} text-white text-[10px] px-2 py-1.5 rounded-md cursor-move text-center font-medium hover:opacity-80 transition-opacity`}
            >
              {nodeType.label}
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 text-center italic">
          Drag onto canvas to add
        </p>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800">
        <button
          onClick={onClearGraph}
          className="w-full px-3 py-1.5 text-xs rounded-md font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Clear All
        </button>
        <p className="text-xs text-slate-500 mt-2 text-center">
          Right-click nodes/edges on canvas to delete
        </p>
      </div>
    </div>
  );
};

export default GraphControls;

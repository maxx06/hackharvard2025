'use client';

import React, { useState } from 'react';
import { CustomNodeData } from './CustomNode';

interface GraphControlsProps {
  onAddNode: (label: string, type: CustomNodeData['type'], key?: string, bpm?: number) => void;
  onClearGraph: () => void;
}

const GraphControls = ({ onAddNode, onClearGraph }: GraphControlsProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<CustomNodeData['type']>('melody');
  const [newNodeKey, setNewNodeKey] = useState('');
  const [newNodeBpm, setNewNodeBpm] = useState('');

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
    <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-800">Manual Controls</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-sm rounded-md font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          {showAddForm ? '✕ Cancel' : '+ Add Node'}
        </button>
      </div>

      {showAddForm && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <input
            type="text"
            placeholder="Node label"
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={newNodeType}
            onChange={(e) => setNewNodeType(e.target.value as CustomNodeData['type'])}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bassline">🎸 Bassline</option>
            <option value="drum">🥁 Drum</option>
            <option value="melody">🎹 Melody</option>
            <option value="genre">🎵 Genre</option>
            <option value="chord">🎼 Chord</option>
            <option value="vocal">🎤 Vocal</option>
            <option value="fx">✨ FX</option>
            <option value="synth">🎛️ Synth</option>
          </select>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Key (e.g., C, Am)"
              value={newNodeKey}
              onChange={(e) => setNewNodeKey(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="BPM"
              value={newNodeBpm}
              onChange={(e) => setNewNodeBpm(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleAddNode}
            className="w-full px-4 py-2 text-sm rounded-md font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
          >
            Add Node
          </button>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={onClearGraph}
          className="w-full px-4 py-2 text-sm rounded-md font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          Clear All
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Right-click nodes/edges on canvas to delete
        </p>
      </div>
    </div>
  );
};

export default GraphControls;

'use client';

import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import SpeechInput from '@/components/SpeechInput';
import GraphControls from '@/components/GraphControls';
import { parseTranscriptToGraph } from '@/lib/parseTranscript';
import { recalculateEdges } from '@/lib/calculateCompatibility';
import { CustomNodeData } from '@/components/CustomNode';

export default function Home() {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [manualEdges, setManualEdges] = useState<Edge[]>([]);
  const [mode, setMode] = useState<'structure' | 'discovery'>('discovery');

  const handleTranscript = (transcript: string) => {
    if (!transcript.trim()) {
      setNodes([]);
      setEdges([]);
      setMode('discovery');
      return;
    }
    const { nodes: newNodes, edges: newEdges, mode: graphMode } = parseTranscriptToGraph(transcript);

    // Merge new nodes with existing ones instead of replacing
    const existingNodeIds = new Set(nodes.map(n => n.id));
    const nodesToAdd = newNodes.filter(n => !existingNodeIds.has(n.id));

    setNodes([...nodes, ...nodesToAdd]);
    setEdges([...edges, ...newEdges]);
    setMode(graphMode);
  };

  // Auto-recalculate edges when nodes change (only in discovery mode)
  useEffect(() => {
    if (mode === 'discovery') {
      const autoEdges = recalculateEdges(nodes);
      // Combine auto-generated edges with manually created edges
      setEdges([...autoEdges, ...manualEdges]);
    }
  }, [nodes, manualEdges, mode]);

  const handleAddNode = (label: string, type: CustomNodeData['type'], key?: string, bpm?: number) => {
    const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: 'custom',
      data: { label, type, key, bpm },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
    };
    setNodes([...nodes, newNode]);
  };

  const handleNodeDrop = (type: CustomNodeData['type'], position: { x: number; y: number }) => {
    const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: 'custom',
      data: { label, type },
      position,
    };
    setNodes([...nodes, newNode]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setManualEdges(manualEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
  };

  const handleEditNode = (nodeId: string, data: CustomNodeData) => {
    setNodes(nodes.map(node =>
      node.id === nodeId
        ? { ...node, data }
        : node
    ));
  };

  const handleDeleteEdge = (edgeId: string) => {
    setManualEdges(manualEdges.filter(edge => edge.id !== edgeId));
  };

  const handleAddManualEdge = (edge: Edge) => {
    setManualEdges([...manualEdges, edge]);
  };

  const handleClearGraph = () => {
    setNodes([]);
    setEdges([]);
    setManualEdges([]);
  };

  return (
    <main className="flex min-h-screen flex-col p-4 bg-slate-950">
      <div className="mb-4 border-b border-slate-800 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">Jamflow</h1>
          </div>
          <p className="text-sm text-slate-400">
            Describe your sounds or song structure
          </p>
        </div>
        <div className="text-xs text-slate-500 mt-3 space-y-1">
          <p><strong className="text-slate-400">General sounds:</strong> "Trap bass in C at 140 BPM, drums at 140 BPM, house melody"</p>
          <p><strong className="text-slate-400">Song structure:</strong> "Intro with ambient pads, verse with drums and bass, chorus with energetic synths"</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3 space-y-3">
          <SpeechInput onTranscript={handleTranscript} />

          <GraphControls
            onAddNode={handleAddNode}
            onClearGraph={handleClearGraph}
          />
        </div>

        <div className="lg:w-2/3 bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden relative" style={{ minHeight: '600px' }}>
          <KnowledgeGraph
            initialNodes={nodes}
            initialEdges={edges}
            onNodeDelete={handleDeleteNode}
            onNodeEdit={handleEditNode}
            onEdgeDelete={handleDeleteEdge}
            onEdgeAdd={handleAddManualEdge}
            onNodeDrop={handleNodeDrop}
            mode={mode}
          />
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-slate-500">
                <p className="text-lg font-medium">No sounds yet</p>
                <p className="text-xs mt-2">Drag nodes from the left or start recording</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

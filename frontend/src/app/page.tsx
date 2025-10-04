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

  const handleTranscript = (transcript: string) => {
    if (!transcript.trim()) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const { nodes: newNodes, edges: newEdges } = parseTranscriptToGraph(transcript);
    setNodes(newNodes);
    setEdges(newEdges);
  };

  // Auto-recalculate edges when nodes change
  useEffect(() => {
    const autoEdges = recalculateEdges(nodes);
    // Combine auto-generated edges with manually created edges
    setEdges([...autoEdges, ...manualEdges]);
  }, [nodes, manualEdges]);

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

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(node => node.id !== nodeId));
    setManualEdges(manualEdges.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
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
    <main className="flex min-h-screen flex-col p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">🎵 Musical Knowledge Graph</h1>
        <p className="text-lg text-gray-600">
          Describe your sounds and see how they connect musically
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Try: "Trap bass in C at 140 BPM, drums at 140 BPM, house melody in C, reverb"
        </p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-4">
          <SpeechInput onTranscript={handleTranscript} />

          <GraphControls
            onAddNode={handleAddNode}
            onClearGraph={handleClearGraph}
          />

          <div className="bg-white rounded-lg shadow-md p-4 border-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-800 mb-2">Compatibility Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <span className="text-gray-600">High - Same key/BPM, Rhythm section</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-blue-500"></div>
                <span className="text-gray-600">Medium - Harmonic, Similar BPM</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gray-500"></div>
                <span className="text-gray-600">Low - FX chains, Effects</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden" style={{ minHeight: '600px' }}>
          {nodes.length > 0 ? (
            <KnowledgeGraph
              initialNodes={nodes}
              initialEdges={edges}
              onNodeDelete={handleDeleteNode}
              onEdgeDelete={handleDeleteEdge}
              onEdgeAdd={handleAddManualEdge}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-xl font-medium">🎛️ No sounds yet</p>
                <p className="text-sm mt-2">Start recording to visualize your musical elements</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

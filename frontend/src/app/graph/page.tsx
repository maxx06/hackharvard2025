'use client';

import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import SpeechInput from '@/components/SpeechInput';
import GraphControls from '@/components/GraphControls';
import { parseTranscriptToGraph } from '@/lib/parseTranscript';
import { recalculateEdges } from '@/lib/calculateCompatibility';
import { CustomNodeData } from '@/components/CustomNode';
import { executeCommands, getGraphCommands } from '@/lib/commandDispatcher';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [manualEdges, setManualEdges] = useState<Edge[]>([]);
  const [mode, setMode] = useState<'structure' | 'discovery'>('discovery');
  const [useIncrementalMode, setUseIncrementalMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [instructionInput, setInstructionInput] = useState('');

  const handleTranscript = async (transcript: string) => {
    if (!transcript.trim()) {
      setNodes([]);
      setEdges([]);
      setMode('discovery');
      return;
    }

    // Use incremental mode if enabled
    if (useIncrementalMode) {
      await handleIncrementalUpdate(transcript);
    } else {
      // Original full parsing mode
      const { nodes: newNodes, edges: newEdges, mode: graphMode } = parseTranscriptToGraph(transcript);

      // Merge new nodes with existing ones instead of replacing
      const existingNodeIds = new Set(nodes.map(n => n.id));
      const nodesToAdd = newNodes.filter(n => !existingNodeIds.has(n.id));

      setNodes([...nodes, ...nodesToAdd]);
      setEdges([...edges, ...newEdges]);
      setMode(graphMode);
    }
  };

  const handleIncrementalUpdate = useCallback(async (instruction: string) => {
    setIsProcessing(true);
    try {
      // Get commands from LLM - pass all edges (auto + manual)
      const allEdges = [...edges, ...manualEdges];
      const commands = await getGraphCommands(nodes, allEdges, instruction);

      // Execute commands - add to edges state directly for structure mode
      executeCommands(commands, {
        addNode: (node) => setNodes(prev => [...prev, node]),
        addEdge: (edge) => {
          // In structure mode, add to edges. In discovery mode, add to manualEdges
          if (mode === 'structure') {
            setEdges(prev => [...prev, edge]);
          } else {
            setManualEdges(prev => [...prev, edge]);
          }
        },
        removeNode: (nodeId) => {
          setNodes(prev => prev.filter(n => n.id !== nodeId));
          setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
          setManualEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
        },
        removeEdge: (edgeId) => {
          setEdges(prev => prev.filter(e => e.id !== edgeId));
          setManualEdges(prev => prev.filter(e => e.id !== edgeId));
        },
        getNodes: () => nodes,
        getEdges: () => allEdges,
      });
    } catch (error) {
      console.error('Error processing incremental update:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, manualEdges, mode]);

  // Auto-recalculate edges when nodes change (only in discovery mode AND not using incremental mode)
  useEffect(() => {
    if (mode === 'discovery' && !useIncrementalMode) {
      const autoEdges = recalculateEdges(nodes);
      // Combine auto-generated edges with manually created edges
      setEdges([...autoEdges, ...manualEdges]);
    }
  }, [nodes, manualEdges, mode, useIncrementalMode]);

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
    if (!type) return;
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
          <p><strong className="text-slate-400">Incremental:</strong> "Add a chorus with synths" or "Connect verse to chorus"</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3 space-y-3">
          {/* Mode Toggle */}
          <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useIncrementalMode}
                onChange={(e) => setUseIncrementalMode(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-slate-300">
                🤖 AI Incremental Mode {isProcessing && '(Processing...)'}
              </span>
            </label>
            <p className="text-xs text-slate-500 mt-1">
              Use LLM to update graph incrementally instead of regenerating
            </p>
          </div>

          {/* Manual Input for Incremental Mode */}
          {useIncrementalMode && (
            <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-3 space-y-2">
              <textarea
                value={instructionInput}
                onChange={(e) => setInstructionInput(e.target.value)}
                placeholder="Type an instruction: 'add a chorus', 'delete the bass', etc."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                rows={3}
                disabled={isProcessing}
              />
              <Button
                onClick={() => {
                  if (instructionInput.trim()) {
                    handleIncrementalUpdate(instructionInput);
                    setInstructionInput('');
                  }
                }}
                disabled={isProcessing || !instructionInput.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700"
                size="sm"
              >
                {isProcessing ? 'Processing...' : 'Execute Command'}
              </Button>
            </div>
          )}

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

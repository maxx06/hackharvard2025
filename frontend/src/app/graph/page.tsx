'use client';

import { useState, useEffect, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import KnowledgeGraph from '@/components/KnowledgeGraph';
import SpeechInput from '@/components/SpeechInput';
import GraphControls from '@/components/GraphControls';
import { AIProducer } from '@/components/AIProducer';
import { EdgeLegend } from '@/components/EdgeLegend';
import { Recommendations } from '@/components/Recommendations';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastChangeContext, setLastChangeContext] = useState<string | null>(null);

  const handleTranscript = async (transcript: string) => {
    if (!transcript.trim()) {
      setNodes([]);
      setEdges([]);
      setManualEdges([]);
      setMode('discovery');
      return;
    }

    // Always use incremental mode (even for first input starting from empty graph)
    await handleIncrementalUpdate(transcript);
  };

  const handleIncrementalUpdate = useCallback(async (instruction: string) => {
    setIsProcessing(true);
    const isInitialCreation = nodes.length === 0;

    try {
      // Get commands from LLM - pass all edges (auto + manual)
      const allEdges = [...edges, ...manualEdges];
      const commands = await getGraphCommands(nodes, allEdges, instruction);

      // Track what's being added for producer context
      const addedNodes: string[] = [];
      const addedConnections: string[] = [];
      const deletedItems: string[] = [];
      let hasEdgeCommands = false;

      // Check if LLM created any edges (means we should use structure mode)
      hasEdgeCommands = commands.some(cmd => cmd.action === 'connectNodes');

      // Execute commands - add to edges state directly for structure mode
      executeCommands(commands, {
        addNode: (node) => {
          setNodes(prev => [...prev, node]);
          addedNodes.push(node.data.label);
        },
        addEdge: (edge) => {
          // LLM-created edges go to edges (structure mode)
          setEdges(prev => [...prev, edge]);
          addedConnections.push(`${edge.source}-${edge.target}`);
        },
        removeNode: (nodeId) => {
          const node = nodes.find(n => n.id === nodeId);
          if (node) deletedItems.push(node.data.label);
          setNodes(prev => prev.filter(n => n.id !== nodeId));
          setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
          setManualEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
        },
        removeEdge: (edgeId) => {
          deletedItems.push('connection');
          setEdges(prev => prev.filter(e => e.id !== edgeId));
          setManualEdges(prev => prev.filter(e => e.id !== edgeId));
        },
        getNodes: () => nodes,
        getEdges: () => allEdges,
      });

      // If LLM created edges, switch to structure mode (directed graph)
      // Otherwise stay in discovery mode (auto-calculated undirected edges)
      if (hasEdgeCommands) {
        setMode('structure');
      } else if (isInitialCreation) {
        setMode('discovery');
      }

      // Build context message for AI Producer
      let context = instruction;

      if (isInitialCreation && addedNodes.length > 0) {
        // Initial graph creation
        context = `Initial setup: ${addedNodes.join(', ')}. User said: "${instruction}"`;
      } else if (addedNodes.length > 0) {
        // Adding nodes to existing graph
        context = `Just added: ${addedNodes.join(', ')}. User said: "${instruction}"`;
      } else if (deletedItems.length > 0) {
        context = `Just removed: ${deletedItems.join(', ')}. User said: "${instruction}"`;
      } else if (addedConnections.length > 0) {
        context = `Just connected elements. User said: "${instruction}"`;
      }

      // Set context for AI Producer to pick up
      setLastChangeContext(context);

      // Clear context after 5 seconds (producer will have picked it up by then)
      setTimeout(() => setLastChangeContext(null), 5000);

    } catch (error) {
      console.error('Error processing incremental update:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  }, [nodes, edges, manualEdges, mode]);

  // Auto-recalculate edges when nodes change (only in discovery mode)
  // In structure mode, edges are managed by LLM commands
  useEffect(() => {
    if (mode === 'discovery') {
      // Auto-calculate compatibility edges for discovery mode
      const autoEdges = recalculateEdges(nodes);
      setEdges([...autoEdges, ...manualEdges]);
    }
    // In structure mode, don't touch edges - they're set by LLM
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

  const handleNodeDrop = (type: CustomNodeData['type'], position: { x: number; y: number }, customLabel?: string) => {
    if (!type) return;
    const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const label = customLabel || (type.charAt(0).toUpperCase() + type.slice(1));
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

  const handleEditNode = (nodeId: string, newData: CustomNodeData) => {
    const oldNode = nodes.find(n => n.id === nodeId);
    if (!oldNode) return;

    // Update UI
    setNodes(nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: newData }
        : node
    ));

    // Build context message for AI Producer
    const changes: string[] = [];
    if (oldNode.data.label !== newData.label) {
      changes.push(`renamed "${oldNode.data.label}" to "${newData.label}"`);
    }
    if (oldNode.data.type !== newData.type) {
      changes.push(`changed type from ${oldNode.data.type} to ${newData.type}`);
    }
    if (oldNode.data.key !== newData.key) {
      changes.push(`changed key to ${newData.key || 'none'}`);
    }
    if (oldNode.data.bpm !== newData.bpm) {
      changes.push(`changed BPM to ${newData.bpm || 'none'}`);
    }

    if (changes.length > 0) {
      const context = `Edited node: ${changes.join(', ')}`;
      setLastChangeContext(context);
      setTimeout(() => setLastChangeContext(null), 5000);
    }
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
            <h1 className="text-2xl font-bold text-white">Jamfusion</h1>
          </div>
          <p className="text-sm text-slate-400">
            Describe your sounds or song structure
          </p>
        </div>
        <div className="text-xs text-slate-500 mt-3 space-y-1">
          <p><strong className="text-slate-400">Structure:</strong> "Intro with ambient pads, verse with drums and bass, then chorus with synths"</p>
          <p><strong className="text-slate-400">Instruments:</strong> "Add drums and bass" • "Synth that plays in the chorus"</p>
          <p><strong className="text-slate-400">Modify:</strong> "Remove the bass" • "Connect melody to verse" • "Add bridge after chorus"</p>
          <p className="text-blue-400/80 italic">💡 AI creates smart edges showing relationships between elements!</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3 space-y-3">
          <SpeechInput onTranscript={handleTranscript} nodes={nodes} edges={[...edges, ...manualEdges]} />

          <Recommendations nodes={nodes} edges={[...edges, ...manualEdges]} />

          <AIProducer
            nodes={nodes}
            edges={[...edges, ...manualEdges]}
            minNodesForTrigger={2}
            changeContext={lastChangeContext}
          />

          <GraphControls
            onAddNode={handleAddNode}
            onClearGraph={handleClearGraph}
          />

          {mode === 'structure' && <EdgeLegend />}
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

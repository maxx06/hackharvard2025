'use client';

import React, { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  NodeMouseHandler,
  EdgeMouseHandler,
  useReactFlow,
  ReactFlowProvider,
  MarkerType,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getEdgeStyle, updateAllEdgeStyles } from '@/lib/edgeStyleHelper';

import CustomNode, { CustomNodeData } from './CustomNode';
import CustomEdge from './CustomEdge';
import { getLayoutedElements } from '@/lib/graphLayout';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

interface KnowledgeGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeDelete?: (nodeId: string) => void;
  onNodeEdit?: (nodeId: string, data: CustomNodeData) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onEdgeAdd?: (edge: Edge) => void;
  onNodeDrop?: (type: CustomNodeData['type'], position: { x: number; y: number }, customLabel?: string) => void;
  mode?: 'structure' | 'discovery';
}

interface ContextMenu {
  id: string;
  top: number;
  left: number;
  type: 'node' | 'edge';
  edgeLabel?: string;
  edgeDirected?: boolean;
  nodeData?: CustomNodeData;
}

const KnowledgeGraphInner = ({ initialNodes, initialEdges, onNodeDelete, onNodeEdit, onEdgeDelete, onEdgeAdd, onNodeDrop, mode = 'discovery' }: KnowledgeGraphProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update nodes and edges when props change, but preserve manually created edges
  React.useEffect(() => {
    // Only apply auto-layout when in structure mode (has directed edges)
    // In discovery mode, let users position nodes manually
    const { nodes: layoutedNodes, edges: layoutedEdges } = mode === 'structure'
      ? getLayoutedElements(initialNodes, initialEdges)
      : { nodes: initialNodes, edges: initialEdges };

    setNodes(layoutedNodes);

    // Merge incoming edges with existing edges, preserving manually created ones
    setEdges((currentEdges) => {
      // Get IDs of incoming edges
      const incomingEdgeIds = new Set(layoutedEdges.map(e => e.id));

      // Keep manually created edges that aren't in the incoming set
      const manualEdges = currentEdges.filter(e => !incomingEdgeIds.has(e.id));

      // Combine incoming edges with manual edges
      return [...layoutedEdges, ...manualEdges];
    });
  }, [initialNodes, initialEdges, mode, setNodes, setEdges]);
  const [menu, setMenu] = useState<ContextMenu | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ id: string; label: string; directed: boolean } | null>(null);
  const [editingNode, setEditingNode] = useState<{ id: string; data: CustomNodeData } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const edgesRef = React.useRef<Edge[]>(edges);
  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const onConnect = useCallback(
    (params: Connection) => {
      // Calculate edge style based on whether it's a cross-section connection
      const edgeStyle = getEdgeStyle(
        params.source!,
        params.target!,
        nodes,
        { stroke: '#3b82f6', strokeWidth: 2 }
      );

      const newEdge = {
        ...params,
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'smoothstep',
        animated: false,
        style: edgeStyle,
      };

      // Add to local state
      setEdges((eds) => [...eds, newEdge as Edge]);

      // Notify parent about manual edge creation
      if (onEdgeAdd) {
        onEdgeAdd(newEdge as Edge);
      }
    },
    [onEdgeAdd, setEdges, nodes]
  );

  // Keep edges ref updated
  React.useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Update edge styles when nodes change (for cross-section detection)
  // Using a ref to track meaningful changes (not just position updates)
  const prevNodesDataRef = React.useRef<string>('');
  React.useEffect(() => {
    // Create a signature of node data (excluding positions to avoid drag triggers)
    const nodeSignature = nodes.map(n => `${n.id}-${n.data.type}-${n.data.label}-${n.data.section || ''}`).join('|');
    
    // Only update if node count, types, or structure actually changed (not just positions)
    if (nodeSignature !== prevNodesDataRef.current) {
      prevNodesDataRef.current = nodeSignature;
      setEdges((currentEdges) => updateAllEdgeStyles(currentEdges, nodes));
    }
  }, [nodes, setEdges]);

  // Track if we should update from props (only update when props actually change, not on every render)
  const prevNodesRef = React.useRef(initialNodes);
  const prevEdgesRef = React.useRef(initialEdges);

  // Update nodes and edges when props change (conditionally layout based on mode)
  React.useEffect(() => {
    // Only update if the actual content changed (not just reference)
    const nodesChanged = JSON.stringify(initialNodes) !== JSON.stringify(prevNodesRef.current);
    const edgesChanged = JSON.stringify(initialEdges) !== JSON.stringify(prevEdgesRef.current);

    if (nodesChanged || edgesChanged) {
      // Preserve existing node positions that user may have moved
      const existingPositions = new Map(nodes.map(n => [n.id, n.position]));

      // Apply auto-layout only in structure mode
      let newLayoutedNodes = initialNodes;
      let newLayoutedEdges = initialEdges;

      if (mode === 'structure') {
        const layouted = getLayoutedElements(initialNodes, initialEdges);
        newLayoutedNodes = layouted.nodes;
        newLayoutedEdges = layouted.edges;
      }

      // Always restore user-positioned nodes (preserve manual positioning)
      newLayoutedNodes = newLayoutedNodes.map(node => {
        const existingPos = existingPositions.get(node.id);
        return existingPos ? { ...node, position: existingPos } : node;
      });

      setNodes(newLayoutedNodes);
      setEdges(newLayoutedEdges);
      prevNodesRef.current = initialNodes;
      prevEdgesRef.current = initialEdges;
    }
  }, [initialNodes, initialEdges, mode, setNodes, setEdges, nodes]);

  // Update selection state without changing positions
  React.useEffect(() => {
    setNodes((currentNodes) => {
      return currentNodes.map(node => {
        const isConnectedToSelectedEdge = selectedEdgeId &&
          edgesRef.current.some(e => e.id === selectedEdgeId && (e.source === node.id || e.target === node.id));

        return {
          ...node,
          selected: node.id === selectedNodeId,
          style: {
            ...node.style,
            opacity: selectedNodeId
              ? (node.id === selectedNodeId ? 1 : 0.3)
              : selectedEdgeId
              ? (isConnectedToSelectedEdge ? 1 : 0.3)
              : 1,
          }
        };
      });
    });

    setEdges((currentEdges) => {
      return currentEdges.map(edge => {
        const isConnectedToSelectedNode = selectedNodeId &&
          (edge.source === selectedNodeId || edge.target === selectedNodeId);
        const isSelectedEdge = edge.id === selectedEdgeId;

        return {
          ...edge,
          selected: isSelectedEdge,
          animated: isConnectedToSelectedNode || isSelectedEdge,
          style: {
            ...edge.style,
            opacity: selectedNodeId
              ? (isConnectedToSelectedNode ? 1 : 0.1)
              : selectedEdgeId
              ? (isSelectedEdge ? 1 : 0.1)
              : 1,
            strokeWidth: (isConnectedToSelectedNode || isSelectedEdge) ? 3 : (edge.style?.strokeWidth || 2),
          }
        };
      });
    });
  }, [selectedNodeId, selectedEdgeId, setNodes, setEdges]);

  // Handle node right-click
  const onNodeContextMenu: NodeMouseHandler = useCallback(
    (event, node) => {
      event.preventDefault();
      setMenu({
        id: node.id,
        top: event.clientY,
        left: event.clientX,
        type: 'node',
        nodeData: node.data as CustomNodeData,
      });
    },
    []
  );

  // Handle edge right-click
  const onEdgeContextMenu: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.preventDefault();
      const hasMarker = edge.markerEnd !== undefined && edge.markerEnd !== null;
      setMenu({
        id: edge.id,
        top: event.clientY,
        left: event.clientX,
        type: 'edge',
        edgeLabel: edge.label as string,
        edgeDirected: hasMarker,
      });
    },
    []
  );

  // Handle node click for selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
    setSelectedEdgeId(null); // Deselect edges when selecting node
  }, [selectedNodeId]);

  // Handle edge click for selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation();
    setSelectedEdgeId(edge.id === selectedEdgeId ? null : edge.id);
    setSelectedNodeId(null); // Deselect nodes when selecting edge
  }, [selectedEdgeId]);

  // Handle pane click to close menu and deselect
  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  const handleDelete = useCallback(() => {
    if (!menu) return;

    if (menu.type === 'node') {
      if (onNodeDelete) {
        onNodeDelete(menu.id);
      }
    } else if (menu.type === 'edge') {
      if (onEdgeDelete) {
        onEdgeDelete(menu.id);
      }
    }
    setMenu(null);
  }, [menu, onNodeDelete, onEdgeDelete]);

  const handleEditNode = useCallback(() => {
    if (!menu || menu.type !== 'node' || !menu.nodeData) return;
    setEditingNode({ id: menu.id, data: menu.nodeData });
    setMenu(null);
  }, [menu]);

  const handleSaveNode = useCallback(() => {
    if (!editingNode || !onNodeEdit) return;
    onNodeEdit(editingNode.id, editingNode.data);
    setEditingNode(null);
  }, [editingNode, onNodeEdit]);

  const handleEditEdge = useCallback(() => {
    if (!menu || menu.type !== 'edge') return;
    setEditingEdge({
      id: menu.id,
      label: menu.edgeLabel || '',
      directed: menu.edgeDirected || false
    });
    setMenu(null);
  }, [menu]);

  const handleSaveEdgeLabel = useCallback(() => {
    if (!editingEdge) return;

    setEdges((eds) =>
      eds.map((edge): Edge =>
        edge.id === editingEdge.id
          ? {
              ...edge,
              label: editingEdge.label,
              markerEnd: editingEdge.directed
                ? { type: MarkerType.ArrowClosed, color: (edge.style?.stroke as string) || '#3b82f6' }
                : undefined,
            }
          : edge
      )
    );
    setEditingEdge(null);
  }, [editingEdge, setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as CustomNodeData['type'];
      const instrumentName = event.dataTransfer.getData('instrument-name');

      if (!type || !reactFlowWrapper.current || !onNodeDrop) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Pass the instrument name if available
      onNodeDrop(type, position, instrumentName || undefined);
    },
    [project, onNodeDrop]
  );

  // Handle keyboard delete
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      if (onNodeDelete) {
        deleted.forEach(node => onNodeDelete(node.id));
      }
    },
    [onNodeDelete]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      if (onEdgeDelete) {
        deleted.forEach(edge => onEdgeDelete(edge.id));
      }
    },
    [onEdgeDelete]
  );

  // Allow multiple edges between same nodes
  const isValidConnection = useCallback(() => {
    return true;
  }, []);

  return (
    <div ref={reactFlowWrapper} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={true}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        isValidConnection={isValidConnection}
        fitView
        deleteKeyCode="Backspace"
        attributionPosition="top-right"
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>

      {menu && (
        <div
          style={{
            position: 'fixed',
            top: menu.top,
            left: menu.left,
            zIndex: 1000,
          }}
          className="bg-white rounded-lg shadow-lg border-2 border-gray-300 overflow-hidden"
        >
          {menu.type === 'node' && (
            <button
              onClick={handleEditNode}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-100 bg-blue-50 text-blue-700 font-semibold transition-colors border-b border-gray-200"
            >
              Edit Node
            </button>
          )}
          {menu.type === 'edge' && (
            <button
              onClick={handleEditEdge}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium transition-colors border-b border-gray-200"
            >
              Edit Label
            </button>
          )}
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 font-medium transition-colors"
          >
            Delete {menu.type === 'node' ? 'Node' : 'Edge'}
          </button>
        </div>
      )}

      {editingEdge && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
          }}
          className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Edge</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={editingEdge.label}
                onChange={(e) => setEditingEdge({ ...editingEdge, label: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter edge label"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="directed-checkbox"
                checked={editingEdge.directed}
                onChange={(e) => setEditingEdge({ ...editingEdge, directed: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="directed-checkbox" className="text-sm font-medium text-gray-700">
                Directed (show arrow)
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveEdgeLabel}
              className="flex-1 px-4 py-2 text-sm rounded-md font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditingEdge(null)}
              className="flex-1 px-4 py-2 text-sm rounded-md font-medium bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingEdge && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
          onClick={() => setEditingEdge(null)}
        />
      )}

      {editingNode && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001,
          }}
          className="bg-white rounded-lg shadow-2xl border-2 border-gray-300 p-6 w-96"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Node</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={editingNode.data.label}
                onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, label: e.target.value } })}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter node label"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={editingNode.data.type}
                onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, type: e.target.value as CustomNodeData['type'] } })}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="section">Section</option>
                <option value="bassline">Bassline</option>
                <option value="drum">Drum</option>
                <option value="melody">Melody</option>
                <option value="genre">Genre</option>
                <option value="chord">Chord</option>
                <option value="vocal">Vocal</option>
                <option value="fx">FX</option>
                <option value="synth">Synth</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <input
                type="text"
                value={editingNode.data.details || ''}
                onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, details: e.target.value || undefined } })}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., hiphop vocals, deep 808 bass, mongolian throat singing"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <input
                  type="text"
                  value={editingNode.data.key || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, key: e.target.value || undefined } })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., C, Am"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BPM</label>
                <input
                  type="number"
                  value={editingNode.data.bpm || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, data: { ...editingNode.data, bpm: e.target.value ? parseInt(e.target.value) : undefined } })}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 140"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveNode}
              className="flex-1 px-4 py-2 text-sm rounded-md font-medium bg-blue-500 hover:bg-blue-600 text-white transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setEditingNode(null)}
              className="flex-1 px-4 py-2 text-sm rounded-md font-medium bg-gray-300 hover:bg-gray-400 text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {editingNode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
          }}
          onClick={() => setEditingNode(null)}
        />
      )}
    </div>
  );
};

const KnowledgeGraph = (props: KnowledgeGraphProps) => {
  return (
    <ReactFlowProvider>
      <KnowledgeGraphInner {...props} />
    </ReactFlowProvider>
  );
};

export default KnowledgeGraph;

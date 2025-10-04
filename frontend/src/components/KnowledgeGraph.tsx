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
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './CustomNode';
import { getLayoutedElements } from '@/lib/graphLayout';

const nodeTypes = {
  custom: CustomNode,
};

interface KnowledgeGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  onNodeDelete?: (nodeId: string) => void;
  onEdgeDelete?: (edgeId: string) => void;
  onEdgeAdd?: (edge: Edge) => void;
}

interface ContextMenu {
  id: string;
  top: number;
  left: number;
  type: 'node' | 'edge';
  edgeLabel?: string;
}

const KnowledgeGraph = ({ initialNodes, initialEdges, onNodeDelete, onEdgeDelete, onEdgeAdd }: KnowledgeGraphProps) => {
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [menu, setMenu] = useState<ContextMenu | null>(null);
  const [editingEdge, setEditingEdge] = useState<{ id: string; label: string } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const edgesRef = React.useRef<Edge[]>(edges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'smoothstep',
        animated: false,
        label: 'Custom Connection',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
      };

      // Notify parent about manual edge creation
      if (onEdgeAdd) {
        onEdgeAdd(newEdge as Edge);
      }
    },
    [onEdgeAdd]
  );

  // Keep edges ref updated
  React.useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // Update nodes and edges when props change (only layout when data changes)
  React.useEffect(() => {
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } =
      getLayoutedElements(initialNodes, initialEdges);
    setNodes(newLayoutedNodes);
    setEdges(newLayoutedEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Update selection state without changing positions
  React.useEffect(() => {
    setNodes((currentNodes) => {
      return currentNodes.map(node => {
        const isConnectedToSelectedEdge = selectedEdgeId &&
          edgesRef.current.some(e => e.id === selectedEdgeId && (e.source === node.id || e.target === node.id));

        return {
          ...node,
          selected: node.id === selectedNodeId || isConnectedToSelectedEdge,
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
      });
    },
    []
  );

  // Handle edge right-click
  const onEdgeContextMenu: EdgeMouseHandler = useCallback(
    (event, edge) => {
      event.preventDefault();
      setMenu({
        id: edge.id,
        top: event.clientY,
        left: event.clientX,
        type: 'edge',
        edgeLabel: edge.label as string,
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

  const handleEditEdge = useCallback(() => {
    if (!menu || menu.type !== 'edge') return;
    setEditingEdge({ id: menu.id, label: menu.edgeLabel || '' });
    setMenu(null);
  }, [menu]);

  const handleSaveEdgeLabel = useCallback(() => {
    if (!editingEdge) return;

    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === editingEdge.id
          ? { ...edge, label: editingEdge.label }
          : edge
      )
    );
    setEditingEdge(null);
  }, [editingEdge, setEdges]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={true}
        connectionLineType="smoothstep"
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        fitView
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
          {menu.type === 'edge' && (
            <button
              onClick={handleEditEdge}
              className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 font-medium transition-colors border-b border-gray-200"
            >
              ✏️ Edit Label
            </button>
          )}
          <button
            onClick={handleDelete}
            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 font-medium transition-colors"
          >
            🗑️ Delete {menu.type === 'node' ? 'Node' : 'Edge'}
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
          <h3 className="text-lg font-bold text-gray-800 mb-4">Edit Edge Label</h3>
          <input
            type="text"
            value={editingEdge.label}
            onChange={(e) => setEditingEdge({ ...editingEdge, label: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            placeholder="Enter edge label"
            autoFocus
          />
          <div className="flex gap-2">
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
    </div>
  );
};

export default KnowledgeGraph;

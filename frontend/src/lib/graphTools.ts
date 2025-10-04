import { Node, Edge } from 'reactflow';
import { CustomNodeData } from '@/components/CustomNode';

export interface GraphTools {
  addNode: (label: string, type: CustomNodeData['type'], key?: string, bpm?: number) => void;
  deleteNode: (nodeId: string) => void;
  addEdge: (sourceId: string, targetId: string, label?: string) => void;
  deleteEdge: (edgeId: string) => void;
  clearGraph: () => void;
}

export const createGraphTools = (
  nodes: Node<CustomNodeData>[],
  edges: Edge[],
  setNodes: (nodes: Node<CustomNodeData>[]) => void,
  setEdges: (edges: Edge[]) => void
): GraphTools => {

  const addNode = (label: string, type: CustomNodeData['type'], key?: string, bpm?: number) => {
    const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newNode: Node<CustomNodeData> = {
      id: newNodeId,
      type: 'custom',
      data: {
        label,
        type,
        key,
        bpm,
      },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };

    setNodes([...nodes, newNode]);
  };

  const deleteNode = (nodeId: string) => {
    // Remove the node
    const filteredNodes = nodes.filter(node => node.id !== nodeId);
    setNodes(filteredNodes);

    // Remove all edges connected to this node
    const filteredEdges = edges.filter(
      edge => edge.source !== nodeId && edge.target !== nodeId
    );
    setEdges(filteredEdges);
  };

  const addEdge = (sourceId: string, targetId: string, label?: string) => {
    const newEdgeId = `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newEdge: Edge = {
      id: newEdgeId,
      source: sourceId,
      target: targetId,
      label: label || 'Connection',
      type: 'smoothstep',
      animated: false,
    };

    setEdges([...edges, newEdge]);
  };

  const deleteEdge = (edgeId: string) => {
    const filteredEdges = edges.filter(edge => edge.id !== edgeId);
    setEdges(filteredEdges);
  };

  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
  };

  return {
    addNode,
    deleteNode,
    addEdge,
    deleteEdge,
    clearGraph,
  };
};

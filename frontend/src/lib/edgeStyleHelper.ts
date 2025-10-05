import { Edge, Node } from 'reactflow';
import { CustomNodeData } from '@/components/CustomNode';

/**
 * Determines if an edge should be dashed based on whether it connects to cross-section elements
 * (elements that appear in multiple sections)
 */
export function getEdgeStyle(
  sourceId: string,
  targetId: string,
  nodes: Node<CustomNodeData>[],
  baseStyle?: { stroke?: string; strokeWidth?: number }
): { stroke: string; strokeWidth: number; strokeDasharray?: string } {
  // Find the source and target nodes
  const sourceNode = nodes.find(n => n.id === sourceId);
  const targetNode = nodes.find(n => n.id === targetId);

  if (!sourceNode || !targetNode) {
    // Default style if nodes not found
    return {
      stroke: baseStyle?.stroke || '#3b82f6',
      strokeWidth: baseStyle?.strokeWidth || 2,
    };
  }

  // Check if either node is a cross-section element
  const isCrossSection = shouldBeDashed(sourceNode, targetNode, nodes);

  return {
    stroke: baseStyle?.stroke || '#3b82f6',
    strokeWidth: baseStyle?.strokeWidth || 2,
    ...(isCrossSection && { strokeDasharray: '5,5' }),
  };
}

/**
 * Determines if a connection should be dashed based on node types and cross-section logic
 */
function shouldBeDashed(
  sourceNode: Node<CustomNodeData>,
  targetNode: Node<CustomNodeData>,
  nodes: Node<CustomNodeData>[]
): boolean {
  // If either node is a section node, check if the other appears in multiple sections
  if (sourceNode.data.isSection) {
    return isNodeInMultipleSections(targetNode, nodes);
  }
  if (targetNode.data.isSection) {
    return isNodeInMultipleSections(sourceNode, nodes);
  }

  // If both nodes have sections but different sections, it's a cross-section connection
  if (sourceNode.data.section && targetNode.data.section) {
    return sourceNode.data.section !== targetNode.data.section;
  }

  // For discovery mode, check if nodes of same type exist (indicating potential cross-section)
  // This is a heuristic - nodes with same type/label in discovery mode
  if (sourceNode.data.type === targetNode.data.type && sourceNode.data.type) {
    return true; // Same type connections are typically cross-cutting
  }

  return false;
}

/**
 * Checks if a node appears in multiple sections by looking at similar nodes with different sections
 */
function isNodeInMultipleSections(
  node: Node<CustomNodeData>,
  nodes: Node<CustomNodeData>[]
): boolean {
  if (!node.data.section) {
    return false; // Not in structured mode
  }

  // Count how many times this type/label appears across different sections
  const sameTypeNodes = nodes.filter(n => {
    // For instruments, match by type
    if (node.data.type && node.data.type !== 'section' && node.data.type !== 'genre') {
      return n.data.type === node.data.type && n.id !== node.id;
    }
    // For moods/genre types, match by label
    if (node.data.type === 'genre') {
      return n.data.label === node.data.label && n.id !== node.id;
    }
    return false;
  });

  // Get unique sections
  const uniqueSections = new Set(
    sameTypeNodes.map(n => n.data.section).filter(s => s && s !== node.data.section)
  );

  return uniqueSections.size > 0;
}

/**
 * Updates an existing edge with proper styling based on current nodes
 */
export function updateEdgeStyle(
  edge: Edge,
  nodes: Node<CustomNodeData>[]
): Edge {
  const baseStyle = edge.style
    ? {
        stroke: typeof edge.style.stroke === 'string' ? edge.style.stroke : undefined,
        strokeWidth: typeof edge.style.strokeWidth === 'number' ? edge.style.strokeWidth : undefined,
      }
    : undefined;

  const style = getEdgeStyle(edge.source, edge.target, nodes, baseStyle);

  return {
    ...edge,
    style,
  };
}

/**
 * Updates all edges in a graph with proper styling
 */
export function updateAllEdgeStyles(
  edges: Edge[],
  nodes: Node<CustomNodeData>[]
): Edge[] {
  return edges.map(edge => updateEdgeStyle(edge, nodes));
}


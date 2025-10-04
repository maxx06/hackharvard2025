import { Node, Edge, MarkerType } from 'reactflow';
import { CustomNodeData } from '@/components/CustomNode';
import { 
  GraphCommand, 
  CreateNodeParams, 
  ConnectNodesParams, 
  DeleteByIdParams 
} from '@/types/graphCommands';

export interface CommandDispatcherCallbacks {
  addNode: (node: Node<CustomNodeData>) => void;
  addEdge: (edge: Edge) => void;
  removeNode: (nodeId: string) => void;
  removeEdge: (edgeId: string) => void;
  getNodes: () => Node<CustomNodeData>[];
  getEdges: () => Edge[];
}

/**
 * Executes a list of graph commands to update the React Flow diagram
 */
export function executeCommands(
  commands: GraphCommand[],
  callbacks: CommandDispatcherCallbacks
): void {
  console.log('Executing commands:', commands);
  
  // Collect all nodes and edges to add in batches
  const nodesToAdd: Node<CustomNodeData>[] = [];
  const edgesToAdd: Edge[] = [];
  const nodeIdsToDelete: string[] = [];
  const edgeIdsToDelete: string[] = [];
  
  // Get current state
  const currentNodes = callbacks.getNodes();
  const currentEdges = callbacks.getEdges();
  
  // Build a map of all nodes (current + new) for validation
  const allNodesMap = new Map<string, Node<CustomNodeData>>();
  currentNodes.forEach(n => allNodesMap.set(n.id, n));
  
  commands.forEach((cmd, index) => {
    try {
      console.log(`Command ${index + 1}/${commands.length}:`, cmd.action, cmd.params);
      switch (cmd.action) {
        case 'createNode': {
          const params = cmd.params as CreateNodeParams;
          const existingNode = allNodesMap.get(params.id);
          if (existingNode) {
            console.warn(`Node with id "${params.id}" already exists, skipping creation`);
            break;
          }
          
          const newNode: Node<CustomNodeData> = {
            id: params.id,
            type: 'custom',
            data: {
              label: params.label,
              type: params.type as CustomNodeData['type'],
              ...(params.key && { key: params.key }),
              ...(params.bpm && { bpm: params.bpm }),
              ...(params.section && { section: params.section }),
            },
            position: params.position || { 
              x: Math.random() * 400 + 100, 
              y: Math.random() * 400 + 100 
            },
          };
          
          nodesToAdd.push(newNode);
          allNodesMap.set(newNode.id, newNode); // Add to map for subsequent commands
          break;
        }
        
        case 'connectNodes': {
          const params = cmd.params as ConnectNodesParams;
          
          // Check if source and target nodes exist (in current + new nodes)
          if (!allNodesMap.has(params.source)) {
            console.warn(`Source node "${params.source}" not found, skipping connection`);
            break;
          }
          if (!allNodesMap.has(params.target)) {
            console.warn(`Target node "${params.target}" not found, skipping connection`);
            break;
          }
          
          // Check if edge already exists
          const edgeExists = currentEdges.some(
            e => e.source === params.source && e.target === params.target
          ) || edgesToAdd.some(
            e => e.source === params.source && e.target === params.target
          );
          
          if (edgeExists) {
            console.warn(`Edge from "${params.source}" to "${params.target}" already exists`);
            break;
          }
          
          const newEdge: Edge = {
            id: `edge-${params.source}-${params.target}-${Date.now()}`,
            source: params.source,
            target: params.target,
            type: 'smoothstep',
            animated: false,
            // No label - just the arrow
            style: { 
              stroke: '#3b82f6', 
              strokeWidth: 2 
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3b82f6',
            },
          };
          
          console.log('Queuing edge:', newEdge);
          edgesToAdd.push(newEdge);
          break;
        }
        
        case 'deleteById': {
          const params = cmd.params as DeleteByIdParams;
          if (allNodesMap.has(params.id)) {
            nodeIdsToDelete.push(params.id);
          } else {
            edgeIdsToDelete.push(params.id);
          }
          break;
        }
        
        default:
          console.warn('Unknown command action:', cmd.action);
      }
    } catch (error) {
      console.error(`Error executing command ${cmd.action}:`, error);
    }
  });
  
  // Execute all changes in batches
  console.log(`Batched updates: ${nodesToAdd.length} nodes, ${edgesToAdd.length} edges`);
  
  nodesToAdd.forEach(node => callbacks.addNode(node));
  edgesToAdd.forEach(edge => callbacks.addEdge(edge));
  nodeIdsToDelete.forEach(id => callbacks.removeNode(id));
  edgeIdsToDelete.forEach(id => callbacks.removeEdge(id));
  
  console.log('All commands executed');
}

/**
 * Calls the backend API to get graph commands
 */
export async function getGraphCommands(
  currentNodes: Node<CustomNodeData>[],
  currentEdges: Edge[],
  instruction: string
): Promise<GraphCommand[]> {
  const response = await fetch('http://localhost:8000/api/v1/graph/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      current_graph: {
        nodes: currentNodes.map(node => ({
          id: node.id,
          type: node.type,
          data: node.data,
          position: node.position,
        })),
        edges: currentEdges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          label: edge.label,
          animated: edge.animated,
          style: edge.style,
        })),
      },
      instruction,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  const data = await response.json();
  return data.commands;
}


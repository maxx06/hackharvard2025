import { Node, Edge } from 'reactflow';
import { CustomNodeData } from '@/components/CustomNode';

export interface Position {
  x: number;
  y: number;
}

export interface CreateNodeParams {
  id: string;
  label: string;
  type: string;
  position?: Position;
  key?: string;
  bpm?: number;
  section?: string;
}

export interface ConnectNodesParams {
  source: string;
  target: string;
  relation?: string;
  label?: string;
}

export interface DeleteByIdParams {
  id: string;
}

export type GraphCommandAction = 'createNode' | 'connectNodes' | 'deleteById';

export interface GraphCommand {
  action: GraphCommandAction;
  params: CreateNodeParams | ConnectNodesParams | DeleteByIdParams;
}

export interface GraphCommandsResponse {
  commands: GraphCommand[];
}

export interface CurrentGraph {
  nodes: Node<CustomNodeData>[];
  edges: Edge[];
}

export interface GraphUpdateRequest {
  current_graph: CurrentGraph;
  instruction: string;
}


import { Node, Edge } from 'reactflow';
import { CustomNodeData } from '@/components/CustomNode';

// Musical key compatibility (Circle of Fifths)
const keyCompatibility: { [key: string]: string[] } = {
  'C': ['C', 'G', 'F', 'Am', 'Em', 'Dm'],
  'G': ['G', 'D', 'C', 'Em', 'Bm', 'Am'],
  'D': ['D', 'A', 'G', 'Bm', 'F#m', 'Em'],
  'A': ['A', 'E', 'D', 'F#m', 'C#m', 'Bm'],
  'E': ['E', 'B', 'A', 'C#m', 'G#m', 'F#m'],
  'F': ['F', 'C', 'Bb', 'Dm', 'Am', 'Gm'],
  'Bb': ['Bb', 'F', 'Eb', 'Gm', 'Dm', 'Cm'],
  'Eb': ['Eb', 'Bb', 'Ab', 'Cm', 'Gm', 'Fm'],
  'Am': ['Am', 'Em', 'Dm', 'C', 'G', 'F'],
  'Em': ['Em', 'Bm', 'Am', 'G', 'D', 'C'],
  'Dm': ['Dm', 'Am', 'Gm', 'F', 'C', 'Bb'],
};

export function recalculateEdges(nodes: Node<CustomNodeData>[]): Edge[] {
  const edges: Edge[] = [];

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];

      const compatibility = calculateNodeCompatibility(node1.data, node2.data);

      if (compatibility.compatible) {
        edges.push({
          id: `edge-${node1.id}-${node2.id}`,
          source: node1.id,
          target: node2.id,
          label: compatibility.reason,
          type: 'smoothstep',
          animated: compatibility.strength === 'high',
          style: {
            stroke: compatibility.strength === 'high' ? '#10b981' : compatibility.strength === 'medium' ? '#3b82f6' : '#6b7280',
            strokeWidth: compatibility.strength === 'high' ? 3 : 2,
          },
        });
      }
    }
  }

  return edges;
}

function calculateNodeCompatibility(node1: CustomNodeData, node2: CustomNodeData): {
  compatible: boolean;
  reason: string;
  strength: 'high' | 'medium' | 'low'
} {
  // Key compatibility (highest priority)
  if (node1.key && node2.key) {
    const compatible = keyCompatibility[node1.key]?.includes(node2.key) ||
                      keyCompatibility[node2.key]?.includes(node1.key);
    if (compatible) {
      return { compatible: true, reason: `${node1.key} ↔ ${node2.key}`, strength: 'high' };
    }
  }

  // BPM compatibility
  if (node1.bpm && node2.bpm) {
    const bpmDiff = Math.abs(node1.bpm - node2.bpm);
    if (bpmDiff === 0) {
      return { compatible: true, reason: `${node1.bpm} BPM`, strength: 'high' };
    } else if (bpmDiff <= 5) {
      return { compatible: true, reason: `~${node1.bpm} BPM`, strength: 'medium' };
    }
  }

  // Type compatibility (rhythm section works together)
  const rhythmSection = new Set(['drum', 'bassline']);
  if (rhythmSection.has(node1.type!) && rhythmSection.has(node2.type!)) {
    return { compatible: true, reason: 'Rhythm Section', strength: 'high' };
  }

  // Melodic elements work together
  const melodicElements = new Set(['melody', 'chord', 'synth']);
  if (melodicElements.has(node1.type!) && melodicElements.has(node2.type!)) {
    return { compatible: true, reason: 'Harmonic', strength: 'medium' };
  }

  // Genre compatibility with other elements
  if (node1.type === 'genre' || node2.type === 'genre') {
    return { compatible: true, reason: 'Genre Match', strength: 'medium' };
  }

  // FX can connect to anything
  if (node1.type === 'fx' || node2.type === 'fx') {
    return { compatible: true, reason: 'Effect Chain', strength: 'low' };
  }

  // Vocals work with most things
  if (node1.type === 'vocal' || node2.type === 'vocal') {
    return { compatible: true, reason: 'Vocal Mix', strength: 'medium' };
  }

  // Default: all musical elements can potentially work together
  return { compatible: true, reason: 'Musical Element', strength: 'low' };
}

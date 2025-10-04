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
          type: 'custom',
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
  const reasons: string[] = [];
  let highestStrength: 'high' | 'medium' | 'low' = 'low';
  let score = 0;

  // Key compatibility (highest priority)
  if (node1.key && node2.key) {
    const compatible = keyCompatibility[node1.key]?.includes(node2.key) ||
                      keyCompatibility[node2.key]?.includes(node1.key);
    if (compatible) {
      reasons.push(`Keys: ${node1.key} ↔ ${node2.key}`);
      highestStrength = 'high';
      score += 10;
    } else {
      reasons.push(`Keys clash: ${node1.key} vs ${node2.key}`);
      score -= 5;
    }
  }

  // BPM compatibility
  if (node1.bpm && node2.bpm) {
    const bpmDiff = Math.abs(node1.bpm - node2.bpm);
    if (bpmDiff === 0) {
      reasons.push(`Perfect tempo: ${node1.bpm} BPM`);
      if (highestStrength !== 'high') highestStrength = 'high';
      score += 8;
    } else if (bpmDiff <= 5) {
      reasons.push(`Close tempo: ${node1.bpm}↔${node2.bpm} BPM (Δ${bpmDiff})`);
      if (highestStrength === 'low') highestStrength = 'medium';
      score += 5;
    } else if (bpmDiff <= 10) {
      reasons.push(`Tempo diff: ${bpmDiff} BPM`);
      score += 2;
    } else {
      reasons.push(`Tempo clash: ${bpmDiff} BPM apart`);
      score -= 3;
    }
  }

  // Type compatibility (rhythm section works together)
  const rhythmSection = new Set(['drum', 'bassline']);
  if (rhythmSection.has(node1.type!) && rhythmSection.has(node2.type!)) {
    reasons.push('Rhythm section pair');
    if (highestStrength !== 'high') highestStrength = 'high';
    score += 7;
  }

  // Melodic elements work together
  const melodicElements = new Set(['melody', 'chord', 'synth']);
  if (melodicElements.has(node1.type!) && melodicElements.has(node2.type!)) {
    reasons.push('Harmonic elements');
    if (highestStrength === 'low') highestStrength = 'medium';
    score += 6;
  }

  // Genre compatibility with other elements
  if (node1.type === 'genre' || node2.type === 'genre') {
    reasons.push('Genre context');
    if (highestStrength === 'low') highestStrength = 'medium';
    score += 4;
  }

  // FX can connect to anything
  if (node1.type === 'fx' || node2.type === 'fx') {
    reasons.push('Effect processing');
    score += 3;
  }

  // Vocals work with most things
  if (node1.type === 'vocal' || node2.type === 'vocal') {
    reasons.push('Vocal arrangement');
    if (highestStrength === 'low') highestStrength = 'medium';
    score += 5;
  }

  // Bass and melody relationship
  if ((node1.type === 'bassline' && node2.type === 'melody') ||
      (node1.type === 'melody' && node2.type === 'bassline')) {
    reasons.push('Bass-melody relationship');
    score += 4;
  }

  // If no specific reasons, add a default
  if (reasons.length === 0) {
    reasons.push('Generic compatibility');
    score += 1;
  }

  // Determine relationship type for undirected graph
  let relationshipType = 'relates to';
  if (rhythmSection.has(node1.type!) && rhythmSection.has(node2.type!)) {
    relationshipType = 'layered with';
  } else if (melodicElements.has(node1.type!) && melodicElements.has(node2.type!)) {
    relationshipType = 'blends with';
  } else if (node1.type === 'genre' || node2.type === 'genre') {
    relationshipType = 'influences';
  }

  // Build comprehensive label with score
  const label = `${relationshipType}\nScore: ${score}\n${reasons.join('\n')}`;

  return {
    compatible: score > 0,
    reason: label,
    strength: highestStrength
  };
}

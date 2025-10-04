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

export const parseTranscriptToGraph = (transcript: string): { nodes: Node<CustomNodeData>[], edges: Edge[] } => {
  const nodes: Node<CustomNodeData>[] = [];
  const edges: Edge[] = [];

  const lowerTranscript = transcript.toLowerCase();
  let nodeId = 0;
  const nodeMap = new Map<string, { id: string; data: CustomNodeData }>();

  // Extract music elements with patterns
  const patterns = {
    bassline: /(?:bass(?:line)?|808|sub bass|bass guitar)\s*(?:in\s*)?([A-G][#b]?m?)?(?:\s*at\s*(\d+)\s*bpm)?/gi,
    drum: /(?:drum(?:s)?|beat|drum loop|drum pattern|kick|snare|hi-?hat)\s*(?:at\s*(\d+)\s*bpm)?/gi,
    melody: /(?:melody|lead|piano|keys)\s*(?:in\s*)?([A-G][#b]?m?)?(?:\s*at\s*(\d+)\s*bpm)?/gi,
    genre: /(hip[\s-]?hop|trap|house|techno|tech[\s-]?house|deep[\s-]?house|progressive[\s-]?house|dnb|drum[\s-]?and[\s-]?bass|dubstep|edm|pop|rock|jazz|funk|r&b|rnb|ambient|lo[\s-]?fi|lofi|trance|electro|disco|soul|reggae|country|blues|metal|indie|alternative|classical)/gi,
    chord: /(?:chord(?:s)?|progression)\s*(?:in\s*)?([A-G][#b]?m?)?/gi,
    vocal: /(?:vocal(?:s)?|voice|singing|rap|lyrics)/gi,
    fx: /(?:fx|effect(?:s)?|reverb|delay|filter)/gi,
    synth: /(?:synth|synthesizer|pad|lead synth)\s*(?:in\s*)?([A-G][#b]?m?)?/gi,
  };

  // Extract all musical elements
  Object.entries(patterns).forEach(([type, pattern]) => {
    let match;
    while ((match = pattern.exec(lowerTranscript)) !== null) {
      const fullMatch = match[0];
      const key = match[1];
      const bpm = match[2] ? parseInt(match[2]) : undefined;

      const label = capitalizeFirst(fullMatch.replace(/\s*in\s*[A-G][#b]?m?/i, '').replace(/\s*at\s*\d+\s*bpm/i, '').trim());
      const nodeKey = `${type}-${label}`;

      if (!nodeMap.has(nodeKey)) {
        const id = `node-${nodeId++}`;
        const nodeData: CustomNodeData = {
          label,
          type: type as any,
          key: key?.toUpperCase(),
          bpm,
        };

        nodeMap.set(nodeKey, { id, data: nodeData });
        nodes.push({
          id,
          type: 'custom',
          data: nodeData,
          position: { x: 0, y: 0 },
        });
      }
    }
  });

  // If no specific patterns found, try to extract any music-related words
  if (nodes.length === 0) {
    const musicWords = extractMusicKeywords(lowerTranscript);
    musicWords.forEach((word) => {
      const id = `node-${nodeId++}`;
      const nodeData: CustomNodeData = {
        label: capitalizeFirst(word),
        type: determineMusicNodeType(word),
      };

      nodes.push({
        id,
        type: 'custom',
        data: nodeData,
        position: { x: 0, y: 0 },
      });
    });
  }

  // Create edges based on musical compatibility
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];

      const compatibility = calculateCompatibility(node1.data, node2.data);

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

  return { nodes, edges };
};

function calculateCompatibility(node1: CustomNodeData, node2: CustomNodeData): {
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

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function determineMusicNodeType(text: string): CustomNodeData['type'] {
  const lowerText = text.toLowerCase();

  if (lowerText.includes('bass')) return 'bassline';
  if (lowerText.includes('drum') || lowerText.includes('beat') || lowerText.includes('kick') || lowerText.includes('snare')) return 'drum';
  if (lowerText.includes('melody') || lowerText.includes('lead') || lowerText.includes('piano')) return 'melody';
  if (lowerText.includes('chord')) return 'chord';
  if (lowerText.includes('vocal') || lowerText.includes('voice') || lowerText.includes('sing')) return 'vocal';
  if (lowerText.includes('fx') || lowerText.includes('effect') || lowerText.includes('reverb') || lowerText.includes('delay')) return 'fx';
  if (lowerText.includes('synth') || lowerText.includes('pad')) return 'synth';
  if (lowerText.includes('genre') || lowerText.includes('trap') || lowerText.includes('house') || lowerText.includes('techno')) return 'genre';

  return 'melody';
}

function extractMusicKeywords(text: string): string[] {
  const musicTerms = [
    'bass', 'drum', 'melody', 'chord', 'vocal', 'synth', 'beat',
    'trap', 'house', 'techno', 'hip hop', 'dnb', 'dubstep',
    'kick', 'snare', 'hi-hat', 'pad', 'lead', 'arpeggio',
    'reverb', 'delay', 'filter', 'distortion'
  ];

  const found: string[] = [];

  musicTerms.forEach(term => {
    if (text.includes(term)) {
      found.push(term);
    }
  });

  return found.slice(0, 10);
}

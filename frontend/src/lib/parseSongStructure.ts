import { Node, Edge } from 'reactflow';
import { CustomNodeData } from '@/components/CustomNode';

interface SongSection {
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'pre-chorus' | 'drop' | 'breakdown' | 'hook';
  name: string;
  instruments: string[];
  moods: string[];
  notes?: string;
}

export function detectSongStructure(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase();
  const sectionKeywords = [
    'intro', 'verse', 'chorus', 'bridge', 'outro',
    'pre-chorus', 'prechorus', 'drop', 'breakdown', 'hook',
    'section', 'part'
  ];

  // Check if transcript mentions song sections
  return sectionKeywords.some(keyword => lowerTranscript.includes(keyword));
}

export function parseSongStructureToGraph(transcript: string): { nodes: Node<CustomNodeData>[], edges: Edge[], isStructured: boolean } {
  const isStructured = detectSongStructure(transcript);

  if (!isStructured) {
    return { nodes: [], edges: [], isStructured: false };
  }

  const nodes: Node<CustomNodeData>[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;

  // Parse sections from transcript
  const sections = extractSections(transcript);

  // Extract song-level concepts (key, BPM, genre, overall mood)
  const songLevelNodes: Node<CustomNodeData>[] = [];
  const songLevelKey = extractSongKey(transcript);
  const songLevelBPM = extractSongBPM(transcript);
  const songLevelGenre = extractSongGenre(transcript);

  // Create section nodes with simple horizontal layout
  const sectionNodes: { [key: string]: string } = {};
  const allInstrumentIds: string[] = [];
  const allMoodIds: string[] = [];
  const sectionSpacing = 350;
  const nodeSpacing = 100;

  // First pass: identify instruments and moods that appear in multiple sections
  const instrumentTypeCounts: { [key: string]: number } = {};
  const moodNameCounts: { [key: string]: number } = {};
  
  sections.forEach(section => {
    section.instruments.forEach(instrument => {
      const instType = determineInstrumentType(instrument);
      instrumentTypeCounts[instType] = (instrumentTypeCounts[instType] || 0) + 1;
    });
    section.moods.forEach(mood => {
      moodNameCounts[mood] = (moodNameCounts[mood] || 0) + 1;
    });
  });

  sections.forEach((section, index) => {
    const sectionId = `section-${nodeId++}`;
    sectionNodes[section.name] = sectionId;

    // Calculate position - horizontal layout with vertical spacing for children
    const sectionX = index * sectionSpacing;
    const sectionY = 50;

    // Create main section node with section type
    nodes.push({
      id: sectionId,
      type: 'custom',
      data: {
        label: section.name,
        type: 'section',
        section: section.name,
        isSection: true,
      },
      position: { x: sectionX, y: sectionY },
    });

    // Create instrument sub-nodes below the section
    section.instruments.forEach((instrument, instIndex) => {
      const instrumentId = `inst-${nodeId++}`;
      allInstrumentIds.push(instrumentId);
      const instType = determineInstrumentType(instrument);

      nodes.push({
        id: instrumentId,
        type: 'custom',
        data: {
          label: instrument,
          type: instType,
          section: section.name,
        },
        position: {
          x: sectionX - 50 + (instIndex * 120),
          y: sectionY + 150
        },
      });

      // Connect instrument to section - dashed if appears in multiple sections
      const isCrossSection = instrumentTypeCounts[instType] > 1;
      edges.push({
        id: `edge-${sectionId}-${instrumentId}`,
        source: sectionId,
        target: instrumentId,
        type: 'default',
        animated: false,
        style: { 
          stroke: '#8b5cf6', 
          strokeWidth: 2, 
          ...(isCrossSection && { strokeDasharray: '5,5' })
        },
        markerEnd: { type: 'arrowclosed', color: '#8b5cf6' },
      });
    });

    // Create mood sub-nodes below instruments
    section.moods.forEach((mood, moodIndex) => {
      const moodId = `mood-${nodeId++}`;
      allMoodIds.push(moodId);

      nodes.push({
        id: moodId,
        type: 'custom',
        data: {
          label: mood,
          type: 'genre', // Use genre type for moods (pink)
          section: section.name,
        },
        position: {
          x: sectionX - 50 + (moodIndex * 120),
          y: sectionY + 280
        },
      });

      // Connect mood to section - dashed if appears in multiple sections
      const isCrossSection = moodNameCounts[mood] > 1;
      edges.push({
        id: `edge-${sectionId}-${moodId}`,
        source: sectionId,
        target: moodId,
        type: 'default',
        animated: false,
        style: { 
          stroke: '#ec4899', 
          strokeWidth: 2,
          ...(isCrossSection && { strokeDasharray: '5,5' })
        },
        markerEnd: { type: 'arrowclosed', color: '#ec4899' },
      });
    });

    // Connect to next section (directed graph)
    if (index < sections.length - 1) {
      const nextSectionId = `section-${index + 1}`;
      edges.push({
        id: `edge-${sectionId}-next`,
        source: sectionId,
        target: sectionNodes[sections[index + 1].name] || nextSectionId,
        type: 'default',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 4 },
        markerEnd: { type: 'arrowclosed', color: '#10b981' },
      });
    }
  });

  // Add cross-section connections for similar instruments/moods
  const instrumentsByType: { [key: string]: string[] } = {};
  const moodsByName: { [key: string]: string[] } = {};

  nodes.forEach(node => {
    if (allInstrumentIds.includes(node.id)) {
      const instType = node.data.type || 'unknown';
      if (!instrumentsByType[instType]) instrumentsByType[instType] = [];
      instrumentsByType[instType].push(node.id);
    }
    if (allMoodIds.includes(node.id)) {
      const moodName = node.data.label;
      if (!moodsByName[moodName]) moodsByName[moodName] = [];
      moodsByName[moodName].push(node.id);
    }
  });

  // Connect instruments of same type across sections (undirected)
  Object.values(instrumentsByType).forEach(instrumentIds => {
    for (let i = 0; i < instrumentIds.length - 1; i++) {
      edges.push({
        id: `edge-cross-inst-${instrumentIds[i]}-${instrumentIds[i + 1]}`,
        source: instrumentIds[i],
        target: instrumentIds[i + 1],
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
      });
    }
  });

  // Connect same moods across sections (undirected)
  Object.values(moodsByName).forEach(moodIds => {
    for (let i = 0; i < moodIds.length - 1; i++) {
      edges.push({
        id: `edge-cross-mood-${moodIds[i]}-${moodIds[i + 1]}`,
        source: moodIds[i],
        target: moodIds[i + 1],
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' },
      });
    }
  });

  // Add song-level nodes (genre, key, BPM) positioned above/to the side
  const totalWidth = sections.length * sectionSpacing;

  if (songLevelGenre) {
    const genreId = `song-genre-${nodeId++}`;
    nodes.push({
      id: genreId,
      type: 'custom',
      data: {
        label: songLevelGenre,
        type: 'genre',
      },
      position: { x: totalWidth / 2 - 100, y: -150 },
      style: {
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        border: '2px solid #ec4899',
        borderRadius: '8px',
      },
    });

    // Connect genre to all sections
    Object.values(sectionNodes).forEach(sectionId => {
      edges.push({
        id: `edge-genre-${sectionId}`,
        source: genreId,
        target: sectionId,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#ec4899', strokeWidth: 1.5, opacity: 0.5 },
      });
    });
  }

  if (songLevelKey) {
    const keyId = `song-key-${nodeId++}`;
    nodes.push({
      id: keyId,
      type: 'custom',
      data: {
        label: `Key: ${songLevelKey}`,
        type: 'chord',
      },
      position: { x: -200, y: 50 },
      style: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        border: '2px solid #8b5cf6',
        borderRadius: '8px',
      },
    });

    // Connect key to all melodic instruments
    allInstrumentIds.forEach(instId => {
      const node = nodes.find(n => n.id === instId);
      const melodicTypes = ['melody', 'synth', 'bassline', 'chord'];
      if (node && melodicTypes.includes(node.data.type || '')) {
        edges.push({
          id: `edge-key-${instId}`,
          source: keyId,
          target: instId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#8b5cf6', strokeWidth: 1.5, opacity: 0.4, strokeDasharray: '3,3' },
        });
      }
    });
  }

  if (songLevelBPM) {
    const bpmId = `song-bpm-${nodeId++}`;
    nodes.push({
      id: bpmId,
      type: 'custom',
      data: {
        label: `${songLevelBPM} BPM`,
        type: 'drum',
      },
      position: { x: totalWidth + 100, y: 50 },
      style: {
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '2px solid #ef4444',
        borderRadius: '8px',
      },
    });

    // Connect BPM to all rhythmic instruments
    allInstrumentIds.forEach(instId => {
      const node = nodes.find(n => n.id === instId);
      const rhythmTypes = ['drum', 'bassline'];
      if (node && rhythmTypes.includes(node.data.type || '')) {
        edges.push({
          id: `edge-bpm-${instId}`,
          source: bpmId,
          target: instId,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#ef4444', strokeWidth: 1.5, opacity: 0.4, strokeDasharray: '3,3' },
        });
      }
    });
  }

  return { nodes, edges, isStructured: true };
}

function extractSections(transcript: string): SongSection[] {
  const sections: SongSection[] = [];

  const sectionPattern = /(intro|verse|chorus|bridge|outro|pre-?chorus|drop|breakdown|hook)/gi;
  const instrumentPattern = /(bass|drum|guitar|piano|synth|vocal|pad|lead|strings|brass|percussion|hi-?hat|kick|snare|808)/gi;
  const moodPattern = /(energetic|calm|dark|bright|mellow|aggressive|uplifting|melancholic|happy|sad|intense|chill|dramatic|ambient|driving)/gi;

  // Find all section keywords and their positions
  let match;
  const sectionMatches: { index: number; type: string }[] = [];
  const regex = new RegExp(sectionPattern);

  // Reset regex
  const globalRegex = new RegExp(sectionPattern.source, 'gi');
  while ((match = globalRegex.exec(transcript)) !== null) {
    sectionMatches.push({
      index: match.index,
      type: match[0].toLowerCase().replace('-', '')
    });
  }

  // Extract content for each section
  sectionMatches.forEach((sectionMatch, idx) => {
    const startIdx = sectionMatch.index;
    const endIdx = idx < sectionMatches.length - 1 ? sectionMatches[idx + 1].index : transcript.length;
    const sectionText = transcript.substring(startIdx, endIdx);

    // Extract instruments from this section
    const instruments: string[] = [];
    const instRegex = new RegExp(instrumentPattern.source, 'gi');
    let instMatch;
    while ((instMatch = instRegex.exec(sectionText)) !== null) {
      const inst = instMatch[0].toLowerCase();
      const capitalized = capitalizeFirst(inst);
      if (!instruments.includes(capitalized)) {
        instruments.push(capitalized);
      }
    }

    // Extract moods from this section
    const moods: string[] = [];
    const moodRegex = new RegExp(moodPattern.source, 'gi');
    let moodMatch;
    while ((moodMatch = moodRegex.exec(sectionText)) !== null) {
      const mood = moodMatch[0].toLowerCase();
      const capitalized = capitalizeFirst(mood);
      if (!moods.includes(capitalized)) {
        moods.push(capitalized);
      }
    }

    sections.push({
      type: sectionMatch.type as SongSection['type'],
      name: capitalizeFirst(sectionMatch.type),
      instruments,
      moods,
      notes: sectionText.trim(),
    });
  });

  return sections;
}

function determineInstrumentType(instrument: string): CustomNodeData['type'] {
  const lowerInst = instrument.toLowerCase();

  if (lowerInst.includes('bass') || lowerInst.includes('808')) return 'bassline';
  if (lowerInst.includes('drum') || lowerInst.includes('kick') || lowerInst.includes('snare') || lowerInst.includes('hat')) return 'drum';
  if (lowerInst.includes('synth') || lowerInst.includes('pad')) return 'synth';
  if (lowerInst.includes('vocal') || lowerInst.includes('voice')) return 'vocal';
  if (lowerInst.includes('piano') || lowerInst.includes('guitar') || lowerInst.includes('lead')) return 'melody';

  return 'melody';
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function extractSongKey(transcript: string): string | null {
  const keyPattern = /(?:in|key of|key:?)\s*([A-G][#b]?m?)/i;
  const match = transcript.match(keyPattern);
  return match ? match[1].toUpperCase() : null;
}

function extractSongBPM(transcript: string): number | null {
  const bpmPattern = /(\d+)\s*bpm/i;
  const match = transcript.match(bpmPattern);
  return match ? parseInt(match[1]) : null;
}

function extractSongGenre(transcript: string): string | null {
  const genrePattern = /(hip[\s-]?hop|trap|house|techno|tech[\s-]?house|deep[\s-]?house|progressive[\s-]?house|dnb|drum[\s-]?and[\s-]?bass|dubstep|edm|pop|rock|jazz|funk|r&b|rnb|ambient|lo[\s-]?fi|lofi|trance|electro|disco|soul|reggae|country|blues|metal|indie|alternative|classical)/i;
  const match = transcript.match(genrePattern);
  return match ? capitalizeFirst(match[1].replace(/[\s-]/g, ' ')) : null;
}

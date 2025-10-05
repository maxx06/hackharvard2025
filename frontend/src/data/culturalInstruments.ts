export interface InstrumentRecommendation {
  id: string
  name: string
  culture: string
  genre: string
  description: string
  type: 'drum' | 'melody' | 'bassline' | 'synth' | 'vocal' | 'fx' | 'chord'
}


export const CULTURAL_INSTRUMENTS: InstrumentRecommendation[] = [
  // Latin
  { id: 'bongos', name: 'Bongos', culture: 'Latin', genre: 'Salsa, Latin, Merengue, Bachata', description: 'Drive rhythm in Latin music', type: 'drum' },
  { id: 'congas', name: 'Congas', culture: 'Latin', genre: 'Salsa, Latin, Merengue, Cha-cha', description: 'Foundational Latin percussion', type: 'drum' },
  { id: 'timbales', name: 'Timbales', culture: 'Latin', genre: 'Salsa, Latin, Mambo, Son', description: 'Sharp, cutting Latin drums', type: 'drum' },
  { id: 'trumpet-latin', name: 'Trumpet', culture: 'Latin', genre: 'Salsa, Mambo, Latin Jazz, Mariachi', description: 'Bold brass for energy', type: 'melody' },
  { id: 'classical-guitar', name: 'Classical Guitar', culture: 'Latin', genre: 'Bolero, Flamenco, Bossa Nova, Classical', description: 'Romantic, warm melodies', type: 'melody' },

  // Afrobeat/African
  { id: 'djembe', name: 'Djembe', culture: 'African', genre: 'Afrobeat, Hip-Hop, World Music, Tribal', description: 'Polyrhythmic talking drum', type: 'drum' },
  { id: 'talking-drum', name: 'Talking Drum', culture: 'African', genre: 'Afrobeat, Highlife, Soukous, Afro-Jazz', description: 'Tonal percussion with pitch', type: 'drum' },
  { id: 'balafon', name: 'Balafon', culture: 'African', genre: 'Afrobeat, World, Traditional African, Fusion', description: 'Wooden xylophone melodies', type: 'melody' },
  { id: 'kora', name: 'Kora', culture: 'African', genre: 'World, Ambient, Griot, Mande', description: 'Harp-like string instrument', type: 'melody' },

  // Brazilian
  { id: 'surdo', name: 'Surdo', culture: 'Brazilian', genre: 'Samba, Bossa Nova, Axé, Forró', description: 'Deep bass drum foundation', type: 'drum' },
  { id: 'tamborim', name: 'Tamborim', culture: 'Brazilian', genre: 'Samba, Pagode, Carnival, Batucada', description: 'High-pitched samba drum', type: 'drum' },
  { id: 'agogo', name: 'Agogô', culture: 'Brazilian', genre: 'Samba, Maracatu, Candomblé, MPB', description: 'Metal bell percussion', type: 'drum' },
  { id: 'cavaquinho', name: 'Cavaquinho', culture: 'Brazilian', genre: 'Samba, Choro, Pagode, MPB', description: 'Small guitar-like instrument', type: 'melody' },

  // J-pop/K-pop
  { id: 'bright-synth', name: 'Bright Synth', culture: 'J-pop', genre: 'J-pop, K-pop, EDM, City Pop, Future Bass', description: 'Clean electronic lead', type: 'synth' },
  { id: 'synth-pad', name: 'Synth Pad', culture: 'J-pop', genre: 'J-pop, Electronic, Vaporwave, Synthwave', description: 'Lush atmospheric layers', type: 'synth' },
  { id: 'vocoder', name: 'Vocoder', culture: 'J-pop', genre: 'J-pop, Electronic, Future Pop, Electropop', description: 'Robotic vocal effects', type: 'vocal' },

  // Chinese/Asian
  { id: 'guzheng', name: 'Guzheng', culture: 'Chinese', genre: 'Traditional, Ambient, C-Pop, Classical Chinese', description: 'Flowing pentatonic zither', type: 'melody' },
  { id: 'erhu', name: 'Erhu', culture: 'Chinese', genre: 'Traditional, Cinematic, Folk, Contemporary Chinese', description: 'Expressive two-string fiddle', type: 'melody' },
  { id: 'dizi', name: 'Dizi', culture: 'Chinese', genre: 'Traditional, Meditative, Classical Chinese, World', description: 'Bamboo flute', type: 'melody' },
  { id: 'pipa', name: 'Pipa', culture: 'Chinese', genre: 'Traditional, Classical Chinese, Contemporary, Fusion', description: 'Plucked lute instrument', type: 'melody' },

  // Indian
  { id: 'tabla', name: 'Tabla', culture: 'Indian', genre: 'Classical Indian, World, Bhangra, Bollywood', description: 'Complex rhythmic patterns', type: 'drum' },
  { id: 'sitar', name: 'Sitar', culture: 'Indian', genre: 'Classical Indian, Psychedelic, Fusion, Raga', description: 'Drone-based string instrument', type: 'melody' },
  { id: 'bansuri', name: 'Bansuri', culture: 'Indian', genre: 'Classical Indian, Meditative, Devotional, World', description: 'Bamboo flute', type: 'melody' },
  { id: 'tanpura', name: 'Tanpura', culture: 'Indian', genre: 'Classical Indian, Carnatic, Hindustani, Devotional', description: 'Continuous drone', type: 'chord' },

  // Middle Eastern
  { id: 'oud', name: 'Oud', culture: 'Middle Eastern', genre: 'Arabic, World, Turkish, Persian, Andalusian', description: 'Pear-shaped lute', type: 'melody' },
  { id: 'darbuka', name: 'Darbuka', culture: 'Middle Eastern', genre: 'Arabic, Belly Dance, Turkish, Balkan', description: 'Goblet drum', type: 'drum' },
  { id: 'qanun', name: 'Qanun', culture: 'Middle Eastern', genre: 'Arabic, Turkish, Classical Arabic, Sufi', description: 'Plucked zither', type: 'melody' },
  { id: 'ney', name: 'Ney', culture: 'Middle Eastern', genre: 'Arabic, Sufi, Persian, Ottoman', description: 'End-blown flute', type: 'melody' },

  // Caribbean/Reggae
  { id: 'steel-pan', name: 'Steel Pan', culture: 'Caribbean', genre: 'Calypso, Soca, Reggae, Caribbean Jazz, Ska', description: 'Bright metallic melodies', type: 'melody' },
  { id: 'reggae-bass', name: 'Reggae Bass', culture: 'Caribbean', genre: 'Reggae, Dub, Rocksteady, Dancehall, Roots', description: 'Deep, syncopated basslines', type: 'bassline' },

  // Flamenco
  { id: 'flamenco-guitar', name: 'Flamenco Guitar', culture: 'Spanish', genre: 'Flamenco, Latin, Rumba, Sevillanas', description: 'Passionate Spanish guitar', type: 'melody' },
  { id: 'palmas', name: 'Palmas', culture: 'Spanish', genre: 'Flamenco, Rumba Flamenca, Bulería, Fandango', description: 'Hand clap rhythms', type: 'drum' },
  { id: 'cajon', name: 'Cajón', culture: 'Spanish/Peruvian', genre: 'Flamenco, Acoustic, Latin Jazz, World Fusion', description: 'Box percussion', type: 'drum' },

  // Electronic/Modern
  { id: 'dubstep-bass', name: 'Dubstep Bass', culture: 'Electronic', genre: 'Dubstep, Bass Music, EDM, Trap', description: 'Heavy modulated bass', type: 'bassline' },
  { id: 'house-piano', name: 'House Piano', culture: 'Electronic', genre: 'House, Deep House, Tech House, Piano House', description: 'Classic house stabs', type: 'chord' },
  { id: 'trance-lead', name: 'Trance Lead', culture: 'Electronic', genre: 'Trance, Progressive, Psytrance, Uplifting', description: 'Euphoric lead synth', type: 'synth' },

  // Hip-Hop/Urban
  { id: '808-bass', name: '808 Bass', culture: 'Urban', genre: 'Hip-Hop, Trap, R&B, Urban', description: 'Deep sub bass', type: 'bassline' },
  { id: 'vinyl-scratch', name: 'Vinyl Scratch', culture: 'Urban', genre: 'Hip-Hop, Turntablism, DJ, Scratch', description: 'DJ scratch effects', type: 'fx' },
  { id: 'trap-hihat', name: 'Trap Hi-hat', culture: 'Urban', genre: 'Trap, Hip-Hop, Drill, Modern Rap', description: 'Rolling hi-hats', type: 'drum' }
]

export function getRecommendationsForGenre(genre: string): InstrumentRecommendation[] {
  const searchTerm = genre.toLowerCase()

  // Map common variations
  const cultureMappings: { [key: string]: string[] } = {
    'japanese': ['j-pop', 'jpop'],
    'jpop': ['j-pop', 'japanese'],
    'j-pop': ['jpop', 'japanese'],
    'korean': ['k-pop', 'kpop'],
    'kpop': ['k-pop', 'korean'],
    'k-pop': ['kpop', 'korean'],
    'latin': ['salsa', 'mambo', 'bolero'],
    'african': ['afrobeat'],
    'afrobeat': ['african'],
    'brazilian': ['samba', 'bossa'],
    'chinese': ['traditional'],
    'indian': ['classical'],
    'arabic': ['middle eastern'],
    'middle eastern': ['arabic'],
  }

  const searchTerms = [searchTerm, ...(cultureMappings[searchTerm] || [])]

  return CULTURAL_INSTRUMENTS.filter(inst => {
    const genreLower = inst.genre.toLowerCase()
    const cultureLower = inst.culture.toLowerCase()

    return searchTerms.some(term =>
      genreLower.includes(term) ||
      cultureLower.includes(term) ||
      term.includes(genreLower) ||
      term.includes(cultureLower)
    )
  })
}

export function getRecommendationsByGraph(nodes: any[]): InstrumentRecommendation[] {
  // No nodes = no recommendations
  if (nodes.length === 0) {
    return []
  }

  // Get genres/types from existing nodes
  const existingGenres = new Set<string>()
  const existingInstruments = new Set<string>()

  nodes.forEach(node => {
    if (node.data?.type === 'genre') {
      existingGenres.add(node.data.label.toLowerCase())
    }
    existingInstruments.add(node.data?.label?.toLowerCase() || '')
  })

  // If we have genre nodes, recommend instruments from those cultures
  if (existingGenres.size > 0) {
    const recommendations: InstrumentRecommendation[] = []
    existingGenres.forEach(genre => {
      const matching = getRecommendationsForGenre(genre)
      recommendations.push(...matching)
    })

    // Remove duplicates and already-added instruments
    return recommendations.filter((rec, index, self) =>
      self.findIndex(r => r.id === rec.id) === index &&
      !existingInstruments.has(rec.name.toLowerCase())
    ).slice(0, 8) // Limit to 8 recommendations
  }

  // If no genre nodes but has other nodes, show diverse selection based on what they have
  return CULTURAL_INSTRUMENTS
    .filter(rec => !existingInstruments.has(rec.name.toLowerCase()))
    .slice(0, 8)
}

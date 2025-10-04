'use client'

export function EdgeLegend() {
  const edgeTypes = [
    { name: 'Next (Sequential)', color: '#8b5cf6', description: 'Section flow: intro → verse' },
    { name: 'Has', color: '#10b981', description: 'Section contains: verse → drums' },
    { name: 'Blends With', color: '#06b6d4', description: 'Harmonic: melody ↔ chords' },
    { name: 'Supports', color: '#f59e0b', description: 'Rhythm: bass → drums' },
    { name: 'Influences', color: '#ec4899', description: 'Genre/mood: house → synth' },
  ]

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-800 p-4">
      <h3 className="text-sm font-semibold text-white mb-3">Edge Types</h3>
      <div className="space-y-2">
        {edgeTypes.map((type) => (
          <div key={type.name} className="flex items-center gap-2">
            <div
              className="w-8 h-0.5 rounded"
              style={{ backgroundColor: type.color }}
            />
            <div className="flex-1">
              <p className="text-xs font-medium text-slate-300">{type.name}</p>
              <p className="text-xs text-slate-500">{type.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

import { MusicGenerator } from "@/components/MusicGenerator"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">HackHarvard 2025</h1>
          <p className="text-lg text-gray-600">AI Music Generator</p>
        </div>
        <MusicGenerator />
      </div>
    </main>
  )
}

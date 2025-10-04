import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-16">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">Jamflow</span>
            </div>
            <nav className="flex items-center gap-3">
              <Link href="/graph">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                  Try Now
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800">
                Watch Demo
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-32 pb-20 sm:px-12 lg:px-16 min-h-screen flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400 sm:text-5xl lg:text-6xl mb-4">
              Jamflow
            </h1>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-400 max-w-3xl mx-auto">
              Visualize musical elements and discover compatible sounds with AI-powered knowledge graphs.
              Speak your ideas and watch them come to life.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-4">
              <Link href="/graph">
                <Button size="lg" className="text-base px-8 py-5 h-auto bg-violet-600 hover:bg-violet-700">
                  Try Now
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="text-base px-8 py-5 h-auto border-slate-700 hover:bg-slate-800">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Visual Demo Preview */}
          <div className="mt-12 relative max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-violet-600/20 blur-3xl rounded-full" />
            <div className="relative rounded-xl border border-violet-500/30 bg-slate-900/50 p-4 backdrop-blur-sm">
              <div className="aspect-video rounded-lg bg-slate-800/50 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Interactive demo preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Two Powerful Modes
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Intelligent parsing adapts to your creative workflow
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:border-violet-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-3">
                </div>
                <CardTitle className="text-lg text-white">Song Structure Mode</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Perfect for outlining complete tracks
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                <p className="mb-3">
                  Describe your song sections (intro, verse, chorus, bridge, outro) and watch a directed graph form automatically.
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Sequential flow visualization</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Instrument and mood sub-nodes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Directed edges show progression</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:border-indigo-500/50 transition-colors">
              <CardHeader>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center mb-3">
                </div>
                <CardTitle className="text-lg text-white">Sound Discovery Mode</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  Explore musical compatibility
                </CardDescription>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                <p className="mb-3">
                  Input general musical ideas and discover how they work together through intelligent relationship mapping.
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Harmonic key analysis (Circle of Fifths)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>BPM compatibility scoring</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Musical element relationships</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-6 py-20 sm:px-12 lg:px-16 bg-slate-900/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Powerful Features
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Everything you need to visualize and organize your musical ideas
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  Real-time Speech Input
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Speak naturally and watch your graph build in real-time. No typing needed.
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  Interactive Canvas
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Drag, drop, edit nodes and edges directly. Create custom connections with visual feedback.
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  Smart Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Musical theory-based edge scoring reveals which sounds work together and why.
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  Auto-Recalculation
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Add or edit nodes and edges update automatically based on musical relationships.
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  Musical Theory
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Circle of Fifths key compatibility, rhythm section pairing, and harmonic analysis.
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  Visual Highlights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300 text-sm">
                Click nodes or edges to see compatible connections light up with detailed scoring.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to visualize your music?
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            Start building your musical knowledge graph today. No installation required.
          </p>
          <div className="mt-8">
            <Link href="/graph">
              <Button size="lg" className="text-base px-10 bg-violet-600 hover:bg-violet-700">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 sm:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-center text-slate-400 text-sm">
            Built for HackHarvard 2025 • Jamflow
          </p>
        </div>
      </footer>
    </div>
  );
}

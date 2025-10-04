import Link from 'next/link';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, X, Play, Music, Mic, Headphones, Guitar, Drum, Piano, Volume2 } from "lucide-react"
import WorldMusicRotator from "@/components/WorldMusicRotator"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Enhanced blue aura blobs */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary aura blobs */}
        <div className="absolute top-1/8 left-1/12 w-52 h-52 bg-gradient-radial from-blue-500/32 via-blue-400/18 to-transparent rounded-full blur-3xl animate-pulse" />
        
        <div className="absolute top-1/3 right-1/8 w-76 h-76 bg-gradient-radial from-cyan-500/28 via-cyan-400/16 to-transparent rounded-full blur-2xl animate-bounce" style={{animationDuration: '9s'}} />
        
        <div className="absolute top-5/6 left-1/6 w-44 h-44 bg-gradient-radial from-indigo-500/26 via-indigo-400/14 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />
        
        <div className="absolute bottom-1/8 right-1/12 w-64 h-64 bg-gradient-radial from-sky-500/30 via-sky-400/17 to-transparent rounded-full blur-2xl animate-bounce" style={{animationDuration: '6s', animationDelay: '1s'}} />
        
        <div className="absolute bottom-1/4 left-1/4 w-58 h-58 bg-gradient-radial from-blue-400/24 via-blue-300/13 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}} />
        
        <div className="absolute top-2/5 right-1/3 w-48 h-48 bg-gradient-radial from-cyan-400/22 via-cyan-300/12 to-transparent rounded-full blur-2xl animate-bounce" style={{animationDuration: '7s', animationDelay: '4s'}} />
        
        <div className="absolute bottom-3/5 left-1/8 w-72 h-72 bg-gradient-radial from-indigo-400/20 via-indigo-300/11 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        
        <div className="absolute top-7/8 right-1/5 w-56 h-56 bg-gradient-radial from-sky-400/26 via-sky-300/15 to-transparent rounded-full blur-2xl animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}} />
        
        {/* Additional accent auras */}
        <div className="absolute top-1/12 left-1/3 w-40 h-40 bg-gradient-radial from-blue-300/18 via-blue-200/10 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '5s'}} />
        
        <div className="absolute top-1/2 right-1/12 w-36 h-36 bg-gradient-radial from-cyan-300/16 via-cyan-200/8 to-transparent rounded-full blur-3xl animate-bounce" style={{animationDuration: '8s', animationDelay: '3s'}} />
        
        <div className="absolute bottom-1/12 left-1/2 w-48 h-48 bg-gradient-radial from-indigo-300/14 via-indigo-200/7 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '6s'}} />
        
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-gradient-radial from-sky-300/20 via-sky-200/12 to-transparent rounded-full blur-3xl animate-bounce" style={{animationDuration: '10s', animationDelay: '1s'}} />
        
        <div className="absolute bottom-1/6 left-1/12 w-44 h-44 bg-gradient-radial from-blue-200/12 via-blue-100/6 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}} />
        
        <div className="absolute top-1/6 right-1/2 w-38 h-38 bg-gradient-radial from-cyan-200/14 via-cyan-100/8 to-transparent rounded-full blur-3xl animate-bounce" style={{animationDuration: '11s', animationDelay: '2s'}} />
        
        <div className="absolute bottom-2/5 right-1/6 w-42 h-42 bg-gradient-radial from-indigo-200/16 via-indigo-100/9 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '7s'}} />
        
        <div className="absolute top-2/3 left-1/3 w-34 h-34 bg-gradient-radial from-sky-200/18 via-sky-100/10 to-transparent rounded-full blur-3xl animate-bounce" style={{animationDuration: '12s', animationDelay: '3s'}} />
        
        {/* Additional bottom-right aura */}
        <div className="absolute bottom-1/12 right-1/8 w-46 h-46 bg-gradient-radial from-blue-400/22 via-blue-300/14 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '8s'}} />
        
        {/* Condensed visible blobs */}
        <div className="absolute top-1/4 left-1/2 w-60 h-60 bg-gradient-radial from-blue-500/45 via-blue-400/28 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '9s'}} />
        
        <div className="absolute top-1/2 right-1/4 w-68 h-68 bg-gradient-radial from-cyan-500/42 via-cyan-400/25 to-transparent rounded-full blur-3xl animate-bounce" style={{animationDuration: '6s', animationDelay: '10s'}} />
        
        <div className="absolute bottom-1/3 left-1/5 w-56 h-56 bg-gradient-radial from-indigo-500/40 via-indigo-400/24 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '11s'}} />
        
        <div className="absolute top-3/4 right-1/3 w-64 h-64 bg-gradient-radial from-sky-500/38 via-sky-400/22 to-transparent rounded-full blur-3xl animate-bounce" style={{animationDuration: '7s', animationDelay: '12s'}} />
        
        <div className="absolute bottom-1/5 left-1/3 w-52 h-52 bg-gradient-radial from-blue-400/44 via-blue-300/26 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '13s'}} />
        
        <div className="absolute top-1/6 left-1/4 w-58 h-58 bg-gradient-radial from-cyan-400/36 via-cyan-300/20 to-transparent rounded-full blur-3xl animate-bounce" style={{animationDuration: '8s', animationDelay: '14s'}} />
        
        {/* Additional bottom-right blob */}
        <div className="absolute bottom-1/8 right-1/6 w-62 h-62 bg-gradient-radial from-blue-500/38 via-blue-400/22 to-transparent rounded-full blur-2xl animate-pulse" style={{animationDelay: '15s'}} />
      </div>

      <div className="relative z-10">
        <header className="border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                 <div className="flex items-center gap-2 group">
                   <div className="relative">
                     <svg className="size-8 text-slate-300 group-hover:text-blue-400 transition-colors duration-300" viewBox="0 0 32 32" fill="currentColor">
                    <rect x="2" y="8" width="3" height="16" rx="1.5" />
                    <rect x="7" y="4" width="3" height="24" rx="1.5" />
                    <rect x="12" y="10" width="3" height="12" rx="1.5" />
                    <rect x="17" y="6" width="3" height="20" rx="1.5" />
                    <rect x="22" y="12" width="3" height="8" rx="1.5" />
                    <rect x="27" y="8" width="3" height="16" rx="1.5" />
                  </svg>
                     <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500/60 rounded-full animate-ping" />
                   </div>
                   <span className="font-bold text-xl text-white ml-2">
                     JAMFUSION
                   </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/graph">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full px-6 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                    Try Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="container mx-auto px-6 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8 animate-fade-in-up">
               <div className="space-y-4">
                 <h1 className="text-5xl lg:text-6xl font-thin tracking-tight leading-tight text-white">
                   Music Creation & 
                   <span className="text-slate-300">
                     {" "}Visualization
                   </span>
              </h1>
               </div>

               <p className="text-lg text-slate-300 leading-relaxed max-w-xl font-thin">
                 Built for musicians and creators. Speak your ideas, visualize relationships, and generate music instantly by combining cultures and musical traditions with state-of-the-art AI technology.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/graph">
                  <Button
                    size="lg"
                    className="text-base px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    Get Started
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 rounded-full transition-all duration-300"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Column - Demo Visualization */}
            <div className="space-y-6 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <Card className="overflow-hidden bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 group">
                <div className="aspect-video bg-gradient-to-br from-slate-800/30 to-slate-700/30 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-600/5 to-slate-500/5 animate-pulse" />
                  <Link href="/graph">
                    <button className="size-20 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-xl hover:shadow-blue-500/25 group-hover:shadow-2xl">
                      <Play className="size-8 text-white ml-1" />
                    </button>
                  </Link>
                </div>
              </Card>

              {/* World Music Instruments Rotator */}
              <WorldMusicRotator />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

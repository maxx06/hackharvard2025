import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, X } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle dark blue gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-800/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-border/50 bg-background sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                  <svg className="size-8" viewBox="0 0 32 32" fill="currentColor">
                    <rect x="2" y="8" width="3" height="16" rx="1.5" />
                    <rect x="7" y="4" width="3" height="24" rx="1.5" />
                    <rect x="12" y="10" width="3" height="12" rx="1.5" />
                    <rect x="17" y="6" width="3" height="20" rx="1.5" />
                    <rect x="22" y="12" width="3" height="8" rx="1.5" />
                    <rect x="27" y="8" width="3" height="16" rx="1.5" />
                  </svg>
                  <span className="font-semibold text-base text-foreground ml-2">MUSIC.AI</span>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                  <button className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 transition-colors">
                    Products & Services
                    <ChevronDown className="size-4" />
                  </button>
                  <button className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 transition-colors">
                    Solutions
                    <ChevronDown className="size-4" />
                  </button>
                  <button className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 transition-colors">
                    Resources
                    <ChevronDown className="size-4" />
                  </button>
                  <button className="flex items-center gap-1 text-sm text-foreground hover:text-foreground/80 transition-colors">
                    Company
                    <ChevronDown className="size-4" />
                  </button>
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <button className="text-sm text-foreground hover:text-foreground/80 transition-colors">Login</button>
                <Button size="sm" className="bg-white hover:bg-white/90 text-black font-medium rounded-full px-6">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-muted/30 border-b border-border/30">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">
                Looking to practice, perform, or process music? Try our Moises app made for musicians and producers.{" "}
                <a href="#" className="underline hover:text-primary transition-colors">
                  Click here
                </a>
              </p>
              <button className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <section className="container mx-auto px-6 py-20 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-foreground">
                AI Audio Models to Power Your Music Business
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Built for scale and powered by state-of-the-art, ethical AI solutions for audio and music
                applications—delivering the highest-quality audio separation available.
              </p>

              <div className="pt-2">
                <Button size="lg" className="text-base px-8 bg-primary hover:bg-primary/90 text-white rounded-full">
                  Contact Sales
                </Button>
              </div>
            </div>

            {/* Right Column - Demo Visualization */}
            <div className="space-y-4">
              <Card className="overflow-hidden bg-card/50 border-border/50 backdrop-blur-sm">
                <div className="aspect-video bg-secondary/30 flex items-center justify-center">
                  <button className="size-20 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                    <svg className="size-10 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                </div>
              </Card>

              {/* Stem Pills */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { icon: "🎵", label: "Original", active: true },
                  { icon: "🎤", label: "Vocals", active: false },
                  { icon: "🎸", label: "Bass", active: false },
                  { icon: "🥁", label: "Drums", active: false },
                  { icon: "🎹", label: "Guitar", active: false },
                ].map((item, i) => (
                  <Card
                    key={i}
                    className={`p-4 text-center space-y-2 border-border/50 ${
                      item.active ? "bg-card border-primary/30" : "bg-card/30"
                    }`}
                  >
                    <div className="text-2xl opacity-50">{item.icon}</div>
                    <p className={`text-xs ${item.active ? "text-foreground" : "text-muted-foreground"}`}>
                      {item.label}
                    </p>
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div
                          key={j}
                          className={`size-1 rounded-full ${item.active ? "bg-primary" : "bg-muted-foreground/20"}`}
                        />
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { motion } from "framer-motion";
import { useState } from "react";
import { X, Monitor, Smartphone, ScanFace, BarChart3, MapPin, Shield } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const screenshots = [
  {
    title: "Landing Page",
    desc: "The futuristic hero section with VisionTrack AI branding and quick access to all features.",
    icon: Monitor,
    gradient: "from-primary/30 to-accent/20",
    mockType: "hero" as const,
  },
  {
    title: "Dashboard & Scanner",
    desc: "Upload a photo and scan the database for potential matches with real-time progress tracking.",
    icon: ScanFace,
    gradient: "from-accent/30 to-primary/20",
    mockType: "dashboard" as const,
  },
  {
    title: "AI Classification",
    desc: "Advanced image classification powered by deep learning with confidence scores and prediction breakdown.",
    icon: BarChart3,
    gradient: "from-primary/20 to-accent/30",
    mockType: "classify" as const,
  },
  {
    title: "Case Management",
    desc: "Report and track missing persons with detailed case information, photos, and status tracking.",
    icon: Shield,
    gradient: "from-destructive/20 to-primary/20",
    mockType: "cases" as const,
  },
  {
    title: "Nationwide Coverage Map",
    desc: "Interactive map showing all reported cases and real-time tracking across Egypt's governorates.",
    icon: MapPin,
    gradient: "from-accent/20 to-primary/30",
    mockType: "map" as const,
  },
  {
    title: "Mobile Responsive",
    desc: "Fully optimized for mobile devices, allowing field agents and families to use the platform on the go.",
    icon: Smartphone,
    gradient: "from-primary/30 to-accent/10",
    mockType: "mobile" as const,
  },
];

const MockScreen = ({ type }: { type: string }) => {
  const base = "w-full h-full flex flex-col";

  if (type === "hero") {
    return (
      <div className={`${base} items-center justify-center bg-gradient-to-br from-background to-secondary/50 p-6`}>
        <div className="w-16 h-16 rounded-full bg-primary/30 mb-4 animate-pulse-neon" />
        <div className="h-6 w-48 bg-primary/40 rounded mb-2" />
        <div className="h-3 w-64 bg-muted-foreground/20 rounded mb-6" />
        <div className="flex gap-3">
          <div className="h-8 w-28 bg-primary/50 rounded-lg" />
          <div className="h-8 w-28 border border-primary/30 rounded-lg" />
        </div>
      </div>
    );
  }

  if (type === "dashboard") {
    return (
      <div className={`${base} bg-background p-4`}>
        <div className="flex gap-3 mb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-14 glass rounded-lg p-2">
              <div className="h-2 w-8 bg-primary/40 rounded mb-1" />
              <div className="h-4 w-12 bg-primary/60 rounded" />
            </div>
          ))}
        </div>
        <div className="flex-1 glass rounded-lg p-3">
          <div className="h-3 w-20 bg-accent/40 rounded mb-3" />
          <div className="h-24 w-full bg-primary/10 rounded-lg border-2 border-dashed border-primary/30 flex items-center justify-center">
            <ScanFace className="w-8 h-8 text-primary/40" />
          </div>
          <div className="mt-3 h-6 w-full bg-primary/20 rounded-lg relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-2/3 bg-primary/40 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (type === "classify") {
    return (
      <div className={`${base} bg-background p-4`}>
        <div className="flex gap-3 flex-1">
          <div className="flex-1 glass rounded-lg p-3 flex items-center justify-center">
            <div className="w-20 h-20 rounded-lg bg-primary/20 border border-primary/30" />
          </div>
          <div className="flex-1 glass rounded-lg p-3">
            <div className="h-3 w-16 bg-accent/50 rounded mb-3" />
            {[92, 78, 45, 23].map((w, i) => (
              <div key={i} className="mb-2">
                <div className="h-2 w-16 bg-muted-foreground/20 rounded mb-1" />
                <div className="h-3 w-full bg-secondary rounded overflow-hidden">
                  <div className="h-full bg-primary/50 rounded" style={{ width: `${w}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "cases") {
    return (
      <div className={`${base} bg-background p-4`}>
        <div className="flex gap-2 mb-3">
          <div className="h-6 w-16 bg-primary/30 rounded-full" />
          <div className="h-6 w-20 bg-destructive/30 rounded-full" />
          <div className="h-6 w-16 bg-accent/30 rounded-full" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-lg p-2 mb-2 flex gap-3 items-center">
            <div className="w-10 h-10 rounded-lg bg-muted" />
            <div className="flex-1">
              <div className="h-2 w-24 bg-foreground/20 rounded mb-1" />
              <div className="h-2 w-16 bg-muted-foreground/20 rounded" />
            </div>
            <div className={`h-4 w-14 rounded-full ${i === 1 ? 'bg-destructive/40' : i === 2 ? 'bg-primary/40' : 'bg-accent/40'}`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "map") {
    return (
      <div className={`${base} bg-background p-4`}>
        <div className="flex-1 glass rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/50" />
          {[
            { top: "20%", left: "30%" }, { top: "40%", left: "60%" },
            { top: "60%", left: "40%" }, { top: "35%", left: "70%" },
            { top: "50%", left: "25%" },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary animate-pulse-neon"
              style={{ top: pos.top, left: pos.left }}
            />
          ))}
          <div className="absolute bottom-2 left-2 glass rounded p-1.5">
            <div className="h-2 w-16 bg-primary/40 rounded" />
          </div>
        </div>
      </div>
    );
  }

  // mobile
  return (
    <div className={`${base} items-center justify-center bg-background p-6`}>
      <div className="w-32 h-56 border-2 border-border rounded-2xl p-2 relative">
        <div className="w-8 h-1 bg-border rounded-full mx-auto mb-2" />
        <div className="h-6 bg-primary/20 rounded mb-1" />
        <div className="h-3 w-full bg-muted rounded mb-2" />
        <div className="h-16 bg-secondary/50 rounded border border-dashed border-primary/20 flex items-center justify-center">
          <ScanFace className="w-5 h-5 text-primary/30" />
        </div>
        <div className="mt-2 h-4 bg-primary/30 rounded" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-1 bg-border rounded-full" />
      </div>
    </div>
  );
};

const Gallery = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-display tracking-[0.5em] uppercase text-accent neon-text-green mb-4">
            Product Showcase
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-[0.15em] mb-4">
            Screenshots <span className="text-primary neon-text">Gallery</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Explore the different screens and features of VisionTrack AI — from the landing page to the AI scanner and case management system.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screenshots.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelected(i)}
              className="group cursor-pointer"
            >
              <div className="glass rounded-xl overflow-hidden hover:neon-border transition-all duration-500">
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-secondary/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                  <span className="ml-2 text-[10px] text-muted-foreground font-display tracking-wider">
                    visiontrack.ai — {s.title}
                  </span>
                </div>
                {/* Mock screen */}
                <div className={`h-52 bg-gradient-to-br ${s.gradient}`}>
                  <MockScreen type={s.mockType} />
                </div>
                {/* Label */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="w-4 h-4 text-primary" />
                    <h3 className="font-display text-sm font-bold tracking-wider">{s.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lightbox */}
        <Dialog open={selected !== null} onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-3xl p-0 overflow-hidden bg-card border-border">
            {selected !== null && (
              <>
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-secondary/30">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-accent/60" />
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                  <span className="ml-2 text-xs text-muted-foreground font-display tracking-wider">
                    visiontrack.ai — {screenshots[selected].title}
                  </span>
                </div>
                <div className="h-[400px]">
                  <MockScreen type={screenshots[selected].mockType} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {(() => { const Icon = screenshots[selected].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                    <h3 className="font-display text-lg font-bold tracking-wider">{screenshots[selected].title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{screenshots[selected].desc}</p>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Gallery;

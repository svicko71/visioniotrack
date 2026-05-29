import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield, Radio, Activity, Camera, Zap, Clock, AlertTriangle,
  Send, FileDown, Siren, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";

// Approximate normalized SVG coords (viewBox 0 0 400 500) for Egypt
const CITIES = [
  { name: "Alexandria", x: 130, y: 60,  risk: "low",  cam: "CAM-ALX-04", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" },
  { name: "Port Said",  x: 215, y: 70,  risk: "low",  cam: "CAM-PSD-01", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" },
  { name: "Tanta",      x: 165, y: 95,  risk: "med",  cam: "CAM-TNT-07", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4" },
  { name: "Mansoura",   x: 195, y: 90,  risk: "low",  cam: "CAM-MNS-02", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
  { name: "Cairo",      x: 175, y: 130, risk: "high", cam: "CAM-CAI-12", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
  { name: "Giza",       x: 165, y: 138, risk: "high", cam: "CAM-GIZ-08", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
  { name: "Luxor",      x: 230, y: 320, risk: "med",  cam: "CAM-LXR-03", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" },
  { name: "Aswan",      x: 235, y: 400, risk: "low",  cam: "CAM-ASW-05", feed: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4" },
] as const;

type City = typeof CITIES[number];


const ALERTS = [
  { id: 1, place: "Ramses Station",  msg: "Unusual crowd density",     time: "14 min ago", severity: "HIGH" },
  { id: 2, place: "Haram Street",    msg: "Unattended child detected", time: "31 min ago", severity: "HIGH" },
  { id: 3, place: "Alexandria Port", msg: "Suspicious movement pattern", time: "2 hrs ago", severity: "MED" },
];

const CROWD = [
  { loc: "Tahrir", pct: 87 },
  { loc: "Ramses", pct: 64 },
  { loc: "Haram",  pct: 45 },
  { loc: "Maadi",  pct: 23 },
];

const NODES = [
  { id: "EDGE-03", city: "Luxor",      status: "ONLINE",   load: 34, ping: "2s ago" },
  { id: "EDGE-09", city: "Giza",       status: "ONLINE",   load: 67, ping: "1s ago" },
  { id: "EDGE-14", city: "Aswan",      status: "ONLINE",   load: 12, ping: "3s ago" },
  { id: "EDGE-17", city: "Tanta",      status: "ONLINE",   load: 89, ping: "1s ago" },
  { id: "EDGE-27", city: "Cairo",      status: "ONLINE",   load: 55, ping: "2s ago" },
  { id: "EDGE-30", city: "Alexandria", status: "ONLINE",   load: 43, ping: "4s ago" },
  { id: "EDGE-47", city: "Mansoura",   status: "DEGRADED", load: 91, ping: "8s ago" },
  { id: "EDGE-52", city: "Port Said",  status: "OFFLINE",  load: 0,  ping: "47s ago" },
];

const cityFill = (r: string) =>
  r === "high" ? "hsl(var(--destructive))" :
  r === "med"  ? "hsl(38 95% 55%)" :
                 "hsl(var(--primary))";

const statusColor = (s: string) =>
  s === "ONLINE"   ? "text-accent" :
  s === "DEGRADED" ? "text-amber-400" :
                     "text-destructive";

const statusDot = (s: string) =>
  s === "ONLINE"   ? "bg-accent" :
  s === "DEGRADED" ? "bg-amber-400" :
                     "bg-destructive";

const UrbanShield = () => {
  const [cameras, setCameras] = useState(847);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<City>(CITIES[4]); // Cairo
  const [hover, setHover] = useState<City | null>(null);


  useEffect(() => {
    const i = setInterval(() => {
      setCameras((c) => Math.max(820, Math.min(900, c + Math.floor((Math.random() - 0.5) * 6))));
      setTick((t) => t + 1);
    }, 1500);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="py-8 px-4 min-h-screen">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* HERO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-primary/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground">
              <ShieldCheck className="w-3 h-3 text-accent" /> Vision Track · Proactive Layer
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-[0.15em] uppercase mt-2">
              Urban <span className="text-primary neon-text">Shield</span>
            </h1>
            <p className="text-xs md:text-sm font-display tracking-widest text-muted-foreground uppercase mt-2">
              Proactive City Protection · Real-Time Geo-Intelligence
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 bg-accent/10 self-start md:self-end">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <span className="text-[11px] font-display tracking-widest uppercase text-accent">
          </div>
        </motion.div>

        {/* MAP + LIVE CAMERA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* MAP + LIVE CAMERA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* MAP */}
          <div className="glass rounded-xl border border-primary/20 p-5 relative overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                <Radio className="w-4 h-4" /> Live Geo-Network · Egypt
              </h3>
              <div className="text-[10px] font-display tracking-widest uppercase text-accent flex items-center gap-2">
                <Camera className="w-3 h-3" />
                <span className="font-mono text-base text-primary neon-text">{cameras}</span>
                <span className="text-muted-foreground">cameras active</span>
              </div>
            </div>

            <div className="relative w-full" style={{ height: 680 }}>
              <svg viewBox="0 0 400 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <radialGradient id="risk-high" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(var(--destructive))" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="risk-clear" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0" />
                  </radialGradient>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--primary)/0.08)" strokeWidth="0.5" />
                  </pattern>
                </defs>

                <rect width="400" height="500" fill="url(#grid)" />

                {/* Stylized Egypt outline */}
                <path
                  d="M 110 50 L 240 55 L 260 90 L 245 130 L 270 180 L 285 250 L 280 340 L 260 420 L 230 470 L 200 470 L 175 420 L 165 360 L 150 280 L 140 200 L 120 130 Z"
                  fill="hsl(var(--primary)/0.05)"
                  stroke="hsl(var(--primary)/0.4)"
                  strokeWidth="1.5"
                />

                {/* Connection lines */}
                {CITIES.map((a, i) =>
                  CITIES.slice(i + 1).map((b, j) => (
                    <line
                      key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="hsl(var(--primary)/0.15)" strokeWidth="0.5" strokeDasharray="2 3"
                    />
                  ))
                )}

                {/* Risk halos */}
                {CITIES.map((c) => (
                  <circle key={`halo-${c.name}`} cx={c.x} cy={c.y} r="32"
                    fill={c.risk === "high" ? "url(#risk-high)" : "url(#risk-clear)"} />
                ))}

                {/* Pulse rings on high-risk */}
                {CITIES.filter(c => c.risk === "high").map((c) => (
                  <g key={`pulse-${c.name}`}>
                    <circle cx={c.x} cy={c.y} r="14" fill="none"
                      stroke="hsl(var(--destructive))" strokeWidth="0.8" opacity="0.6">
                      <animate attributeName="r" values="6;22;6" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  </g>
                ))}

                {/* City nodes — interactive */}
                {CITIES.map((c) => {
                  const isSel = selected?.name === c.name;
                  return (
                    <g
                      key={c.name}
                      className="cursor-pointer"
                      onClick={() => { setSelected(c); toast.success(`Connected to ${c.cam} · ${c.name}`); }}
                      onMouseEnter={() => setHover(c)}
                      onMouseLeave={() => setHover(null)}
                    >
                      {/* invisible hit target */}
                      <circle cx={c.x} cy={c.y} r="18" fill="transparent" />
                      <circle cx={c.x} cy={c.y} r={isSel ? 5.5 : 3.5} fill={cityFill(c.risk)}>
                        <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <circle cx={c.x} cy={c.y} r={isSel ? 10 : 6} fill="none"
                        stroke={cityFill(c.risk)} strokeWidth={isSel ? 1.4 : 0.8}
                        opacity={isSel ? 0.9 : 0.5} />
                      {isSel && (
                        <circle cx={c.x} cy={c.y} r="14" fill="none" stroke="hsl(var(--accent))" strokeWidth="1">
                          <animate attributeName="r" values="10;18;10" dur="1.6s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0;1" dur="1.6s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <text x={c.x + 9} y={c.y + 3} fontSize="9"
                        fill={isSel ? "hsl(var(--accent))" : "hsl(var(--foreground))"}
                        fontFamily="Orbitron, monospace" letterSpacing="1">
                        {c.name.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* Hover tooltip */}
                {hover && (
                  <g pointerEvents="none">
                    <rect x={hover.x + 14} y={hover.y - 28} width="92" height="34" rx="3"
                      fill="hsl(var(--background)/0.92)" stroke="hsl(var(--primary)/0.5)" strokeWidth="0.6" />
                    <text x={hover.x + 19} y={hover.y - 16} fontSize="6.5" fill="hsl(var(--primary))"
                      fontFamily="Orbitron, monospace" letterSpacing="0.8">{hover.cam}</text>
                    <text x={hover.x + 19} y={hover.y - 7} fontSize="5.5" fill="hsl(var(--muted-foreground))"
                      fontFamily="Orbitron, monospace" letterSpacing="0.6">
                      RISK · {hover.risk.toUpperCase()} · CLICK TO VIEW
                    </text>
                  </g>
                )}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] font-display tracking-widest uppercase bg-background/70 backdrop-blur px-3 py-2 rounded-lg border border-primary/20">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Clear</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Watch</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-destructive animate-pulse" /> High-Risk</span>
              </div>

              <div className="absolute top-3 right-3 text-[10px] font-display tracking-widest uppercase bg-background/70 backdrop-blur px-3 py-2 rounded-lg border border-primary/20 text-muted-foreground">
                Click a node → live feed
              </div>
            </div>
          </div>

          {/* LIVE CAMERA FEED */}
          <div className="glass rounded-xl border border-primary/20 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                <Camera className="w-4 h-4" /> Live Camera
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-display tracking-widest uppercase text-destructive">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> REC · LIVE
              </span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-primary/30 bg-black aspect-video">
              <video
                key={selected.cam}
                src={selected.feed}
                autoPlay muted loop playsInline
                className="w-full h-full object-cover"
              />
              {/* HUD overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 text-[10px] font-display tracking-widest uppercase text-accent bg-black/50 px-2 py-0.5 rounded">
                  {selected.cam}
                </div>
                <div className="absolute top-2 right-2 text-[10px] font-display tracking-widest uppercase text-accent bg-black/50 px-2 py-0.5 rounded">
                  {selected.name.toUpperCase()}
                </div>
                <div className="absolute bottom-2 left-2 text-[9px] font-mono text-accent bg-black/50 px-2 py-0.5 rounded">
                  {new Date().toISOString().slice(11, 19)} · 1080p · 30 FPS
                </div>
                <div className="absolute bottom-2 right-2 text-[9px] font-mono text-accent bg-black/50 px-2 py-0.5 rounded">
                  YOLOv8 · ONLINE
                </div>
                {/* corner brackets */}
                <div className="absolute top-1 left-1 w-3 h-3 border-l-2 border-t-2 border-accent" />
                <div className="absolute top-1 right-1 w-3 h-3 border-r-2 border-t-2 border-accent" />
                <div className="absolute bottom-1 left-1 w-3 h-3 border-l-2 border-b-2 border-accent" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-r-2 border-b-2 border-accent" />
                {/* simulated bbox */}
                <div className="absolute border-2 border-accent/80"
                  style={{ left: "32%", top: "38%", width: "22%", height: "34%" }}>
                  <div className="absolute -top-4 left-0 text-[9px] font-mono text-accent bg-black/70 px-1">
                    person · 0.94
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-display tracking-widest uppercase">
              <div className="p-2 rounded bg-secondary/40 border border-border">
                <div className="text-muted-foreground">Status</div>
                <div className="text-accent">CONNECTED</div>
              </div>
              <div className="p-2 rounded bg-secondary/40 border border-border">
                <div className="text-muted-foreground">Latency</div>
                <div className="text-primary">{42 + (tick % 9)}ms</div>
              </div>
              <div className="p-2 rounded bg-secondary/40 border border-border">
                <div className="text-muted-foreground">Risk</div>
                <div className={selected.risk === "high" ? "text-destructive" : selected.risk === "med" ? "text-amber-400" : "text-accent"}>
                  {selected.risk.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="mt-3 max-h-32 overflow-y-auto space-y-1 text-[10px] font-mono">
              {CITIES.map((c) => (
                <button
                  key={c.cam}
                  onClick={() => { setSelected(c); toast.success(`Switched to ${c.cam}`); }}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded border transition-colors ${
                    selected.cam === c.cam
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  }`}
                >
                  <span>{c.cam}</span>
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>


        </motion.div>

        {/* ALERT ZONES PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Geo-fence alerts */}
          <div className="glass rounded-xl border border-primary/20 p-5">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4" /> Geo-Fence Alerts
            </h3>
            <div className="space-y-3">
              {ALERTS.map((a) => (
                <div key={a.id} className="p-3 rounded-lg bg-secondary/40 border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-xs font-bold tracking-wider text-foreground truncate">{a.place}</span>
                    <span className={`text-[9px] font-display tracking-widest uppercase px-2 py-0.5 rounded-full border ${
                      a.severity === "HIGH"
                        ? "bg-destructive/15 text-destructive border-destructive/40"
                        : "bg-amber-500/15 text-amber-400 border-amber-500/40"
                    }`}>{a.severity}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.msg}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.time}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => toast.success(`Dispatched units to ${a.place}`)}
                      className="h-7 text-[10px] font-display tracking-widest uppercase bg-primary/90 text-primary-foreground hover:bg-primary px-3"
                    >
                      Dispatch
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crowd analytics */}
          <div className="glass rounded-xl border border-primary/20 p-5">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4" /> Crowd Density · Last Hour
            </h3>
            <div className="space-y-3">
              {CROWD.map((c) => (
                <div key={c.loc}>
                  <div className="flex justify-between text-[11px] font-display tracking-widest uppercase mb-1">
                    <span className="text-muted-foreground">{c.loc}</span>
                    <span className={c.pct > 70 ? "text-destructive" : c.pct > 50 ? "text-amber-400" : "text-accent"}>
                      {c.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full ${
                        c.pct > 70 ? "bg-destructive" : c.pct > 50 ? "bg-amber-400" : "bg-accent"
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border text-[10px] font-display tracking-widest uppercase text-muted-foreground">
              Updated {tick % 5}s ago · 4 Hot Zones
            </div>
          </div>

          {/* Prevention stats */}
          <div className="glass rounded-xl border border-primary/20 p-5">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4" /> Prevention · Today
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "Alerts Triggered",   v: "23" },
                { l: "Incidents Prevented", v: "7" },
                { l: "Avg Response Time",  v: "4.2 min" },
                { l: "Cameras Online",     v: `${cameras}/900` },
              ].map((s) => (
                <div key={s.l} className="p-3 rounded-lg bg-secondary/40 border border-border">
                  <div className="text-2xl font-display font-black text-primary neon-text">{s.v}</div>
                  <div className="text-[10px] font-display tracking-widest uppercase text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* EDGE NODES TABLE */}
        <div className="glass rounded-xl border border-primary/20 p-5">
          <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4" /> Edge Nodes · Live Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] font-display tracking-widest uppercase text-muted-foreground">
                  <th className="text-left py-2 px-2">Node ID</th>
                  <th className="text-left py-2 px-2">City</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Load</th>
                  <th className="text-left py-2 px-2">Last Ping</th>
                </tr>
              </thead>
              <tbody>
                {NODES.map((n, i) => (
                  <motion.tr
                    key={n.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/40 hover:bg-primary/5 transition-colors"
                  >
                    <td className="py-3 px-2 font-mono text-primary">{n.id}</td>
                    <td className="py-3 px-2 text-foreground">{n.city}</td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center gap-1.5 font-display tracking-widest uppercase text-[10px] ${statusColor(n.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot(n.status)} ${n.status === "ONLINE" ? "animate-pulse" : ""}`} />
                        {n.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full ${n.load > 80 ? "bg-destructive" : n.load > 50 ? "bg-amber-400" : "bg-accent"}`}
                            style={{ width: `${n.load}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground w-9 text-right">{n.load}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{n.ping}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ACTION BAR */}
        <div className="glass rounded-xl border border-primary/20 p-4 flex flex-col sm:flex-row gap-3 sticky bottom-4 backdrop-blur-xl">
          <Button
            onClick={() => toast.success("New geo-fence zone deployed")}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80 font-display tracking-widest uppercase text-xs"
          >
            <Shield className="w-4 h-4 mr-2" /> Deploy New Zone
          </Button>
          <Button
            variant="outline"
            onClick={() => toast.success("Shield report exported")}
            className="flex-1 border-primary/40 text-primary hover:bg-primary/10 font-display tracking-widest uppercase text-xs"
          >
            <FileDown className="w-4 h-4 mr-2" /> Export Shield Report
          </Button>
          <Button
            onClick={() => toast.error("EMERGENCY BROADCAST sent to all 48 nodes")}
            className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 font-display tracking-widest uppercase text-xs animate-pulse-neon"
          >
            <Siren className="w-4 h-4 mr-2" /> Emergency Broadcast
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UrbanShield;

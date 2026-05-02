import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Activity, Cpu, Database, Globe2, Radar, Shield, Signal, Wifi,
  TrendingUp, Eye, AlertTriangle, CheckCircle2, Server, Zap, Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type FeedItem = {
  id: string;
  type: "match" | "scan" | "alert" | "system";
  message: string;
  meta: string;
  ts: number;
};

const REGIONS = ["Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Mansoura", "Tanta", "Port Said"];
const OPERATIONS = [
  "Facial embedding extracted",
  "Similarity vector computed",
  "CCTV frame ingested",
  "Low-light enhancement applied",
  "Match candidate ranked",
  "Region cluster updated",
  "Edge node sync complete",
  "Confidence threshold passed",
];

const randomMessage = (): FeedItem => {
  const types: FeedItem["type"][] = ["scan", "scan", "match", "alert", "system"];
  const t = types[Math.floor(Math.random() * types.length)];
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const op = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)];
  const conf = (60 + Math.random() * 39).toFixed(1);
  const node = `EDGE-${String(Math.floor(Math.random() * 48)).padStart(2, "0")}`;
  let message = op;
  if (t === "match") message = `Match candidate · ${conf}% confidence`;
  if (t === "alert") message = `High-priority signal escalated`;
  if (t === "system") message = `Node heartbeat OK`;
  return {
    id: Math.random().toString(36).slice(2),
    type: t,
    message,
    meta: `${region} · ${node}`,
    ts: Date.now(),
  };
};

const KPIS = [
  { label: "Overall Accuracy", value: "92.4%", icon: TrendingUp, accent: "text-primary" },
  { label: "Avg Query Time", value: "2.7s", icon: Zap, accent: "text-accent" },
  { label: "Low-Quality Acc.", value: "84.0%", icon: Eye, accent: "text-primary" },
  { label: "False Positive", value: "4.8%", icon: AlertTriangle, accent: "text-destructive" },
  { label: "Precision", value: "89.0%", icon: CheckCircle2, accent: "text-accent" },
  { label: "Recall", value: "87.0%", icon: Radar, accent: "text-primary" },
];

const CommandCenter = () => {
  const [feed, setFeed] = useState<FeedItem[]>(() =>
    Array.from({ length: 10 }, randomMessage)
  );
  const [now, setNow] = useState(new Date());
  const [cpu, setCpu] = useState(42);
  const [gpu, setGpu] = useState(67);
  const [latency, setLatency] = useState(118);
  const [bandwidth, setBandwidth] = useState(76);
  const [activeOps, setActiveOps] = useState(0);
  const [caseCount, setCaseCount] = useState(0);
  const [confidenceBuckets, setConfidenceBuckets] = useState<number[]>([4, 9, 14, 22, 31, 18]);

  useEffect(() => {
    supabase
      .from("missing_cases")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => setCaseCount(count ?? 0));
  }, []);

  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    const feedTick = setInterval(() => {
      setFeed((prev) => [randomMessage(), ...prev].slice(0, 18));
    }, 1800);
    const stats = setInterval(() => {
      setCpu((v) => Math.max(20, Math.min(92, v + (Math.random() - 0.5) * 12)));
      setGpu((v) => Math.max(30, Math.min(96, v + (Math.random() - 0.5) * 14)));
      setLatency((v) => Math.max(60, Math.min(280, v + (Math.random() - 0.5) * 40)));
      setBandwidth((v) => Math.max(20, Math.min(98, v + (Math.random() - 0.5) * 10)));
      setActiveOps(Math.floor(8 + Math.random() * 22));
      setConfidenceBuckets((b) =>
        b.map((x) => Math.max(2, Math.min(40, x + Math.floor((Math.random() - 0.5) * 6))))
      );
    }, 1500);
    return () => {
      clearInterval(clock);
      clearInterval(feedTick);
      clearInterval(stats);
    };
  }, []);

  const feedColor = (t: FeedItem["type"]) => {
    if (t === "match") return "text-accent";
    if (t === "alert") return "text-destructive";
    if (t === "system") return "text-muted-foreground";
    return "text-primary";
  };

  return (
    <div className="py-6 px-4 min-h-screen">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-neon" />
              Command Center · Tier-1 Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-[0.15em] uppercase mt-2">
              Mission <span className="text-primary neon-text">Control</span>
            </h1>
          </div>
          <div className="flex items-center gap-6 font-display text-xs tracking-widest uppercase">
            <div>
              <div className="text-muted-foreground">UTC Sync</div>
              <div className="text-primary neon-text text-base">{now.toUTCString().split(" ")[4]}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Active Ops</div>
              <div className="text-accent neon-text-green text-base">{activeOps}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Cases</div>
              <div className="text-foreground text-base">{caseCount}</div>
            </div>
          </div>
        </motion.div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {KPIS.map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/40" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/40" />
              <k.icon className={`w-4 h-4 ${k.accent} mb-2`} />
              <div className={`text-2xl font-display font-black ${k.accent}`}>{k.value}</div>
              <div className="text-[10px] text-muted-foreground font-display tracking-widest uppercase mt-1">
                {k.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live detection feed */}
          <div className="glass rounded-xl p-5 lg:col-span-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                <Activity className="w-4 h-4" /> Live Detection Feed
              </h3>
              <span className="flex items-center gap-2 text-[10px] font-display tracking-widest uppercase text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-neon" />
                streaming
              </span>
            </div>
            <div className="font-mono text-xs space-y-1.5 max-h-[420px] overflow-hidden">
              {feed.map((f, i) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: i < 3 ? 1 : 0.55 - i * 0.025, x: 0 }}
                  className="flex items-center gap-3 border-l-2 border-border hover:border-primary/60 pl-3 py-1"
                >
                  <span className="text-muted-foreground/60">
                    {new Date(f.ts).toLocaleTimeString("en-GB")}
                  </span>
                  <span className={`uppercase tracking-wider ${feedColor(f.type)}`}>
                    [{f.type}]
                  </span>
                  <span className="flex-1 truncate text-foreground/80">{f.message}</span>
                  <span className="text-muted-foreground/70 text-[10px]">{f.meta}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* System health */}
          <div className="glass rounded-xl p-5 space-y-5">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
              <Server className="w-4 h-4" /> System Health
            </h3>

            {[
              { label: "Inference CPU", value: cpu, icon: Cpu, color: "bg-primary" },
              { label: "GPU Cluster", value: gpu, icon: Cpu, color: "bg-accent" },
              { label: "Bandwidth", value: bandwidth, icon: Wifi, color: "bg-primary" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[11px] font-display tracking-widest uppercase mb-1">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <s.icon className="w-3 h-3" /> {s.label}
                  </span>
                  <span className="text-foreground">{Math.round(s.value)}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${s.color}`}
                    animate={{ width: `${s.value}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-2 border-t border-border grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">
                  API Latency
                </div>
                <div className="text-lg font-display font-black text-primary">
                  {Math.round(latency)}<span className="text-xs text-muted-foreground"> ms</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">
                  Uptime
                </div>
                <div className="text-lg font-display font-black text-accent">99.97%</div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <div className="text-[10px] font-display tracking-widest uppercase text-muted-foreground mb-2">
                Service Mesh
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-display tracking-wider">
                {[
                  { n: "vision-api", ok: true },
                  { n: "embedding-svc", ok: true },
                  { n: "vector-db", ok: true },
                  { n: "alert-bus", ok: true },
                  { n: "auth-gw", ok: true },
                  { n: "edge-relay", ok: latency < 220 },
                ].map((s) => (
                  <div key={s.n} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.ok ? "bg-accent" : "bg-destructive"} animate-pulse-neon`} />
                    <span className="text-muted-foreground">{s.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Confidence distribution + region map */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-xl p-5 lg:col-span-2">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-5">
              <TrendingUp className="w-4 h-4" /> Confidence Distribution · Last 24h
            </h3>
            <div className="flex items-end justify-between gap-2 h-44 px-2">
              {confidenceBuckets.map((v, i) => {
                const labels = ["50-60", "60-70", "70-80", "80-85", "85-90", "90-100"];
                const isHigh = i >= 4;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      animate={{ height: `${(v / 40) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className={`w-full rounded-t ${isHigh ? "bg-accent/70" : "bg-primary/60"} relative`}
                      style={{ minHeight: 6 }}
                    >
                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-display text-foreground">
                        {v}
                      </span>
                    </motion.div>
                    <span className="text-[9px] font-display tracking-widest text-muted-foreground">
                      {labels[i]}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-xl p-5">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
              <Globe2 className="w-4 h-4" /> Regional Activity
            </h3>
            <div className="space-y-2">
              {REGIONS.slice(0, 6).map((r, i) => {
                const pct = 30 + ((i * 13 + activeOps) % 70);
                return (
                  <div key={r}>
                    <div className="flex justify-between text-[11px] font-display tracking-wider uppercase mb-1">
                      <span className="text-muted-foreground">{r}</span>
                      <span className="text-foreground">{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status footer */}
        <div className="glass rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-display tracking-widest uppercase">
            <Shield className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Encryption</span>
            <span className="text-accent">AES-256 · TLS 1.3</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest uppercase">
            <Database className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Vector DB</span>
            <span className="text-primary">128-dim · cosine</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest uppercase">
            <Signal className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">Edge Nodes</span>
            <span className="text-accent">48 / 48 online</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-display tracking-widest uppercase">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Operators</span>
            <span className="text-foreground">12 active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;

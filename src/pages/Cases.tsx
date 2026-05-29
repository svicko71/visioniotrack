import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Search, MapPin, Clock, X, Sparkles, FileDown, UserCog,
  AlertTriangle, ShieldAlert, UserX, CheckCircle2, Activity, Users
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Status = "MISSING" | "FOUND" | "KIDNAPPED" | "RUNAWAY";
type Gender = "M" | "F";

interface DemoCase {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  location: string;
  city: string;
  timeAgo: string;
  status: Status;
  confidence: number;
  description: string;
  timeline: { time: string; event: string }[];
}

const DEMO_CASES: DemoCase[] = [
  {
    id: "VT-2026-0044", name: "Fatma Ali", age: 45, gender: "F",
    location: "Tanta - Train Station", city: "Tanta", timeAgo: "12 hours ago",
    status: "MISSING", confidence: 88,
    description: "Last seen wearing a black abaya near the main platform. Reported by family.",
    timeline: [
      { time: "12h ago", event: "Reported missing by family" },
      { time: "10h ago", event: "CCTV match · Tanta Station — 88% confidence" },
      { time: "6h ago",  event: "Lead pushed to Gharbia regional officers" },
    ],
  },
  {
    id: "VT-2026-0041", name: "Ahmed Mostafa", age: 34, gender: "M",
    location: "Cairo - Ramses Station", city: "Cairo", timeAgo: "3 days ago",
    status: "MISSING", confidence: 78,
    description: "Software engineer. Last seen at Ramses Station boarding platform 4.",
    timeline: [
      { time: "3d ago", event: "Family filed missing report" },
      { time: "2d ago", event: "Edge node EDGE-27 flagged similar profile" },
      { time: "1d ago", event: "Manual review pending operator confirmation" },
    ],
  },
  {
    id: "VT-2026-0039", name: "Nour El-Din Sara", age: 16, gender: "F",
    location: "Alexandria - Sidi Gaber", city: "Alexandria", timeAgo: "6 hours ago",
    status: "MISSING", confidence: 91,
    description: "Teen reported missing near Sidi Gaber station. High-priority active search.",
    timeline: [
      { time: "6h ago", event: "Reported missing by parents" },
      { time: "5h ago", event: "Amber-style alert dispatched to Alexandria nodes" },
      { time: "2h ago", event: "Match candidate · 91% — pending verification" },
    ],
  },
  {
    id: "VT-2026-0035", name: "Hassan Ibrahim", age: 28, gender: "M",
    location: "Cairo - Maadi", city: "Cairo", timeAgo: "5 days ago",
    status: "FOUND", confidence: 95,
    description: "Located safe in Maadi after CCTV match. Reunited with family.",
    timeline: [
      { time: "5d ago", event: "Reported missing by sibling" },
      { time: "2d ago", event: "Match · 95% — Maadi corniche node" },
      { time: "1d ago", event: "Reunited with family ✓" },
    ],
  },
  {
    id: "VT-2026-0031", name: "Mona Khalil", age: 19, gender: "F",
    location: "Giza - Haram", city: "Giza", timeAgo: "2 days ago",
    status: "RUNAWAY", confidence: 74,
    description: "Believed to have left home voluntarily. Low-priority monitoring active.",
    timeline: [
      { time: "2d ago", event: "Family filed runaway report" },
      { time: "1d ago", event: "Possible sighting · Haram Street — 74% confidence" },
      { time: "6h ago", event: "Social outreach team notified" },
    ],
  },
  {
    id: "VT-2026-0028", name: "Omar Saeed", age: 42, gender: "M",
    location: "Cairo - Shubra", city: "Cairo", timeAgo: "1 day ago",
    status: "KIDNAPPED", confidence: 85,
    description: "CRITICAL · Suspected abduction in Shubra district. Active investigation.",
    timeline: [
      { time: "1d ago", event: "Witness report filed — Shubra" },
      { time: "1d ago", event: "Vehicle plate partial match logged" },
      { time: "12h ago", event: "Inter-governorate critical alert active" },
    ],
  },
];

const STATUS_FILTERS = [
  { key: "all",       en: "All",        ar: "الكل",   icon: Users },
  { key: "MISSING",   en: "Missing",    ar: "مفقود", icon: UserX },
  { key: "FOUND",     en: "Found",      ar: "ظهر",  icon: CheckCircle2 },
  { key: "KIDNAPPED", en: "Kidnapped",  ar: "مخطوف", icon: ShieldAlert },
  { key: "RUNAWAY",   en: "Runaway",    ar: "هارب",  icon: AlertTriangle },
] as const;


const statusBadge = (s: Status) => {
  if (s === "FOUND") return "bg-accent/15 text-accent border-accent/40";
  if (s === "KIDNAPPED") return "bg-destructive/15 text-destructive border-destructive/40";
  if (s === "RUNAWAY") return "bg-amber-500/15 text-amber-400 border-amber-500/40";
  return "bg-orange-500/15 text-orange-400 border-orange-500/40"; // MISSING
};

const confColor = (c: number) =>
  c >= 90 ? "from-accent to-accent" :
  c >= 80 ? "from-primary to-accent" :
  c >= 70 ? "from-amber-500 to-orange-500" :
            "from-orange-500 to-destructive";

const initials = (name: string) =>
  name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();

const Cases = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<DemoCase | null>(null);
  const [matching, setMatching] = useState<string | null>(null);

  const filtered = useMemo(() => DEMO_CASES.filter(c => {
    const q = search.toLowerCase();
    const matchesQ = !q ||
      c.name.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q);
    const matchesF = filter === "all" || c.status === filter;
    return matchesQ && matchesF;
  }), [search, filter]);

  const stats = useMemo(() => ({
    active: DEMO_CASES.filter(c => c.status === "MISSING").length,
    found: DEMO_CASES.filter(c => c.status === "FOUND").length,
    critical: DEMO_CASES.filter(c => c.status === "KIDNAPPED").length,
    total: DEMO_CASES.length,
  }), []);

  const runAIMatch = (c: DemoCase) => {
    setMatching(c.id);
    toast.loading(`Running AI match for ${c.id}...`, { id: c.id });
    setTimeout(() => {
      toast.success(`Match pipeline complete · ${c.confidence}% confidence`, { id: c.id });
      setMatching(null);
    }, 1800);
  };

  return (
    <div className="py-8 px-4 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-[0.15em] uppercase">
              Missing <span className="text-primary neon-text">Cases</span>
            </h1>
            <p className="text-xs font-display tracking-widest text-muted-foreground uppercase mt-1">
              Vision Track Intelligence · Active Registry
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-primary/20 focus-visible:ring-primary/40"
              />
            </div>
            <Button
              onClick={() => toast.info("Open the Cases reporting form")}
              className="bg-primary text-primary-foreground hover:bg-primary/80 font-display text-xs tracking-wider"
            >
              <Plus className="w-4 h-4 mr-1" /> Report
            </Button>
          </div>
        </motion.div>

        {/* Status stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active",   value: stats.active,   icon: Activity,       color: "text-orange-400",  ring: "border-orange-500/30" },
            { label: "Found",    value: stats.found,    icon: CheckCircle2,   color: "text-accent",      ring: "border-accent/30" },
            { label: "Critical", value: stats.critical, icon: ShieldAlert,    color: "text-destructive", ring: "border-destructive/30" },
            { label: "Total",    value: stats.total,    icon: Users,          color: "text-primary",     ring: "border-primary/30" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-xl p-4 relative overflow-hidden border ${s.ring}`}
            >
              <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-primary/50" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-primary/50" />
              <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
              <div className={`text-2xl font-display font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] font-display tracking-widest uppercase text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-display tracking-wider transition-all flex items-center gap-1.5 border ${
                filter === f.key
                  ? "bg-primary/15 text-primary border-primary/40 neon-border"
                  : "bg-secondary/40 text-muted-foreground border-border hover:border-primary/30"
              }`}
            >
              <f.icon className="w-3 h-3" />
              {f.en} <span className="opacity-60">/ {f.ar}</span>
            </button>
          ))}
        </div>

        {/* Cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-xl p-5 border border-primary/15 hover:border-primary/40 hover:neon-border transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-3xl rounded-full" />

              <div className="flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 flex items-center justify-center font-display font-black text-primary text-lg neon-text">
                    {initials(c.name)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-bold tracking-wider truncate">{c.name}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {c.age}{c.gender} · <span className="font-mono text-primary tracking-wider">{c.id}</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-display tracking-widest uppercase px-2 py-1 rounded-full border ${statusBadge(c.status)}`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
                    <MapPin className="w-3 h-3 text-primary" /> {c.location}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-accent" /> {c.timeAgo}
                  </p>

                  {/* Confidence */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-display tracking-widest uppercase mb-1">
                      <span className="text-muted-foreground">AI Confidence</span>
                      <span className="text-foreground">{c.confidence}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.confidence}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className={`h-full bg-gradient-to-r ${confColor(c.confidence)}`}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm" variant="outline"
                      onClick={() => setSelected(c)}
                      className="flex-1 text-[10px] font-display tracking-widest uppercase border-primary/30 text-primary hover:bg-primary/10 h-8"
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      disabled={matching === c.id}
                      onClick={() => runAIMatch(c)}
                      className="flex-1 text-[10px] font-display tracking-widest uppercase bg-primary/90 text-primary-foreground hover:bg-primary h-8"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {matching === c.id ? "Matching..." : "Run AI Match"}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 glass rounded-xl border border-primary/15">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground" dir="rtl">
              لا توجد حالات مطابقة للبحث.
            </p>
          </div>
        )}
      </div>

      {/* Case detail modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl bg-card border border-primary/30 max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display tracking-[0.15em] uppercase flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 flex items-center justify-center font-display font-black text-primary">
                    {initials(selected.name)}
                  </div>
                  <div>
                    <div className="text-base">{selected.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono normal-case tracking-wider">{selected.id}</div>
                  </div>
                  <span className={`ml-auto text-[10px] font-display tracking-widest uppercase px-2 py-1 rounded-full border ${statusBadge(selected.status)}`}>
                    {selected.status}
                  </span>
                </DialogTitle>
              </DialogHeader>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { l: "Age",       v: `${selected.age} ${selected.gender === "M" ? "Male" : "Female"}` },
                  { l: "Last Seen", v: selected.location },
                  { l: "Reported",  v: selected.timeAgo },
                  { l: "AI Match",  v: `${selected.confidence}%` },
                ].map((i) => (
                  <div key={i.l} className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <div className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">{i.l}</div>
                    <div className="text-sm font-display text-foreground mt-1">{i.v}</div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-muted-foreground mt-2">{selected.description}</p>

              {/* Map placeholder */}
              <div className="mt-2">
                <div className="text-[10px] font-display tracking-widest uppercase text-primary mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Last Known Location · {selected.city}
                </div>
                <div className="relative h-40 rounded-lg overflow-hidden border border-primary/20 bg-secondary/40">
                  <div
                    className="absolute inset-0 opacity-40"
                    style={{
                      backgroundImage:
                        "linear-gradient(hsl(var(--primary)/0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.2) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-4 h-4 rounded-full bg-primary neon-border" />
                      <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary/50 animate-ping" />
                      <div className="absolute -inset-6 rounded-full border border-primary/30 animate-pulse-neon" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 text-[10px] font-mono text-primary bg-background/70 px-2 py-1 rounded">
                    {selected.city.toUpperCase()} · GEO-LOCKED
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-2">
                <div className="text-[10px] font-display tracking-widest uppercase text-primary mb-2">Sightings Timeline</div>
                <div className="space-y-2">
                  {selected.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3 items-start border-l-2 border-primary/40 pl-3 py-1">
                      <span className="text-[10px] font-display tracking-widest uppercase text-muted-foreground w-16 flex-shrink-0">{t.time}</span>
                      <span className="text-xs text-foreground">{t.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => toast.success("Case assigned to operator OPS-04")}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80 font-display text-[10px] tracking-widest uppercase"
                >
                  <UserCog className="w-3 h-3 mr-1" /> Assign to Operator
                </Button>
                <Button
                  variant="outline"
                  onClick={() => toast.success(`Report exported · ${selected.id}.pdf`)}
                  className="flex-1 border-primary/30 text-primary hover:bg-primary/10 font-display text-[10px] tracking-widest uppercase"
                >
                  <FileDown className="w-3 h-3 mr-1" /> Export Report
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cases;

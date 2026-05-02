import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  Upload, ScanFace, Brain, Database, Filter, MapPin, User,
  Sparkles, ChevronRight, Loader2, Search, Activity, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const STAGES = [
  { id: 1, label: "Decoding image stream", icon: Upload },
  { id: 2, label: "Detecting faces · MTCNN", icon: ScanFace },
  { id: 3, label: "Extracting 128-d embeddings", icon: Brain },
  { id: 4, label: "Cosine similarity over vector DB", icon: Database },
  { id: 5, label: "Ranking & threshold filter", icon: Sparkles },
];

const REGIONS = ["All Regions", "Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Mansoura"];
const TIME_RANGES = ["Last 24h", "Last 7 days", "Last 30 days", "All time"];

type Match = {
  id: string;
  name: string;
  age?: string | null;
  gender?: string | null;
  last_seen: string;
  photo_url?: string | null;
  status: string;
  match: number;
  vector_distance: number;
  region: string;
};

const AISearch = () => {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [results, setResults] = useState<Match[] | null>(null);
  const [region, setRegion] = useState("All Regions");
  const [timeRange, setTimeRange] = useState("Last 7 days");
  const [threshold, setThreshold] = useState([70]);
  const [enhanceLowQuality, setEnhanceLowQuality] = useState(true);

  const handleFile = useCallback((file: File) => {
    setPhoto(file);
    const r = new FileReader();
    r.onload = (e) => setPhotoPreview(e.target?.result as string);
    r.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  }, [handleFile]);

  const pushLog = (s: string) =>
    setLogLines((prev) => [...prev, `[${new Date().toLocaleTimeString("en-GB")}] ${s}`].slice(-40));

  const runSearch = async () => {
    if (!photo) {
      toast.error("Upload a probe image first");
      return;
    }
    setRunning(true);
    setResults(null);
    setLogLines([]);
    setStage(0);

    pushLog("init pipeline · vision-api v3.2.1");
    pushLog(`probe size: ${(photo.size / 1024).toFixed(1)} KB`);
    if (enhanceLowQuality) pushLog("low-quality enhancement: ENABLED");

    for (let i = 0; i < STAGES.length; i++) {
      setStage(i + 1);
      const s = STAGES[i];
      pushLog(`stage ${i + 1}/${STAGES.length} · ${s.label}`);
      await new Promise((r) => setTimeout(r, 600 + Math.random() * 500));
      if (i === 1) pushLog(`faces detected: 1 · alignment OK`);
      if (i === 2) pushLog(`embedding norm: 0.${Math.floor(900 + Math.random() * 99)}`);
      if (i === 3) pushLog(`searched ${(80000 + Math.floor(Math.random() * 12000)).toLocaleString()} vectors`);
    }

    const { data: cases } = await supabase
      .from("missing_cases")
      .select("*")
      .limit(12);

    const matches: Match[] = (cases ?? []).map((c) => {
      const m = Math.floor(Math.random() * 40) + 60;
      return {
        id: c.id,
        name: c.name,
        age: c.age,
        gender: c.gender,
        last_seen: c.last_seen,
        photo_url: c.photo_url,
        status: c.status,
        match: m,
        vector_distance: +(1 - m / 100).toFixed(3),
        region: REGIONS[1 + Math.floor(Math.random() * (REGIONS.length - 1))],
      };
    }).sort((a, b) => b.match - a.match);

    setResults(matches);
    setRunning(false);
    pushLog(`done · ${matches.length} candidates ranked`);
    toast.success(`Search complete · ${matches.length} candidates`);
  };

  const filtered = (results ?? []).filter(
    (r) => r.match >= threshold[0] && (region === "All Regions" || r.region === region)
  );

  const confidenceColor = (m: number) =>
    m >= 90 ? "text-accent neon-text-green"
      : m >= 80 ? "text-primary neon-text"
      : m >= 70 ? "text-primary"
      : "text-muted-foreground";

  return (
    <div className="py-6 px-4 min-h-screen">
      <div className="container mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border pb-4"
        >
          <div className="flex items-center gap-2 text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
            <Sparkles className="w-3 h-3 text-accent" /> AI Search & Matching Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-black tracking-[0.15em] uppercase mt-2">
            Probe <span className="text-primary neon-text">Search</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2">
            Upload a face frame · pipeline simulates MTCNN detection, FaceNet 128-d embeddings, and FAISS-style cosine search.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload + Filters */}
          <div className="space-y-4">
            <div
              className={`glass rounded-xl p-5 transition-all ${dragOver ? "neon-border" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
                <Upload className="w-4 h-4" /> Probe Image
              </h3>
              {photoPreview ? (
                <div className="relative mb-4">
                  <img src={photoPreview} alt="probe" className="w-full h-56 object-cover rounded-lg border border-primary/30" />
                  <button
                    onClick={() => { setPhoto(null); setPhotoPreview(null); setResults(null); }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    aria-label="Clear"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-[10px] font-mono text-accent">
                    {photo?.name}
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-56 cursor-pointer hover:bg-primary/5 transition-colors mb-4 rounded-lg border-2 border-dashed border-primary/20">
                  <ScanFace className="w-12 h-12 text-primary/50 mb-3" />
                  <span className="text-sm font-display tracking-wider text-muted-foreground">Drop face frame</span>
                  <span className="text-xs text-muted-foreground/60 mt-1">or click to browse · CCTV jpeg, webp, png</span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>
              )}

              <Button
                onClick={runSearch}
                disabled={running || !photo}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/80 font-display tracking-[0.2em] uppercase neon-border"
              >
                {running ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running pipeline…</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Run Match Search</>
                )}
              </Button>
            </div>

            <div className="glass rounded-xl p-5 space-y-5">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>

              <div>
                <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">Region</label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="mt-1 bg-secondary border-primary/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="mt-1 bg-secondary border-primary/20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIME_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-display tracking-widest uppercase text-muted-foreground">Confidence Threshold</label>
                  <span className="text-xs font-display font-bold text-primary">{threshold[0]}%</span>
                </div>
                <Slider value={threshold} onValueChange={setThreshold} min={50} max={95} step={1} />
              </div>

              <label className="flex items-center gap-2 text-xs font-display tracking-wider text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={enhanceLowQuality}
                  onChange={(e) => setEnhanceLowQuality(e.target.checked)}
                  className="accent-primary"
                />
                Low-quality enhancement (CCTV mode)
              </label>
            </div>
          </div>

          {/* Center+Right: Pipeline + Results */}
          <div className="lg:col-span-2 space-y-4">
            {/* Pipeline */}
            <div className="glass rounded-xl p-5">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-5">
                <Brain className="w-4 h-4" /> Inference Pipeline
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {STAGES.map((s, i) => {
                  const active = stage === i + 1;
                  const done = stage > i + 1 || (!running && results && stage >= STAGES.length);
                  return (
                    <div key={s.id} className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                        ${done ? "border-accent bg-accent/10" : active ? "border-primary bg-primary/10 animate-pulse-neon" : "border-border bg-secondary"}`}>
                        {active ? <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          : <s.icon className={`w-5 h-5 ${done ? "text-accent" : "text-muted-foreground"}`} />}
                      </div>
                      <div className={`text-[10px] font-display tracking-wider uppercase mt-2
                        ${done ? "text-accent" : active ? "text-primary" : "text-muted-foreground"}`}>
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              {running && (
                <Progress value={(stage / STAGES.length) * 100} className="h-1.5 mt-5" />
              )}
            </div>

            {/* Logs */}
            {logLines.length > 0 && (
              <div className="glass rounded-xl p-4">
                <h3 className="font-display text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3" /> Pipeline Trace
                </h3>
                <div className="font-mono text-[11px] text-muted-foreground space-y-0.5 max-h-44 overflow-y-auto">
                  {logLines.map((l, i) => (
                    <div key={i} className="border-l-2 border-border/60 pl-2">{l}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <AnimatePresence>
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
                      <Sparkles className="w-4 h-4" /> Ranked Candidates
                    </h3>
                    <span className="text-xs text-muted-foreground font-display tracking-wider">
                      {filtered.length} / {results.length} above threshold
                    </span>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No candidates pass current filters</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filtered.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex gap-3 p-3 rounded-xl bg-secondary/40 border border-border hover:border-primary/40 transition-all"
                        >
                          <div className="relative">
                            {r.photo_url ? (
                              <img src={r.photo_url} alt={r.name} className="w-20 h-20 rounded-lg object-cover border border-primary/30" />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <User className="w-8 h-8 text-primary/40" />
                              </div>
                            )}
                            <div className="absolute -top-1 -left-1 bg-background border border-primary/40 rounded px-1 text-[9px] font-mono text-primary">
                              #{String(i + 1).padStart(2, "0")}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-display text-sm font-bold tracking-wider truncate">{r.name}</h4>
                              <span className={`font-display font-black text-lg ${confidenceColor(r.match)}`}>
                                {r.match}%
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-muted-foreground">
                              dist: {r.vector_distance} · {r.region}
                            </div>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {r.last_seen}
                            </p>
                            <div className="mt-2 h-1 w-full bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${r.match >= 85 ? "bg-accent" : "bg-primary"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${r.match}%` }}
                                transition={{ duration: 0.8, delay: i * 0.05 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearch;

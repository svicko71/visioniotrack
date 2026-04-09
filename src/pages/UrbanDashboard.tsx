import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload, MapPin, Bell, AlertTriangle, Eye, Radar, Activity,
  Loader2, Trash2, Trees, Building, Hammer, Zap, CheckCircle2,
  XCircle, ShieldAlert, Lightbulb, Camera, Radio, Wifi, Clock
} from "lucide-react";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const typeConfig: Record<string, { label: string; icon: any; color: string; markerColor: string }> = {
  waste: { label: "Waste", icon: Trash2, color: "text-red-500", markerColor: "#ef4444" },
  empty_land: { label: "Empty Land", icon: Trees, color: "text-green-500", markerColor: "#22c55e" },
  construction_activity: { label: "Construction", icon: Hammer, color: "text-amber-500", markerColor: "#f59e0b" },
  structural_damage: { label: "Structural Damage", icon: Building, color: "text-red-600", markerColor: "#dc2626" },
};

const severityColors: Record<string, string> = {
  low: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
};

// Smart matching: pair empty_land detections with available donations
const generateSmartMatches = (detections: any[], donations: any[]) => {
  const emptyLands = detections.filter((d) => d.detection_type === "empty_land");
  const available = donations.filter((d) => d.status === "available");
  if (!emptyLands.length || !available.length) return [];

  const categoryActions: Record<string, string> = {
    plants: "a community garden or green park",
    wood: "benches, fencing, and playground structures",
    furniture: "a public seating area or outdoor lounge",
    building_materials: "a community center or shelter",
    other: "a multi-purpose community space",
  };

  return emptyLands.slice(0, 5).map((land) => {
    const matched = available.slice(0, 3);
    const cats = [...new Set(matched.map((m: any) => m.category))];
    const actions = cats.map((c) => categoryActions[c] || "a useful space").join(" and ");
    const score = 0.6 + Math.random() * 0.35;
    const items = matched.map((m: any) => m.title).join(", ");

    return {
      detection: land,
      donations: matched,
      recommendation: `Convert empty area (${land.description || "detected site"}) into ${actions} using donated items: ${items}.`,
      match_score: Number(score.toFixed(2)),
    };
  });
};

// Simulated live feed data
const simulatedFeeds = [
  { cam: "CAM-01 Cairo Downtown", status: "active", fps: 30, type: "CCTV" },
  { cam: "CAM-02 Giza Industrial", status: "active", fps: 25, type: "Drone" },
  { cam: "CAM-03 Alexandria Port", status: "active", fps: 30, type: "CCTV" },
  { cam: "CAM-04 Nasr City", status: "processing", fps: 15, type: "Mobile" },
  { cam: "CAM-05 Helwan Zone", status: "active", fps: 30, type: "IoT" },
  { cam: "CAM-06 Maadi District", status: "offline", fps: 0, type: "CCTV" },
];

const UrbanDashboard = () => {
  const { user } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [detections, setDetections] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [smartMatches, setSmartMatches] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [donations, setDonations] = useState<any[]>([]);
  const [liveTime, setLiveTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Load existing data
  useEffect(() => {
    const load = async () => {
      const [dRes, aRes, mRes, donRes] = await Promise.all([
        supabase.from("urban_detections").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("urban_alerts").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("ai_matches").select("*, urban_detections(*), donations(*)").order("created_at", { ascending: false }).limit(20),
        supabase.from("donations").select("*").eq("status", "available").limit(20),
      ]);
      if (dRes.data) setDetections(dRes.data);
      if (aRes.data) setAlerts(aRes.data);
      if (mRes.data) setMatches(mRes.data);
      if (donRes.data) setDonations(donRes.data);
    };
    load();

    // Realtime alerts
    const channel = supabase
      .channel("urban-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "urban_alerts" }, (payload) => {
        setAlerts((prev) => [payload.new as any, ...prev]);
        toast.warning(`🚨 ${(payload.new as any).message}`);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Generate smart matches whenever detections or donations change
  useEffect(() => {
    const sm = generateSmartMatches(detections, donations);
    setSmartMatches(sm);
  }, [detections, donations]);

  const handleFile = useCallback((file: File) => {
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const analyzeImage = async () => {
    if (!photo) { toast.error("Upload an image first"); return; }
    if (!user) { toast.error("Please sign in first"); return; }
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(photo);
      });

      const { data, error } = await supabase.functions.invoke("analyze-urban", {
        body: { image_base64: base64 },
      });

      if (error) throw error;
      setAnalysisResult(data);

      // Save detections to DB with simulated GPS
      if (data.detections?.length > 0) {
        const baseLat = 30.0 + Math.random() * 1.5;
        const baseLng = 31.0 + Math.random() * 1.5;

        for (const det of data.detections) {
          const { data: saved } = await supabase.from("urban_detections").insert({
            user_id: user.id,
            detection_type: det.type,
            confidence: det.confidence,
            lat: baseLat + (Math.random() - 0.5) * 0.1,
            lng: baseLng + (Math.random() - 0.5) * 0.1,
            description: det.description,
            severity: det.severity,
            metadata: { recommended_action: det.recommended_action },
          }).select().single();

          if (saved && (det.severity === "high" || det.severity === "critical")) {
            await supabase.from("urban_alerts").insert({
              detection_id: saved.id,
              alert_type: det.type === "construction_activity" ? "illegal_activity" : det.type === "structural_damage" ? "structural_risk" : "hazard",
              message: `${det.severity.toUpperCase()}: ${det.description}`,
              severity: det.severity,
            });
          }
        }

        // Refresh
        const { data: fresh } = await supabase.from("urban_detections").select("*").order("created_at", { ascending: false }).limit(50);
        if (fresh) setDetections(fresh);

        toast.success(`Analysis complete! ${data.detections.length} issues detected.`);
      } else {
        toast.info("No urban issues detected in this image.");
      }
    } catch (err: any) {
      toast.error(err.message || "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredDetections = selectedType ? detections.filter((d) => d.detection_type === selectedType) : detections;

  const stats = [
    { label: "Total Detections", value: detections.length, icon: Eye, color: "text-primary" },
    { label: "Active Alerts", value: alerts.filter((a) => !a.acknowledged).length, icon: Bell, color: "text-destructive" },
    { label: "Critical Issues", value: detections.filter((d) => d.severity === "critical").length, icon: ShieldAlert, color: "text-red-500" },
    { label: "AI Matches", value: smartMatches.length + matches.length, icon: Lightbulb, color: "text-accent" },
  ];

  return (
    <div className="py-6 px-4 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-[0.15em] uppercase">
              <span className="text-primary neon-text">Urban Shield</span>
              <span className="text-accent"> & Link</span>
            </h1>
            <p className="text-xs font-display tracking-widest text-muted-foreground uppercase mt-1">
              AI-Powered Urban Monitoring • Powered by Vision Track
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-display tracking-wider">
            <span className="flex items-center gap-1.5 text-accent">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> LIVE
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {liveTime.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-5 text-center hover:neon-border transition-all">
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
              <div className={`text-3xl font-display font-black ${s.color} neon-text`}>{s.value}</div>
              <div className="text-xs font-display tracking-widest uppercase text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Upload + Results + Edge Devices + Filter */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Upload & Analyze */}
            <div className={`glass rounded-xl p-6 transition-all ${dragOver ? "neon-border" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}>
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                <Camera className="w-4 h-4" /> Urban Analysis
              </h3>
              {photoPreview ? (
                <div className="relative mb-4">
                  <img src={photoPreview} alt="Upload" className="w-full h-48 object-cover rounded-lg border border-primary/30" />
                  <button onClick={() => { setPhoto(null); setPhotoPreview(null); setAnalysisResult(null); }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-primary/5 transition-colors rounded-lg border-2 border-dashed border-primary/20 mb-4">
                  <Upload className="w-10 h-10 text-primary/50 mb-3" />
                  <span className="text-sm text-muted-foreground font-display tracking-wider">Drop urban image here</span>
                  <span className="text-xs text-muted-foreground/50 mt-1">or click to browse</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>
              )}
              <Button onClick={analyzeImage} disabled={analyzing} className="w-full bg-primary text-primary-foreground font-display tracking-[0.15em] uppercase text-sm h-12 neon-border">
                {analyzing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Radar className="w-4 h-4 mr-2" /> Analyze Image</>}
              </Button>
            </div>

            {/* Analysis Result */}
            <AnimatePresence>
              {analysisResult && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-xl p-5">
                  <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-3 text-accent flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Analysis Results
                  </h3>
                  <div className={`text-xs mb-3 px-3 py-1.5 rounded-full inline-block border ${severityColors[analysisResult.risk_level] || severityColors.medium}`}>
                    Risk: {analysisResult.risk_level?.toUpperCase()}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{analysisResult.overall_assessment}</p>
                  <div className="space-y-2">
                    {analysisResult.detections?.map((d: any, i: number) => {
                      const cfg = typeConfig[d.type] || typeConfig.waste;
                      const Icon = cfg.icon;
                      return (
                        <div key={i} className="p-3 rounded-lg bg-secondary/40 border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                            <span className="font-display text-xs font-bold tracking-wider">{cfg.label}</span>
                            <span className="ml-auto text-xs font-display font-bold text-primary">{Math.round(d.confidence * 100)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{d.description}</p>
                          <p className="text-[10px] text-accent mt-1">→ {d.recommended_action}</p>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Edge Device Simulation */}
            <div className="glass rounded-xl p-4">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-3 text-primary flex items-center gap-2">
                <Wifi className="w-4 h-4" /> Edge Devices
              </h3>
              <div className="space-y-2">
                {simulatedFeeds.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 text-xs">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      f.status === "active" ? "bg-accent animate-pulse" :
                      f.status === "processing" ? "bg-amber-500 animate-pulse" : "bg-muted-foreground"
                    }`} />
                    <span className="font-display tracking-wider truncate flex-1">{f.cam}</span>
                    <span className="text-muted-foreground">{f.type}</span>
                    {f.fps > 0 && <span className="text-primary font-bold">{f.fps}fps</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="glass rounded-xl p-4">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-3 text-primary">Filter</h3>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedType(null)}
                  className={`text-xs px-3 py-1.5 rounded-full font-display tracking-wider transition-all ${!selectedType ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                  All
                </button>
                {Object.entries(typeConfig).map(([key, cfg]) => (
                  <button key={key} onClick={() => setSelectedType(key)}
                    className={`text-xs px-3 py-1.5 rounded-full font-display tracking-wider transition-all ${selectedType === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Map + Alerts + Matches + Detections */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4">
            {/* Map */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 text-primary mb-4">
                <MapPin className="w-4 h-4" /> Urban Intelligence Map
              </h3>
              <UrbanMap detections={filteredDetections} />
              <div className="flex items-center gap-4 mt-3 text-[10px] font-display tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Problems</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Opportunities</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Construction</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 animate-ping inline-block" style={{ animationDuration: "2s" }} /> Critical</span>
              </div>
            </div>

            {/* Alerts */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 text-destructive mb-4">
                <Bell className="w-4 h-4" /> Live Alerts ({alerts.filter(a => !a.acknowledged).length})
              </h3>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No alerts yet. Analyze an image to generate detections.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {alerts.slice(0, 8).map((a: any) => (
                    <div key={a.id} className={`p-3 rounded-lg border ${severityColors[a.severity] || severityColors.medium} ${a.severity === "critical" ? "animate-pulse" : ""}`}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-display font-bold tracking-wider truncate">{a.message}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] opacity-70">{a.alert_type?.replace(/_/g, " ")}</span>
                        {a.acknowledged ? <CheckCircle2 className="w-3 h-3 text-accent" /> : <XCircle className="w-3 h-3 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart AI Matches */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 text-accent mb-4">
                <Lightbulb className="w-4 h-4" /> AI Smart Matching ({smartMatches.length + matches.length})
              </h3>
              {smartMatches.length === 0 && matches.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Smart matches appear when empty land is detected and donations are available.
                </p>
              ) : (
                <div className="space-y-3">
                  {smartMatches.map((m, i) => (
                    <motion.div key={`sm-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="p-4 rounded-lg bg-accent/5 border border-accent/20 hover:border-accent/40 transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{m.recommendation}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span>Score: <span className="text-accent font-bold">{Math.round(m.match_score * 100)}%</span></span>
                            <span>•</span>
                            <span>{m.donations.length} items matched</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {matches.map((m: any) => (
                    <div key={m.id} className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                      <p className="text-sm">{m.recommendation}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>Score: <span className="text-accent font-bold">{Math.round((m.match_score || 0) * 100)}%</span></span>
                        <span className="capitalize">{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Detections */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 text-primary mb-4">
                <Eye className="w-4 h-4" /> Recent Detections ({filteredDetections.length})
              </h3>
              {filteredDetections.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No detections yet. Upload an urban image to start.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
                  {filteredDetections.slice(0, 10).map((d: any) => {
                    const cfg = typeConfig[d.detection_type] || typeConfig.waste;
                    const Icon = cfg.icon;
                    return (
                      <div key={d.id} className={`p-3 rounded-lg bg-secondary/40 border border-border hover:neon-border transition-all ${d.severity === "critical" ? "animate-pulse-neon" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`w-4 h-4 ${cfg.color}`} />
                          <span className="font-display text-xs font-bold tracking-wider">{cfg.label}</span>
                          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full border ${severityColors[d.severity]}`}>{d.severity}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{d.description}</p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                          <span>Conf: {Math.round(d.confidence * 100)}%</span>
                          <span>•</span>
                          <span>{new Date(d.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const UrbanMap = ({ detections }: { detections: any[] }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current).setView([30.0, 31.2], 7);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: "© OpenStreetMap © CARTO",
    }).addTo(mapInstance.current);
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.eachLayer((layer) => {
      if (!(layer instanceof L.TileLayer)) mapInstance.current?.removeLayer(layer);
    });

    detections.forEach((d) => {
      if (!d.lat || !d.lng) return;
      const isOpportunity = d.detection_type === "empty_land";
      const isConstruction = d.detection_type === "construction_activity";
      const color = isOpportunity ? "#22c55e" : isConstruction ? "#f59e0b" : "#ef4444";
      const isCritical = d.severity === "critical";

      // Main marker
      L.circleMarker([Number(d.lat), Number(d.lng)], {
        radius: isCritical ? 14 : d.severity === "high" ? 11 : 8,
        fillColor: color, color, weight: 2, opacity: 0.9, fillOpacity: 0.5,
        className: isCritical ? "critical-marker" : "",
      }).addTo(mapInstance.current!)
        .bindPopup(`<div style="color:#000;font-size:12px;min-width:150px">
          <strong style="color:${color}">${(typeConfig[d.detection_type] || typeConfig.waste).label}</strong><br/>
          <span style="font-size:11px">${d.description || "N/A"}</span><br/>
          <b>Severity:</b> ${d.severity}<br/>
          <b>Confidence:</b> ${Math.round(d.confidence * 100)}%<br/>
          <b>Time:</b> ${new Date(d.created_at).toLocaleString()}
        </div>`);

      // Blinking ring for critical
      if (isCritical) {
        L.circleMarker([Number(d.lat), Number(d.lng)], {
          radius: 20, fillColor: "transparent", color, weight: 1, opacity: 0.3, fillOpacity: 0,
          className: "critical-ring",
        }).addTo(mapInstance.current!);
      }
    });
  }, [detections]);

  return (
    <>
      <style>{`
        .critical-marker { animation: blink-marker 1.5s ease-in-out infinite; }
        .critical-ring { animation: pulse-ring 2s ease-out infinite; }
        @keyframes blink-marker { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pulse-ring { 0% { opacity: 0.6; transform: scale(1); } 100% { opacity: 0; transform: scale(1.8); } }
      `}</style>
      <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden" />
    </>
  );
};

export default UrbanDashboard;

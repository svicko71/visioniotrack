import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload, Search, MapPin, Bell, AlertTriangle, Clock, Eye,
  Radar, Activity, Users, ChevronRight, Loader2, Video, Volume2, Monitor
} from "lucide-react";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mockMissingPersons = [
  { id: 1, name: "يوسف سلامه", nameEn: "Youssef Salama", lastSeen: "Cairo, Tahrir Square", status: "active", match: 87, timestamp: "2026-04-02 14:23", lat: 30.0444, lng: 31.2357 },
  { id: 2, name: "أحمد وليد", nameEn: "Ahmed Walid", lastSeen: "Giza, Pyramids Area", status: "found", match: 94, timestamp: "2026-04-02 13:15", lat: 29.9792, lng: 31.1342 },
  { id: 3, name: "محمد ناصر", nameEn: "Mohamed Nasser", lastSeen: "Alexandria, Corniche", status: "active", match: 72, timestamp: "2026-04-02 12:05", lat: 31.2001, lng: 29.9187 },
  { id: 4, name: "محمد صياد", nameEn: "Mohamed Sayyad", lastSeen: "Luxor, Temple Area", status: "urgent", match: 65, timestamp: "2026-04-01 22:40", lat: 25.6872, lng: 32.6396 },
  { id: 5, name: "أحمد ياسر", nameEn: "Ahmed Yasser", lastSeen: "Aswan, Nile Corniche", status: "active", match: 81, timestamp: "2026-04-02 09:30", lat: 24.0889, lng: 32.8998 },
];

const alertsData = [
  { id: 1, message: "High match detected for يوسف سلامه near Tahrir Square", type: "match", time: "2 min ago", response: "Processing complete" },
  { id: 2, message: "Emergency alert resolved", type: "urgent", time: "5 min ago", response: "System response: 0.8s" },
  { id: 3, message: "New CCTV footage processed from Alexandria", type: "info", time: "15 min ago", response: "Resolution: 4K" },
  { id: 4, message: "High match detected near Pyramids", type: "match", time: "30 min ago", response: "Processing complete" },
  { id: 5, message: "Emergency alert resolved", type: "urgent", time: "1h ago", response: "System response: 0.8s" },
  { id: 6, message: "New CCTV footage processed from Cairo", type: "info", time: "2h ago", response: "Resolution: 4K" },
];

const Dashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [scanResults, setScanResults] = useState<typeof mockMissingPersons | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

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
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const startScan = () => {
    if (!photo) { toast.error("Please upload a photo first"); return; }
    if (!location) { toast.error("Please enter a location"); return; }
    setScanning(true);
    setScanResults(null);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 15;
      });
    }, 300);
    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      setScanning(false);
      setScanResults(mockMissingPersons);
      toast.success("Scan complete! Results found.");
    }, 3500);
  };

  const statusColor = (s: string) => {
    if (s === "found") return "text-accent neon-text-green";
    if (s === "urgent") return "text-destructive";
    return "text-primary neon-text";
  };

  const alertIcon = (type: string) => {
    if (type === "urgent") return <Volume2 className="w-5 h-5 text-accent" />;
    if (type === "match") return <Volume2 className="w-5 h-5 text-primary" />;
    return <Monitor className="w-5 h-5 text-muted-foreground" />;
  };

  const alertColor = (type: string) => {
    if (type === "match") return "text-primary";
    if (type === "urgent") return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <div className="py-6 px-4 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        {/* Header with HUD style */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-display font-black tracking-[0.2em] uppercase">
              <span className="text-primary neon-text">Dashboard</span>
            </h1>
            <div className="flex items-center gap-4 mt-2 text-xs font-display tracking-widest text-muted-foreground uppercase">
              <span>System Status: <span className="text-accent">Online</span></span>
              <span>Data Streams: <span className="text-primary">12</span></span>
            </div>
          </div>
          <Button
            variant={emergencyMode ? "destructive" : "outline"}
            onClick={() => {
              setEmergencyMode(!emergencyMode);
              toast(emergencyMode ? "Emergency mode disabled" : "🚨 Emergency mode activated!");
            }}
            className="font-display text-xs tracking-wider"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {emergencyMode ? "EMERGENCY ON" : "Emergency Mode"}
          </Button>
        </motion.div>

        {/* Stats Cards - HUD Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Active Cases", value: "3", icon: Users, color: "text-primary" },
            { label: "Found Today", value: "1", icon: Eye, color: "text-accent" },
            { label: "Scans Running", value: scanning ? "1" : "0", icon: Radar, color: "text-primary" },
            { label: "Alerts", value: String(alertsData.length), icon: Bell, color: "text-destructive" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative glass rounded-xl p-5 text-center overflow-hidden group hover:neon-border transition-all duration-500"
            >
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/40" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/40" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/40" />
              <div className={`text-4xl md:text-5xl font-display font-black ${s.color} neon-text mb-1`}>{s.value}</div>
              <div className="text-xs font-display tracking-widest uppercase text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel: Upload & Scan */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-4">
            {/* Upload Zone */}
            <div
              className={`relative glass rounded-xl p-6 transition-all duration-300 ${dragOver ? "neon-border" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-primary/20 rounded-xl pointer-events-none" />
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                <Upload className="w-4 h-4" /> Upload Photo Zone
              </h3>
              {photoPreview ? (
                <div className="relative mb-4">
                  <img src={photoPreview} alt="Uploaded" className="w-full h-48 object-cover rounded-lg border border-primary/30" />
                  <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-primary/5 transition-colors mb-4 rounded-lg">
                  <Upload className="w-10 h-10 text-primary/50 mb-3" />
                  <span className="text-sm text-muted-foreground font-display tracking-wider">Drag and drop files here</span>
                  <span className="text-xs text-muted-foreground/50 mt-1">or click to browse</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>
              )}

              <Input
                placeholder="Last known location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-secondary border-primary/20 mb-4 font-display text-sm"
              />

              <Button
                onClick={startScan}
                disabled={scanning}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-display tracking-[0.15em] uppercase text-sm h-12 neon-border"
              >
                {scanning ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning... {Math.min(100, Math.round(scanProgress))}%</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Start Scan</>
                )}
              </Button>

              {scanning && (
                <div className="mt-3 w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, scanProgress)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Center + Right: Results, Alerts, Map */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4">
            {/* Scanning animation */}
            <AnimatePresence>
              {scanning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-xl p-10 text-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 scan-line" />
                  <Radar className="w-20 h-20 text-primary mx-auto mb-4 animate-spin" style={{ animationDuration: "3s" }} />
                  <p className="font-display text-sm tracking-[0.2em] uppercase text-primary neon-text">Scanning video sources...</p>
                  <p className="text-xs text-muted-foreground mt-2">Analyzing CCTV feeds • Mobile uploads • Public sources</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Alerts Grid - matching reference image style */}
            <div className={`glass rounded-xl p-6 ${emergencyMode ? "neon-border" : ""}`}>
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                <Bell className="w-4 h-4" /> Live Alerts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {alertsData.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`p-4 rounded-lg bg-secondary/60 hover:bg-secondary/80 transition-all duration-300 ${
                      a.type === "urgent" && emergencyMode ? "animate-pulse-neon border border-destructive/50" : ""
                    } ${i === 1 ? "neon-border" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {alertIcon(a.type)}
                      <span className={`text-sm font-bold font-display tracking-wider ${alertColor(a.type)}`}>{a.message}</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-7">{a.response}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Results Table */}
            {scanResults && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6">
                <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                  <Eye className="w-4 h-4" /> Scan Results
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 text-xs text-muted-foreground font-display tracking-wider">Name</th>
                        <th className="pb-3 text-xs text-muted-foreground font-display tracking-wider">Match</th>
                        <th className="pb-3 text-xs text-muted-foreground font-display tracking-wider">Location</th>
                        <th className="pb-3 text-xs text-muted-foreground font-display tracking-wider">Time</th>
                        <th className="pb-3 text-xs text-muted-foreground font-display tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanResults.map((r) => (
                        <tr key={r.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="py-3">
                            <div className="font-medium">{r.name}</div>
                            <div className="text-[10px] text-muted-foreground">{r.nameEn}</div>
                          </td>
                          <td className="py-3">
                            <span className={`font-display font-bold text-lg ${r.match >= 90 ? "text-accent neon-text-green" : r.match >= 80 ? "text-primary neon-text" : "text-muted-foreground"}`}>
                              {r.match}%
                            </span>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.lastSeen}</span>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {r.timestamp}</span>
                          </td>
                          <td className="py-3">
                            <span className={`text-xs font-display tracking-wider uppercase ${statusColor(r.status)}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Coverage Map */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2 text-primary">
                  <MapPin className="w-4 h-4" /> Coverage: Nationwide
                </h3>
              </div>
              <DashboardMap persons={scanResults || mockMissingPersons} emergencyMode={emergencyMode} />
            </div>

            {/* Timeline */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                <Clock className="w-4 h-4" /> Movement Timeline
              </h3>
              <div className="space-y-3">
                {(scanResults || mockMissingPersons).slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary neon-border flex-shrink-0" />
                    <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                      <div>
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{p.lastSeen}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> {p.timestamp}
                        <ChevronRight className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!scanning && !scanResults && (
              <div className="glass rounded-xl p-10 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-display tracking-wider">Upload a photo and enter a location to start scanning</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const DashboardMap = ({ persons, emergencyMode }: { persons: typeof mockMissingPersons; emergencyMode: boolean }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    mapInstance.current = L.map(mapRef.current).setView([28.5, 31], 6);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap © CARTO',
    }).addTo(mapInstance.current);
    return () => { mapInstance.current?.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Polyline) {
        if (!(layer instanceof L.TileLayer)) mapInstance.current?.removeLayer(layer);
      }
    });

    persons.forEach((p) => {
      const color = p.status === "urgent" ? "#ef4444" : p.status === "found" ? "#00e68a" : "#00e5ff";
      L.circleMarker([p.lat, p.lng], {
        radius: 10, fillColor: color, color: color, weight: 2, opacity: 0.9, fillOpacity: 0.6,
      }).addTo(mapInstance.current!)
        .bindPopup(`<div style="color:#000;font-size:12px"><strong>${p.name}</strong><br/>${p.lastSeen}<br/>Match: ${p.match}%</div>`);
    });

    if (persons.length >= 2) {
      const coords = persons.map(p => [p.lat, p.lng] as [number, number]);
      L.polyline(coords, { color: "#00e5ff", weight: 2, dashArray: "8,8", opacity: 0.5 }).addTo(mapInstance.current);
    }
  }, [persons, emergencyMode]);

  return <div ref={mapRef} className="w-full h-96 rounded-lg overflow-hidden" />;
};

export default Dashboard;

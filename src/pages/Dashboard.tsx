import { motion } from "framer-motion";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload, Search, MapPin, Bell, AlertTriangle, Clock, Eye,
  Radar, Activity, Users, ChevronRight, Loader2
} from "lucide-react";
import { toast } from "sonner";

// Mock data for missing persons (team members as test data)
const mockMissingPersons = [
  { id: 1, name: "يوسف سلامه", nameEn: "Youssef Salama", lastSeen: "Cairo, Tahrir Square", status: "active", match: 87, timestamp: "2026-04-02 14:23", lat: 30.0444, lng: 31.2357 },
  { id: 2, name: "أحمد وليد", nameEn: "Ahmed Walid", lastSeen: "Giza, Pyramids Area", status: "found", match: 94, timestamp: "2026-04-02 13:15", lat: 29.9792, lng: 31.1342 },
  { id: 3, name: "محمد ناصر", nameEn: "Mohamed Nasser", lastSeen: "Alexandria, Corniche", status: "active", match: 72, timestamp: "2026-04-02 12:05", lat: 31.2001, lng: 29.9187 },
  { id: 4, name: "محمد صياد", nameEn: "Mohamed Sayyad", lastSeen: "Luxor, Temple Area", status: "urgent", match: 65, timestamp: "2026-04-01 22:40", lat: 25.6872, lng: 32.6396 },
  { id: 5, name: "أحمد ياسر", nameEn: "Ahmed Yasser", lastSeen: "Aswan, Nile Corniche", status: "active", match: 81, timestamp: "2026-04-02 09:30", lat: 24.0889, lng: 32.8998 },
];

const alerts = [
  { id: 1, message: "High match detected for يوسف سلامه near Tahrir Square", type: "match", time: "2 min ago" },
  { id: 2, message: "Emergency alert: محمد صياد last seen in Luxor", type: "urgent", time: "15 min ago" },
  { id: 3, message: "New CCTV footage processed from Alexandria", type: "info", time: "1 hour ago" },
  { id: 4, message: "أحمد وليد confirmed found near Pyramids", type: "found", time: "3 hours ago" },
];

const Dashboard = () => {
  const [scanning, setScanning] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [scanResults, setScanResults] = useState<typeof mockMissingPersons | null>(null);
  const [dragOver, setDragOver] = useState(false);

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
    setTimeout(() => {
      setScanning(false);
      setScanResults(mockMissingPersons);
      toast.success("Scan complete! Results found.");
    }, 3000);
  };

  const statusColor = (s: string) => {
    if (s === "found") return "text-accent neon-text-green";
    if (s === "urgent") return "text-destructive";
    return "text-primary neon-text";
  };

  const alertIcon = (type: string) => {
    if (type === "urgent") return <AlertTriangle className="w-4 h-4 text-destructive" />;
    if (type === "found") return <Eye className="w-4 h-4 text-accent" />;
    if (type === "match") return <Radar className="w-4 h-4 text-primary" />;
    return <Activity className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-wider">
              <span className="text-primary neon-text">Dashboard</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">AI-Powered Missing Persons Search</p>
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

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Active Cases", value: "3", icon: Users, color: "text-primary" },
            { label: "Found Today", value: "1", icon: Eye, color: "text-accent" },
            { label: "Scans Running", value: scanning ? "1" : "0", icon: Radar, color: "text-neon-blue" },
            { label: "Alerts", value: "4", icon: Bell, color: "text-destructive" },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-xl p-4 text-center"
            >
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
              <div className="text-2xl font-display font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload & Scan Panel */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1 space-y-4">
            {/* Upload */}
            <div
              className={`glass rounded-xl p-6 transition-all duration-300 ${dragOver ? "neon-border" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <h3 className="font-display text-sm font-bold tracking-wider mb-4 flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" /> Upload Photo
              </h3>
              {photoPreview ? (
                <div className="relative mb-4">
                  <img src={photoPreview} alt="Uploaded" className="w-full h-40 object-cover rounded-lg" />
                  <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >✕</button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors mb-4">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Drag & drop or click to upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>
              )}

              <Input
                placeholder="Last known location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-secondary border-border mb-4"
              />

              <Button
                onClick={startScan}
                disabled={scanning}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-display tracking-wider"
              >
                {scanning ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                ) : (
                  <><Search className="w-4 h-4 mr-2" /> Start Scan</>
                )}
              </Button>
            </div>

            {/* Alerts */}
            <div className={`glass rounded-xl p-6 ${emergencyMode ? "neon-border" : ""}`}>
              <h3 className="font-display text-sm font-bold tracking-wider mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" /> Alerts
              </h3>
              <div className="space-y-3">
                {alerts.map((a) => (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-secondary/50 ${a.type === "urgent" && emergencyMode ? "animate-pulse-neon border border-destructive/50" : ""}`}
                  >
                    {alertIcon(a.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed">{a.message}</p>
                      <span className="text-[10px] text-muted-foreground">{a.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Results & Map */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-4">
            {/* Scanning animation */}
            {scanning && (
              <div className="glass rounded-xl p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 scan-line" />
                <Radar className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" style={{ animationDuration: "3s" }} />
                <p className="font-display text-sm tracking-wider text-primary neon-text">Scanning video sources...</p>
                <p className="text-xs text-muted-foreground mt-2">Analyzing CCTV feeds, mobile uploads, and public sources</p>
              </div>
            )}

            {/* Results Table */}
            {scanResults && (
              <div className="glass rounded-xl p-6">
                <h3 className="font-display text-sm font-bold tracking-wider mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> Scan Results
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
                            <span className={`font-display font-bold ${r.match >= 90 ? "text-accent neon-text-green" : r.match >= 80 ? "text-primary neon-text" : "text-muted-foreground"}`}>
                              {r.match}%
                            </span>
                          </td>
                          <td className="py-3 text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {r.lastSeen}
                          </td>
                          <td className="py-3 text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {r.timestamp}
                          </td>
                          <td className="py-3">
                            <span className={`text-xs font-display tracking-wider uppercase ${statusColor(r.status)}`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Map Placeholder */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-sm font-bold tracking-wider mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Prediction Map
              </h3>
              <DashboardMap persons={scanResults || mockMissingPersons} emergencyMode={emergencyMode} />
            </div>

            {/* Timeline */}
            <div className="glass rounded-xl p-6">
              <h3 className="font-display text-sm font-bold tracking-wider mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Movement Timeline
              </h3>
              <div className="space-y-3">
                {(scanResults || mockMissingPersons).slice(0, 4).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary neon-border flex-shrink-0" />
                    <div className="flex-1 flex items-center justify-between p-3 rounded-lg bg-secondary/30">
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

            {/* No results message */}
            {!scanning && !scanResults && (
              <div className="glass rounded-xl p-10 text-center">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Upload a photo and enter a location to start scanning</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Simple interactive map using Leaflet
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DashboardMap = ({ persons, emergencyMode }: { persons: typeof mockMissingPersons; emergencyMode: boolean }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current).setView([28.5, 31], 6);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap © CARTO',
    }).addTo(mapInstance.current);

    return () => {
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    persons.forEach((p) => {
      const color = p.status === "urgent" ? "#ef4444" : p.status === "found" ? "#00e68a" : "#00e5ff";
      L.circleMarker([p.lat, p.lng], {
        radius: 8,
        fillColor: color,
        color: color,
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.6,
      })
        .addTo(mapInstance.current!)
        .bindPopup(`<div style="color:#000;font-size:12px"><strong>${p.name}</strong><br/>${p.lastSeen}<br/>Match: ${p.match}%</div>`);
    });

    // Draw prediction paths
    if (persons.length >= 2) {
      const coords = persons.map(p => [p.lat, p.lng] as [number, number]);
      L.polyline(coords, { color: "#00e5ff", weight: 2, dashArray: "8,8", opacity: 0.5 }).addTo(mapInstance.current);
    }
  }, [persons, emergencyMode]);

  return <div ref={mapRef} className="w-full h-80 rounded-lg overflow-hidden" />;
};

export default Dashboard;

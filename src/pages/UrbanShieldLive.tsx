import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Trash2, Hammer, Building2, Sprout, Cpu, Clock, Camera, CheckCircle2, MapPin, Languages } from "lucide-react";
import CameraConnectionDialog from "@/components/CameraConnectionDialog";

const CLASSES = [
  { id: "waste", en: "Waste Accumulation", ar: "تراكم النفايات", color: "#ef4444", icon: Trash2 },
  { id: "damage", en: "Structural Damage", ar: "أضرار إنشائية", color: "#f97316", icon: Hammer },
  { id: "illegal", en: "Illegal Construction", ar: "بناء مخالف", color: "#eab308", icon: Building2 },
  { id: "dev", en: "Development Opportunity", ar: "فرصة تطوير", color: "#22c55e", icon: Sprout },
];

const DEPARTMENTS = ["Municipal Engineering", "Sanitation", "Planning Authority"];

interface Detection { id: number; classId: string; conf: number; ts: number; location: string; }

function rand(a: number, b: number) { return Math.random() * (b - a) + a; }
const LOCATIONS = ["Downtown · Zone 4", "Nile Corniche", "Heliopolis · Sec 3", "Maadi · Block B", "Giza Square"];

export default function UrbanShieldLive() {
  const [bilingual, setBilingual] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [alerts, setAlerts] = useState<(Detection & { dept: string; resolved: boolean })[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [cpu, setCpu] = useState(42);
  const [uptime, setUptime] = useState(0);
  const [lastFrame, setLastFrame] = useState(Date.now());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef(0);

  // Simulation tick
  useEffect(() => {
    const id = setInterval(() => {
      setUptime(u => u + 1);
      setCpu(c => Math.max(20, Math.min(85, c + rand(-4, 4))));
      setLastFrame(Date.now());

      if (Math.random() > 0.3) {
        const cls = CLASSES[Math.floor(Math.random() * CLASSES.length)];
        const det: Detection = {
          id: counterRef.current++,
          classId: cls.id,
          conf: rand(0.5, 0.97),
          ts: Date.now(),
          location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
        };
        setDetections(d => [det, ...d].slice(0, 5));
        if (det.conf > 0.75) {
          setAlerts(a => [{ ...det, dept: DEPARTMENTS[Math.floor(Math.random() * DEPARTMENTS.length)], resolved: false }, ...a].slice(0, 30));
        }
      }
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Draw canvas overlay with bounding boxes
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    // Background gradient as placeholder feed
    const g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0, "#0f172a"); g.addColorStop(1, "#1e293b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    // Scan lines
    ctx.strokeStyle = "rgba(34,211,238,0.05)";
    for (let y = 0; y < c.height; y += 4) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(c.width, y); ctx.stroke(); }
    // Bounding boxes
    detections.slice(0, 4).forEach((d, i) => {
      const cls = CLASSES.find(x => x.id === d.classId)!;
      const x = 60 + i * 140 + rand(-10, 10);
      const y = 80 + (i % 2) * 120 + rand(-10, 10);
      const w = 110, h = 90;
      ctx.strokeStyle = cls.color; ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = cls.color; ctx.fillRect(x, y - 18, ctx.measureText(cls.en).width + 60, 18);
      ctx.fillStyle = "#0f172a"; ctx.font = "11px ui-monospace,monospace";
      ctx.fillText(`${cls.en}  ${(d.conf * 100).toFixed(0)}%`, x + 4, y - 5);
    });
  }, [detections]);

  const counts = CLASSES.map(c => ({ name: c.en, value: alerts.filter(a => a.classId === c.id).length || 1, color: c.color }));

  const heatmap = Array.from({ length: 24 }, (_, i) => ({ h: i, v: Math.floor(rand(0, 12)) }));

  const fmtUptime = () => {
    const m = Math.floor(uptime / 60), s = uptime % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 pt-20">
      {/* Sidebar */}
      <aside className="md:w-80 bg-slate-900 text-slate-100 p-5 space-y-4 md:min-h-[calc(100vh-5rem)]">
        <div className="flex items-center justify-between">
          <h2 className="text-sm uppercase tracking-widest text-slate-400">Live Detections</h2>
          <button onClick={() => setBilingual(b => !b)} className="text-slate-400 hover:text-cyan-400" title="Toggle bilingual">
            <Languages className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {detections.length === 0 && <p className="text-xs text-slate-500">No detections yet…</p>}
          {detections.map(d => {
            const cls = CLASSES.find(c => c.id === d.classId)!;
            const Icon = cls.icon;
            return (
              <div key={d.id} className="flex items-start gap-3 p-2.5 rounded-md bg-slate-800/60 border border-slate-700/60">
                <div className="p-1.5 rounded" style={{ background: `${cls.color}30` }}>
                  <Icon className="h-4 w-4" style={{ color: cls.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{cls.en}</div>
                  {bilingual && <div className="text-xs text-slate-400 truncate" dir="rtl">{cls.ar}</div>}
                  <div className="text-[11px] text-slate-500 mt-0.5">{new Date(d.ts).toLocaleTimeString()} · {d.location}</div>
                </div>
                <Badge className="text-[10px]" style={{ background: `${cls.color}30`, color: cls.color, border: `1px solid ${cls.color}60` }}>
                  {(d.conf * 100).toFixed(0)}%
                </Badge>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800">
          <h3 className="text-sm uppercase tracking-widest text-slate-400 mb-3">System Health</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-400 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> CPU</span><span className="font-mono">{cpu.toFixed(0)}%</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Uptime</span><span className="font-mono">{fmtUptime()}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400 flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" /> Last frame</span><span className="font-mono text-xs">{new Date(lastFrame).toLocaleTimeString()}</span></div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Urban Shield · {bilingual && <span className="text-slate-500" dir="rtl">الدرع الحضري</span>}</h1>
            <p className="text-sm text-slate-500">YOLOv8 on Raspberry Pi 4 · field trial mode</p>
          </div>
          <div className="flex gap-2">
            {sessionActive && <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Session Live</Badge>}
            <Button onClick={() => setCameraOpen(true)} variant="outline" className="border-slate-300">
              <Camera className="h-4 w-4 mr-1.5" /> Connect Camera
            </Button>
          </div>
        </div>

        {/* Live feed */}
        <Card className="p-4 bg-white border-slate-200">
          <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-3">Live Feed</h2>
          <div className="aspect-video w-full rounded-md overflow-hidden border border-slate-200 bg-slate-900">
            <canvas ref={canvasRef} width={960} height={540} className="w-full h-full" />
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {CLASSES.map(c => (
              <div key={c.id} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: c.color }} />
                <span>{c.en}{bilingual && <span className="text-slate-400" dir="rtl"> · {c.ar}</span>}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-4 bg-white border-slate-200">
          <h2 className="text-sm uppercase tracking-wider text-slate-500 mb-3">Active Alerts <span className="text-slate-400 normal-case text-xs">(confidence &gt; 75%)</span></h2>
          <div className="space-y-2 max-h-80 overflow-auto">
            {alerts.length === 0 && <p className="text-sm text-slate-400">No alerts yet.</p>}
            {alerts.map(a => {
              const cls = CLASSES.find(c => c.id === a.classId)!;
              return (
                <div key={a.id} className={`p-3 rounded-md border ${a.resolved ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ background: cls.color }} />
                        <span className="font-medium text-slate-900 text-sm">{cls.en}</span>
                        {bilingual && <span className="text-xs text-slate-500" dir="rtl">{cls.ar}</span>}
                        <Badge variant="outline" className="text-[10px]" style={{ color: cls.color, borderColor: `${cls.color}60` }}>{(a.conf * 100).toFixed(0)}%</Badge>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{a.location}</span>
                        <span>{new Date(a.ts).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={a.dept} onValueChange={(v) => setAlerts(arr => arr.map(x => x.id === a.id ? { ...x, dept: v } : x))}>
                        <SelectTrigger className="h-8 text-xs w-44 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                        <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                      </Select>
                      <Button size="sm" variant={a.resolved ? "outline" : "default"} onClick={() => setAlerts(arr => arr.map(x => x.id === a.id ? { ...x, resolved: !x.resolved } : x))}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> {a.resolved ? "Reopen" : "Resolve"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-4 bg-white border-slate-200">
            <h3 className="text-sm uppercase tracking-wider text-slate-500 mb-3">Today by Class</h3>
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={counts} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {counts.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-4 bg-white border-slate-200">
            <h3 className="text-sm uppercase tracking-wider text-slate-500 mb-3">24h Activity Heatmap</h3>
            <div className="grid grid-cols-12 gap-1">
              {heatmap.map(h => {
                const intensity = Math.min(1, h.v / 12);
                return (
                  <div key={h.h} className="aspect-square rounded-sm flex items-end justify-center text-[9px] text-slate-400" style={{ background: `rgba(34,197,94,${0.1 + intensity * 0.7})` }}>
                    <span className="mb-0.5">{h.h}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Hour of day · darker = more detections</p>
          </Card>
        </div>
      </main>

      <CameraConnectionDialog open={cameraOpen} onOpenChange={setCameraOpen} onSessionStart={() => setSessionActive(true)} />
    </div>
  );
}

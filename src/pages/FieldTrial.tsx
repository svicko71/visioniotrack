import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, ReferenceLine,
} from "recharts";
import { Activity, Gauge, AlertTriangle, ScanSearch, Download } from "lucide-react";
import { usePiConfig } from "@/hooks/usePiConfig";
import PiConfigPanel, { LiveBadge, PiOfflineBanner } from "@/components/PiConfigPanel";

interface LogRow { ts: number; cls: string; conf: number; latency: number; fp: boolean; }

const CLASSES = ["Waste Accumulation", "Structural Damage", "Illegal Construction", "Development Opportunity"];
const rand = (a: number, b: number) => Math.random() * (b - a) + a;
const latencyColor = (ms: number) => ms < 250 ? "text-emerald-400" : ms <= 350 ? "text-amber-400" : "text-rose-400";
const latencyBg = (ms: number) => ms < 250 ? "border-emerald-500/30" : ms <= 350 ? "border-amber-500/30" : "border-rose-500/30";

export default function FieldTrial() {
  const { wsUrl, connected } = usePiConfig();
  const [latencySeries, setLatencySeries] = useState<{ t: number; v: number }[]>([]);
  const [fpsWindows, setFpsWindows] = useState<{ w: string; v: number }[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [liveFpr, setLiveFpr] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [wsLive, setWsLive] = useState(false);
  const fpsAccRef = useRef<{ count: number; sum: number; start: number }>({ count: 0, sum: 0, start: Date.now() });

  // Live WS connection
  useEffect(() => {
    let cancelled = false;
    let retry: any;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => { if (!cancelled) setWsLive(true); };
        ws.onclose = () => {
          if (cancelled) return;
          setWsLive(false);
          retry = setTimeout(connect, 5000);
        };
        ws.onerror = () => { ws.close(); };
        ws.onmessage = (ev) => {
          try {
            const m = JSON.parse(ev.data);
            const now = Date.now();
            if (typeof m.latency_ms === "number") {
              setLatencySeries((s) => [...s.slice(-59), { t: now, v: Math.round(m.latency_ms) }]);
            }
            if (typeof m.fps === "number") {
              const acc = fpsAccRef.current;
              acc.count++; acc.sum += m.fps;
              if (now - acc.start >= 10000) {
                const avg = +(acc.sum / acc.count).toFixed(1);
                setFpsWindows((s) => [...s.slice(-11), { w: new Date(now).toLocaleTimeString().slice(3, 8), v: avg }]);
                fpsAccRef.current = { count: 0, sum: 0, start: now };
              }
            }
            if (typeof m.false_positive_rate === "number") setLiveFpr(m.false_positive_rate * 100);
            if (Array.isArray(m.detections)) {
              const rows: LogRow[] = m.detections.map((d: any) => ({
                ts: now,
                cls: d.class || "Unknown",
                conf: d.confidence ?? 0,
                latency: Math.round(d.latency_ms ?? m.latency_ms ?? 0),
                fp: !!d.false_positive,
              }));
              if (rows.length) setLogs((l) => [...rows, ...l].slice(0, 500));
            }
          } catch {}
        };
      } catch {
        retry = setTimeout(connect, 5000);
      }
    };
    connect();
    return () => { cancelled = true; clearTimeout(retry); wsRef.current?.close(); };
  }, [wsUrl]);

  // Simulation fallback when not live
  useEffect(() => {
    if (wsLive) return;
    const id = setInterval(() => {
      const now = Date.now();
      const lat = rand(180, 360);
      setLatencySeries((s) => [...s.slice(-59), { t: now, v: Math.round(lat) }]);
      if (now % 10000 < 1000) {
        const fps = rand(6, 12);
        setFpsWindows((s) => [...s.slice(-11), { w: new Date(now).toLocaleTimeString().slice(3, 8), v: +fps.toFixed(1) }]);
      }
      if (Math.random() > 0.4) {
        setLogs((l) => [{ ts: now, cls: CLASSES[Math.floor(Math.random() * CLASSES.length)], conf: rand(0.6, 0.95), latency: Math.round(lat), fp: Math.random() < 0.08 }, ...l].slice(0, 200));
      }
    }, 1000);
    return () => clearInterval(id);
  }, [wsLive]);

  const stats = useMemo(() => {
    const last = latencySeries.slice(-30);
    const avg = last.length ? last.reduce((a, b) => a + b.v, 0) / last.length : 0;
    const fps = fpsWindows.length ? fpsWindows[fpsWindows.length - 1].v : 0;
    const fpRate = liveFpr ?? (logs.length ? (logs.filter(l => l.fp).length / logs.length) * 100 : 0);
    return { avg, fps, fpRate, total: logs.length };
  }, [latencySeries, fpsWindows, logs, liveFpr]);

  const exportCSV = () => {
    const header = "Timestamp,Detection Class,Confidence,Latency (ms),FP Flag\n";
    const rows = logs.map(l => `${new Date(l.ts).toISOString()},${l.cls},${l.conf.toFixed(3)},${l.latency},${l.fp ? "yes" : "no"}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `vt-session-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const Metric = ({ icon: Icon, label, value, suffix, accent }: any) => (
    <Card className={`p-4 bg-slate-900/60 border ${accent || "border-slate-800"}`}>
      <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
        <span>{label}</span><Icon className="h-4 w-4" />
      </div>
      <div className="mt-2 text-3xl font-mono font-semibold tabular-nums">{value}<span className="text-base text-slate-500 ml-1">{suffix}</span></div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 sm:px-6 py-6 pt-24">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display tracking-wide">Field Trial Monitor</h1>
            <p className="text-sm text-slate-400">VisionTrack Urban Shield · live edge telemetry</p>
          </div>
          <div className="flex items-center gap-2">
            <LiveBadge />
            <Button onClick={exportCSV} size="sm"><Download className="h-4 w-4 mr-1.5" /> Export CSV</Button>
          </div>
        </div>

        <PiConfigPanel />
        <PiOfflineBanner />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Metric icon={Activity} label="Avg Latency" value={stats.avg.toFixed(0)} suffix="ms" accent={latencyBg(stats.avg)} />
          <Metric icon={Gauge} label="Current FPS" value={stats.fps.toFixed(1)} suffix="" />
          <Metric icon={AlertTriangle} label="False Positive Rate" value={stats.fpRate.toFixed(1)} suffix="%" />
          <Metric icon={ScanSearch} label="Total Detections" value={stats.total} suffix="" />
        </div>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wider text-slate-300">Latency · last 60s</h2>
            <span className={`text-sm font-mono ${latencyColor(stats.avg)}`}>{stats.avg.toFixed(0)} ms</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={latencySeries.map(d => ({ t: new Date(d.t).toLocaleTimeString().slice(3, 8), v: d.v }))}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="t" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[150, 400]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", color: "#e2e8f0" }} />
                <ReferenceLine y={250} stroke="#10b981" strokeDasharray="3 3" />
                <ReferenceLine y={350} stroke="#f59e0b" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="v" stroke="#22d3ee" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <h2 className="text-sm uppercase tracking-wider text-slate-300 mb-3">FPS Stability · per 10s window</h2>
          <div className="h-52">
            <ResponsiveContainer>
              <BarChart data={fpsWindows}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="w" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 15]} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", color: "#e2e8f0" }} />
                <Bar dataKey="v" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-wider text-slate-300">Session Log</h2>
            <span className="text-xs text-slate-500">{logs.length} events</span>
          </div>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-2">Timestamp</th>
                  <th className="text-left px-4 py-2">Class</th>
                  <th className="text-left px-4 py-2">Confidence</th>
                  <th className="text-left px-4 py-2">Latency</th>
                  <th className="text-left px-4 py-2">FP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => (
                  <tr key={i} className="border-t border-slate-800/60 hover:bg-slate-800/40">
                    <td className="px-4 py-2 text-slate-400 font-mono text-xs">{new Date(l.ts).toLocaleTimeString()}</td>
                    <td className="px-4 py-2">{l.cls}</td>
                    <td className="px-4 py-2 font-mono">{(l.conf * 100).toFixed(1)}%</td>
                    <td className={`px-4 py-2 font-mono ${latencyColor(l.latency)}`}>{l.latency} ms</td>
                    <td className="px-4 py-2">{l.fp ? <Badge className="bg-rose-500/20 text-rose-300 border border-rose-500/40">YES</Badge> : <span className="text-slate-500 text-xs">no</span>}</td>
                  </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-500">Awaiting detections…</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

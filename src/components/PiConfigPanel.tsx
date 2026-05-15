import { useState } from "react";
import { usePiConfig } from "@/hooks/usePiConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cpu, Wifi, WifiOff, Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function PiConfigPanel({ compact = false }: { compact?: boolean }) {
  const { piIp, setPiIp, status, specs, testConnection } = usePiConfig();
  const [draft, setDraft] = useState(piIp);

  const StatusDot = ({ s }: { s: "idle" | "ok" | "fail" | "testing" }) => {
    if (s === "testing") return <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />;
    if (s === "ok") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />;
    if (s === "fail") return <XCircle className="h-3.5 w-3.5 text-rose-400" />;
    return <span className="h-2 w-2 rounded-full bg-slate-500 inline-block" />;
  };

  const handleConnect = async () => {
    if (draft !== piIp) setPiIp(draft);
    await testConnection();
  };

  return (
    <div className={`rounded-lg border border-slate-800 bg-slate-900/70 ${compact ? "p-3" : "p-4"} text-slate-200`}>
      <div className="flex items-center gap-2 mb-2">
        <Cpu className="h-4 w-4 text-cyan-400" />
        <span className="text-xs uppercase tracking-widest text-slate-400">Raspberry Pi · Edge Device</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="192.168.1.100"
          className="bg-slate-950 border-slate-700 font-mono text-sm flex-1"
        />
        <Button onClick={handleConnect} size="sm" disabled={status.ws === "testing"}>
          {status.ws === "testing" ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Wifi className="h-4 w-4 mr-1.5" />}
          Connect to Pi
        </Button>
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        <div className="flex items-center gap-1.5"><StatusDot s={status.ws} /><span className="text-slate-400">WebSocket</span><span className="font-mono text-slate-500">:8765</span></div>
        <div className="flex items-center gap-1.5"><StatusDot s={status.mjpeg} /><span className="text-slate-400">MJPEG</span><span className="font-mono text-slate-500">:8766</span></div>
        {status.ws === "fail" && status.mjpeg === "fail" && (
          <Button variant="link" size="sm" className="h-auto p-0 text-amber-400" onClick={() => testConnection()}>Retry</Button>
        )}
      </div>
      {specs && (
        <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-slate-500">Resolution:</span> <span className="font-mono">{specs.resolution || "—"}</span></div>
          <div><span className="text-slate-500">FPS:</span> <span className="font-mono">{specs.fps || "—"}</span></div>
          <div><span className="text-slate-500">Model:</span> <span className="font-mono">{specs.model || "—"}</span></div>
        </div>
      )}
    </div>
  );
}

export function PiOfflineBanner() {
  const { status } = usePiConfig();
  if (status.ws === "ok" || status.ws === "idle" || status.ws === "testing") return null;
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-300 text-sm">
      <WifiOff className="h-4 w-4" />
      <span>Pi not connected — running in simulation mode.</span>
    </div>
  );
}

export function LiveBadge() {
  const { connected } = usePiConfig();
  return (
    <Badge variant="outline" className={connected ? "border-emerald-500/40 text-emerald-400 gap-1.5" : "border-amber-500/40 text-amber-400 gap-1.5"}>
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
      {connected ? "LIVE" : "SIMULATED"}
    </Badge>
  );
}

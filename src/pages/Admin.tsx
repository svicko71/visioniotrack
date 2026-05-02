import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Shield, Bell, Key, Lock, Database, Users, Terminal,
  Sliders, Eye, EyeOff, Copy, RefreshCw, CheckCircle2,
  AlertTriangle, Server, ShieldCheck, FileLock2
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const generateKey = () =>
  "vt_" + Array.from({ length: 32 }, () =>
    "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
  ).join("");

const ROLES = [
  { name: "Admin", count: 3, color: "text-destructive", desc: "Full system access · audit trail" },
  { name: "Operator", count: 12, color: "text-primary", desc: "Run searches · manage cases" },
  { name: "Viewer", count: 27, color: "text-accent", desc: "Read-only access" },
];

const SAMPLE_LOGS = [
  { lvl: "info", msg: "operator login · session token issued", who: "op-014" },
  { lvl: "warn", msg: "rate-limit triggered · /v1/search", who: "api-key 7e..d2" },
  { lvl: "info", msg: "case created · #VT-2026-0411", who: "op-007" },
  { lvl: "info", msg: "model swap · vt-face-v3.2 → v3.2.1", who: "admin" },
  { lvl: "warn", msg: "low-quality probe · enhancement applied", who: "op-009" },
  { lvl: "info", msg: "vector index compacted · 2.4M rows", who: "system" },
  { lvl: "error", msg: "edge node EDGE-31 timeout · failover OK", who: "system" },
  { lvl: "info", msg: "data retention sweep · 0 records purged", who: "system" },
];

const Admin = () => {
  const [sensitivity, setSensitivity] = useState([72]);
  const [autoAlert, setAutoAlert] = useState(true);
  const [smsAlert, setSmsAlert] = useState(false);
  const [emailAlert, setEmailAlert] = useState(true);
  const [retentionDays, setRetentionDays] = useState([90]);
  const [encryption, setEncryption] = useState(true);
  const [anonymize, setAnonymize] = useState(true);
  const [requireMfa, setRequireMfa] = useState(true);
  const [apiKey, setApiKey] = useState(generateKey());
  const [showKey, setShowKey] = useState(false);
  const [logs, setLogs] = useState(SAMPLE_LOGS);

  useEffect(() => {
    const t = setInterval(() => {
      const sample = SAMPLE_LOGS[Math.floor(Math.random() * SAMPLE_LOGS.length)];
      setLogs((prev) => [{ ...sample }, ...prev].slice(0, 14));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied to clipboard");
  };

  const rotateKey = () => {
    setApiKey(generateKey());
    toast.success("API key rotated · old key revoked");
  };

  const lvlColor = (l: string) =>
    l === "error" ? "text-destructive" : l === "warn" ? "text-primary" : "text-muted-foreground";

  return (
    <div className="py-6 px-4 min-h-screen">
      <div className="container mx-auto max-w-7xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between border-b border-border pb-4"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-display tracking-[0.3em] text-muted-foreground uppercase">
              <Shield className="w-3 h-3 text-primary" /> Admin & System Settings
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-[0.15em] uppercase mt-2">
              Control <span className="text-primary neon-text">Panel</span>
            </h1>
          </div>
          <Badge variant="outline" className="border-accent text-accent font-display tracking-widest hidden md:flex">
            <ShieldCheck className="w-3 h-3 mr-1" /> Compliance OK
          </Badge>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Configuration */}
          <div className="glass rounded-xl p-5 space-y-6 lg:col-span-2">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
              <Sliders className="w-4 h-4" /> AI Configuration
            </h3>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                  Match Sensitivity
                </label>
                <span className="text-2xl font-display font-black text-primary neon-text">{sensitivity[0]}</span>
              </div>
              <Slider value={sensitivity} onValueChange={setSensitivity} min={40} max={95} step={1} />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-display tracking-widest">
                <span>PERMISSIVE</span>
                <span>BALANCED</span>
                <span>STRICT</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Lower values surface more candidates · higher values minimise false positives.
              </p>
            </div>

            <div className="border-t border-border pt-5">
              <h4 className="text-xs font-display tracking-widest uppercase text-muted-foreground mb-3 flex items-center gap-2">
                <Bell className="w-3 h-3" /> Alert Routing
              </h4>
              <div className="space-y-3">
                {[
                  { v: autoAlert, set: setAutoAlert, l: "Auto-escalate matches above 90%" },
                  { v: emailAlert, set: setEmailAlert, l: "Email operator on new high-confidence match" },
                  { v: smsAlert, set: setSmsAlert, l: "SMS gateway · emergency tier only" },
                ].map((row) => (
                  <div key={row.l} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 border border-border">
                    <span className="text-sm">{row.l}</span>
                    <Switch checked={row.v} onCheckedChange={row.set} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Roles */}
          <div className="glass rounded-xl p-5">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" /> Access Control
            </h3>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <div key={r.name} className="p-3 rounded-lg bg-secondary/40 border border-border">
                  <div className="flex items-center justify-between">
                    <span className={`font-display text-sm font-bold tracking-wider ${r.color}`}>{r.name}</span>
                    <span className="text-lg font-display font-black text-foreground">{r.count}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Require MFA on Admin</span>
              <Switch checked={requireMfa} onCheckedChange={setRequireMfa} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* API Keys */}
          <div className="glass rounded-xl p-5 lg:col-span-2">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
              <Key className="w-4 h-4" /> API Key Management
            </h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/40 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                    Production Key
                  </span>
                  <Badge variant="outline" className="text-accent border-accent text-[10px]">ACTIVE</Badge>
                </div>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    className="font-mono text-xs bg-background"
                  />
                  <Button size="icon" variant="outline" onClick={() => setShowKey(!showKey)}>
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="outline" onClick={copyKey}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="outline" onClick={rotateKey}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                  Last rotated: just now · Scopes: search:read · cases:write
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Staging Key", status: "ACTIVE", color: "text-accent border-accent" },
                  { name: "Webhook Key", status: "ACTIVE", color: "text-accent border-accent" },
                ].map((k) => (
                  <div key={k.name} className="p-3 rounded-lg bg-secondary/40 border border-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-display tracking-wider">{k.name}</span>
                      <Badge variant="outline" className={`${k.color} text-[10px]`}>{k.status}</Badge>
                    </div>
                    <code className="text-[10px] font-mono text-muted-foreground">vt_••••••••••••</code>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="glass rounded-xl p-5 space-y-4">
            <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2">
              <Lock className="w-4 h-4" /> Privacy & Data
            </h3>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-display tracking-widest uppercase text-muted-foreground">
                  Retention
                </label>
                <span className="text-sm font-display font-bold text-primary">{retentionDays[0]} days</span>
              </div>
              <Slider value={retentionDays} onValueChange={setRetentionDays} min={7} max={365} step={1} />
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              {[
                { v: encryption, set: setEncryption, l: "AES-256 at rest", icon: FileLock2 },
                { v: anonymize, set: setAnonymize, l: "Anonymise embeddings", icon: Shield },
              ].map((row) => (
                <div key={row.l} className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-2 text-muted-foreground">
                    <row.icon className="w-3 h-3" /> {row.l}
                  </span>
                  <Switch checked={row.v} onCheckedChange={row.set} />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-[10px] font-display tracking-widest uppercase">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span className="text-muted-foreground">GDPR-style</span>
                <span className="text-accent">compliant</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-display tracking-widest uppercase mt-1">
                <CheckCircle2 className="w-3 h-3 text-accent" />
                <span className="text-muted-foreground">TLS 1.3</span>
                <span className="text-accent">enforced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="glass rounded-xl p-5">
          <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase text-primary flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4" /> System Logs
          </h3>
          <div className="font-mono text-[11px] space-y-1 max-h-72 overflow-y-auto">
            {logs.map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 border-l-2 border-border hover:border-primary/60 pl-3 py-1"
              >
                <span className="text-muted-foreground/60">{new Date().toLocaleTimeString("en-GB")}</span>
                <span className={`uppercase tracking-wider ${lvlColor(l.lvl)} w-12`}>[{l.lvl}]</span>
                <span className="flex-1 text-foreground/80">{l.msg}</span>
                <span className="text-muted-foreground/70">{l.who}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;

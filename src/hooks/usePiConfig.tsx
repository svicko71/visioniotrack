import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

interface PiSpecs { resolution?: string; fps?: number; model?: string; }
interface PiStatus { ws: "idle" | "ok" | "fail" | "testing"; mjpeg: "idle" | "ok" | "fail" | "testing"; }

interface PiConfigCtx {
  piIp: string;
  setPiIp: (ip: string) => void;
  status: PiStatus;
  specs: PiSpecs | null;
  connected: boolean;
  testConnection: () => Promise<{ ws: boolean; mjpeg: boolean }>;
  wsUrl: string;
  mjpegUrl: string;
}

const Ctx = createContext<PiConfigCtx | null>(null);
const LS_KEY = "vt_pi_ip";

export function PiConfigProvider({ children }: { children: ReactNode }) {
  const [piIp, setPiIpState] = useState<string>(() => localStorage.getItem(LS_KEY) || "192.168.1.100");
  const [status, setStatus] = useState<PiStatus>({ ws: "idle", mjpeg: "idle" });
  const [specs, setSpecs] = useState<PiSpecs | null>(null);

  const setPiIp = useCallback((ip: string) => {
    setPiIpState(ip);
    localStorage.setItem(LS_KEY, ip);
    setStatus({ ws: "idle", mjpeg: "idle" });
    setSpecs(null);
  }, []);

  const wsUrl = `ws://${piIp}:8765`;
  const mjpegUrl = `http://${piIp}:8766`;

  const testConnection = useCallback(async () => {
    setStatus({ ws: "testing", mjpeg: "testing" });

    const wsTest = new Promise<boolean>((resolve) => {
      try {
        const ws = new WebSocket(wsUrl);
        const timer = setTimeout(() => { ws.close(); resolve(false); }, 4000);
        ws.onopen = () => {
          clearTimeout(timer);
        };
        ws.onmessage = (ev) => {
          try {
            const m = JSON.parse(ev.data);
            setSpecs({
              resolution: m.resolution || `${m.width || 1280}x${m.height || 720}`,
              fps: m.fps,
              model: m.model || "YOLOv8",
            });
          } catch {}
          ws.close();
          resolve(true);
        };
        ws.onerror = () => { clearTimeout(timer); resolve(false); };
      } catch { resolve(false); }
    });

    const mjpegTest = new Promise<boolean>((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => { img.src = ""; resolve(false); }, 4000);
      img.onload = () => { clearTimeout(timer); resolve(true); };
      img.onerror = () => { clearTimeout(timer); resolve(false); };
      img.src = `${mjpegUrl}?t=${Date.now()}`;
    });

    const [wsOk, mjOk] = await Promise.all([wsTest, mjpegTest]);
    setStatus({ ws: wsOk ? "ok" : "fail", mjpeg: mjOk ? "ok" : "fail" });
    return { ws: wsOk, mjpeg: mjOk };
  }, [wsUrl, mjpegUrl]);

  // Silent test on load
  useEffect(() => { testConnection(); /* eslint-disable-next-line */ }, []);

  const connected = status.ws === "ok";

  return (
    <Ctx.Provider value={{ piIp, setPiIp, status, specs, connected, testConnection, wsUrl, mjpegUrl }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePiConfig() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePiConfig must be inside PiConfigProvider");
  return c;
}

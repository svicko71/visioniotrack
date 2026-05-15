import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Upload, ShieldAlert, RefreshCw, Cpu } from "lucide-react";
import { usePiConfig } from "@/hooks/usePiConfig";

type Status = "idle" | "connecting" | "success" | "failed" | "reconnecting";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSessionStart?: (info: { sessionName: string; source: string; specs?: any }) => void;
}

const RES_MAP: Record<string, { width: number; height: number }> = {
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
};

export default function CameraConnectionDialog({ open, onOpenChange, onSessionStart }: Props) {
  const [tab, setTab] = useState("usb");
  const [sessionName, setSessionName] = useState("");

  // USB
  const [deviceIndex, setDeviceIndex] = useState("0");
  const [resolution, setResolution] = useState("720p");
  const [fps, setFps] = useState("30");
  const [usbStatus, setUsbStatus] = useState<Status>("idle");
  const [usbError, setUsbError] = useState<string | null>(null);
  const [usbSpecs, setUsbSpecs] = useState<{ width: number; height: number; fps: number; label: string } | null>(null);
  const [framesReceived, setFramesReceived] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const retryRef = useRef(0);

  // RTSP
  const [rtspUrl, setRtspUrl] = useState("");
  const [rtspUser, setRtspUser] = useState("");
  const [rtspPass, setRtspPass] = useState("");
  const [rtspStatus, setRtspStatus] = useState<Status>("idle");

  // File
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState("1");
  const [loop, setLoop] = useState(false);
  const fileVideoRef = useRef<HTMLVideoElement>(null);

  // Pi
  const piCfg = usePiConfig();
  const [piIpDraft, setPiIpDraft] = useState(piCfg.piIp);
  const [piStatus, setPiStatus] = useState<Status>("idle");
  const [piSpecs, setPiSpecs] = useState<{ resolution?: string; fps?: number; model?: string } | null>(null);

  useEffect(() => { setPiIpDraft(piCfg.piIp); }, [piCfg.piIp]);

  const testPi = async () => {
    setPiStatus("connecting");
    if (piIpDraft !== piCfg.piIp) piCfg.setPiIp(piIpDraft);
    const r = await piCfg.testConnection();
    if (r.ws && r.mjpeg) {
      setPiStatus("success");
      setPiSpecs(piCfg.specs);
    } else {
      setPiStatus("failed");
    }
  };
  useEffect(() => { if (piCfg.specs) setPiSpecs(piCfg.specs); }, [piCfg.specs]);

  const stopUsb = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setFramesReceived(0);
  };

  useEffect(() => () => stopUsb(), []);
  useEffect(() => {
    if (!open) {
      stopUsb();
      setUsbStatus("idle");
      setRtspStatus("idle");
      setUsbSpecs(null);
      setUsbError(null);
    }
  }, [open]);

  const startUsb = async (isRetry = false) => {
    setUsbError(null);
    setUsbStatus(isRetry ? "reconnecting" : "connecting");
    setFramesReceived(0);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: RES_MAP[resolution].width },
          height: { ideal: RES_MAP[resolution].height },
          frameRate: { ideal: parseInt(fps) },
        },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Count 3 consecutive frames via rVFC or fallback
      let count = 0;
      const onFrame = () => {
        count++;
        setFramesReceived(count);
        if (count >= 3) {
          const targetW = RES_MAP[resolution].width;
          const actualW = settings.width || 0;
          const tolerance = Math.abs(actualW - targetW) <= targetW * 0.25;
          setUsbSpecs({
            width: settings.width || 0,
            height: settings.height || 0,
            fps: Math.round(settings.frameRate || 0),
            label: track.label || `Device ${deviceIndex}`,
          });
          if (!tolerance) {
            setUsbError(`Resolution mismatch: requested ${resolution}, got ${actualW}x${settings.height}`);
          }
          setUsbStatus("success");
          retryRef.current = 0;
          return;
        }
        if ((videoRef.current as any)?.requestVideoFrameCallback) {
          (videoRef.current as any).requestVideoFrameCallback(onFrame);
        } else {
          requestAnimationFrame(onFrame);
        }
      };
      if ((videoRef.current as any)?.requestVideoFrameCallback) {
        (videoRef.current as any).requestVideoFrameCallback(onFrame);
      } else {
        requestAnimationFrame(onFrame);
      }

      // Detect stream drops
      track.addEventListener("ended", () => {
        if (retryRef.current < 3) {
          retryRef.current++;
          setUsbStatus("reconnecting");
          setTimeout(() => startUsb(true), 5000);
        } else {
          setUsbStatus("failed");
          setUsbError("Stream lost. Max retries exceeded.");
        }
      });
    } catch (err: any) {
      setUsbStatus("failed");
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setUsbError("Camera access denied. Enable camera permissions in your browser settings (lock icon in the address bar) and retry.");
      } else if (err.name === "NotFoundError") {
        setUsbError("No camera detected on this device.");
      } else {
        setUsbError(err.message || "Failed to access camera.");
      }
    }
  };

  const testRtsp = async () => {
    setRtspStatus("connecting");
    try {
      // Browsers cannot stream RTSP directly; attempt a probe fetch (will likely fail without gateway)
      const probeUrl = rtspUrl.replace(/^rtsp:\/\//, "http://").split("/")[0];
      await fetch(`http://${probeUrl}`, { mode: "no-cors", signal: AbortSignal.timeout(3000) });
      setRtspStatus("success");
    } catch {
      setRtspStatus("failed");
    }
  };

  const fileReady = !!file;
  const usbReady = usbStatus === "success" && framesReceived >= 3 && !!usbSpecs;
  const rtspReady = rtspStatus === "success";
  const canStart =
    sessionName.trim().length > 0 &&
    ((tab === "usb" && usbReady) || (tab === "rtsp" && rtspReady) || (tab === "file" && fileReady));

  const StatusBadge = ({ s }: { s: Status }) => {
    const map: Record<Status, { label: string; cls: string; icon: any }> = {
      idle: { label: "Idle", cls: "bg-muted text-muted-foreground", icon: null },
      connecting: { label: "Connecting", cls: "bg-amber-100 text-amber-700", icon: Loader2 },
      reconnecting: { label: "Reconnecting", cls: "bg-amber-100 text-amber-700", icon: RefreshCw },
      success: { label: "Connected", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
      failed: { label: "Failed", cls: "bg-rose-100 text-rose-700", icon: XCircle },
    };
    const Icon = map[s].icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${map[s].cls}`}>
        {Icon && <Icon className={`h-3 w-3 ${s === "connecting" || s === "reconnecting" ? "animate-spin" : ""}`} />}
        {map[s].label}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white text-slate-900 border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Connect Camera Source</DialogTitle>
          <DialogDescription className="text-slate-600">
            Configure and verify your video input before starting a monitoring session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-700">Session Name</Label>
            <Input
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Field Trial — Cairo Site A"
              className="mt-1.5 bg-white border-slate-200 text-slate-900"
            />
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-3 bg-slate-100">
              <TabsTrigger value="usb">USB / Local</TabsTrigger>
              <TabsTrigger value="rtsp">IP Camera (RTSP)</TabsTrigger>
              <TabsTrigger value="file">File / Recorded</TabsTrigger>
            </TabsList>

            <TabsContent value="usb" className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-slate-700 text-xs">Device Index</Label>
                  <Select value={deviceIndex} onValueChange={setDeviceIndex}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>{["0","1","2","3"].map(i => <SelectItem key={i} value={i}>Device {i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-700 text-xs">Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="720p">720p</SelectItem><SelectItem value="1080p">1080p</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-700 text-xs">FPS</Label>
                  <Select value={fps} onValueChange={setFps}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>{["15","24","30"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50 aspect-video overflow-hidden flex items-center justify-center relative">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                {usbStatus === "idle" && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                    Preview will appear after testing
                  </div>
                )}
                {(usbStatus === "connecting" || usbStatus === "reconnecting") && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white text-sm gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {usbStatus === "reconnecting" ? `Reconnecting (attempt ${retryRef.current}/3)…` : "Requesting camera access…"}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge s={usbStatus} />
                  {usbStatus === "success" && <span className="text-xs text-slate-500">Frames: {framesReceived}</span>}
                </div>
                <Button onClick={() => startUsb(false)} variant="outline" size="sm" className="border-slate-300">
                  Test Connection
                </Button>
              </div>

              {usbSpecs && (
                <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1">
                  <div><span className="text-slate-500">Device:</span> {usbSpecs.label}</div>
                  <div><span className="text-slate-500">Resolution:</span> {usbSpecs.width} × {usbSpecs.height}</div>
                  <div><span className="text-slate-500">FPS:</span> {usbSpecs.fps}</div>
                </div>
              )}
              {usbError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-xs p-2.5 flex gap-2">
                  <XCircle className="h-4 w-4 shrink-0" /> <span>{usbError}</span>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rtsp" className="space-y-3 pt-2">
              <div>
                <Label className="text-slate-700 text-xs">RTSP URL</Label>
                <Input value={rtspUrl} onChange={(e) => setRtspUrl(e.target.value)} placeholder="rtsp://192.168.1.x:554/stream" className="mt-1.5 bg-white border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-700 text-xs">Username (optional)</Label>
                  <Input value={rtspUser} onChange={(e) => setRtspUser(e.target.value)} className="mt-1.5 bg-white border-slate-200" />
                </div>
                <div>
                  <Label className="text-slate-700 text-xs">Password (optional)</Label>
                  <Input type="password" value={rtspPass} onChange={(e) => setRtspPass(e.target.value)} className="mt-1.5 bg-white border-slate-200" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StatusBadge s={rtspStatus} />
                <Button onClick={testRtsp} variant="outline" size="sm" className="border-slate-300" disabled={!rtspUrl}>Test Stream</Button>
              </div>
              <p className="text-[11px] text-slate-500">RTSP streams require a backend gateway for browser playback. The probe verifies host reachability.</p>
            </TabsContent>

            <TabsContent value="file" className="space-y-3 pt-2">
              <label className="block">
                <input type="file" accept="video/mp4,video/avi,video/x-msvideo" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                <div className="border-2 border-dashed border-slate-300 rounded-md p-8 text-center text-slate-500 hover:bg-slate-50 cursor-pointer">
                  <Upload className="h-6 w-6 mx-auto mb-2" />
                  {file ? <div className="text-slate-900 text-sm font-medium">{file.name}</div> : <div className="text-sm">Drop MP4 / AVI here or click to browse</div>}
                </div>
              </label>
              {file && (
                <video ref={fileVideoRef} src={URL.createObjectURL(file)} controls className="w-full aspect-video rounded-md bg-black" />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-slate-700 text-xs">Playback Speed</Label>
                  <Select value={speed} onValueChange={setSpeed}>
                    <SelectTrigger className="mt-1.5 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>{["0.5","1","2","4"].map(s => <SelectItem key={s} value={s}>{s}x</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-2"><Switch checked={loop} onCheckedChange={setLoop} /><Label className="text-slate-700 text-xs">Loop</Label></div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-2.5">
            <ShieldAlert className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
            <span>Urban Shield only — facial recognition pipeline is disabled during field trial mode.</span>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-300">Cancel</Button>
            <Button
              disabled={!canStart}
              onClick={() => {
                onSessionStart?.({ sessionName, source: tab, specs: usbSpecs });
                onOpenChange(false);
              }}
            >
              Start Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

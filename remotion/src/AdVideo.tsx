import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const orbitron = loadOrbitron("normal", { weights: ["700", "900"] }).fontFamily;
const inter = loadInter("normal", { weights: ["400", "600"] }).fontFamily;

const CYAN = "#22f5e3";
const RED = "#ff3b5c";
const BG = "#05070d";

export const AD_TOTAL = 360; // 12s @ 30fps

// === Scene 1: Logo punch-in (0-60) ===
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 12, stiffness: 180 } });
  const scale = interpolate(s, [0, 1], [3, 1]);
  const blur = interpolate(s, [0, 1], [40, 0]);
  const pulse = 1 + Math.sin(frame / 4) * 0.02;
  const ring = interpolate(frame, [10, 55], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center" }}>
      {/* scan grid */}
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.15 }}>
        <defs>
          <pattern id="g" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M60 0 L0 0 0 60" stroke={CYAN} strokeWidth="0.5" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)" />
      </svg>
      {/* expanding ring */}
      <div
        style={{
          position: "absolute",
          width: 600 * ring,
          height: 600 * ring,
          borderRadius: "50%",
          border: `2px solid ${CYAN}`,
          opacity: 1 - ring,
        }}
      />
      <div
        style={{
          fontFamily: orbitron,
          fontWeight: 900,
          fontSize: 180,
          color: CYAN,
          letterSpacing: 8,
          transform: `scale(${scale * pulse})`,
          filter: `blur(${blur}px)`,
          textShadow: `0 0 50px ${CYAN}`,
        }}
      >
        VISIONTRACK
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 28,
          color: "#fff",
          letterSpacing: 12,
          opacity: interpolate(frame, [30, 55], [0, 0.8], { extrapolateRight: "clamp" }),
        }}
      >
        AI · SAFETY · EGYPT
      </div>
    </AbsoluteFill>
  );
};

// === Scene 2: Problem stat (60-130) ===
const SceneStat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.round(interpolate(spring({ frame, fps, config: { damping: 30 } }), [0, 1], [0, 89000]));
  const slide = interpolate(frame, [0, 20], [80, 0], { extrapolateRight: "clamp" });
  const op = interpolate(frame, [0, 20, 60, 70], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", padding: 120, opacity: op }}>
      <div style={{ fontFamily: inter, fontSize: 32, color: RED, letterSpacing: 6, transform: `translateY(${slide}px)` }}>
        ● ALERT
      </div>
      <div
        style={{
          fontFamily: orbitron,
          fontWeight: 900,
          fontSize: 280,
          color: "#fff",
          lineHeight: 1,
          marginTop: 20,
          transform: `translateY(${slide}px)`,
        }}
      >
        {count.toLocaleString()}+
      </div>
      <div style={{ fontFamily: inter, fontSize: 44, color: "#9ad", marginTop: 24, maxWidth: 1100 }}>
        missing-person cases reported in Egypt every year.
      </div>
    </AbsoluteFill>
  );
};

// === Scene 3: AI scanning a face (130-210) ===
const SceneScan: React.FC = () => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [0, 15, 65, 80], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scanY = interpolate(frame, [0, 70], [0, 100]);
  const detected = frame > 50;
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center", opacity: op }}>
      <div style={{ position: "relative", width: 540, height: 720, overflow: "hidden", borderRadius: 12 }}>
        <Img src={staticFile("shots/04-cases.png")} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(0.5) contrast(1.1)" }} />
        {/* scan line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${scanY}%`,
            height: 3,
            background: CYAN,
            boxShadow: `0 0 30px ${CYAN}, 0 0 60px ${CYAN}`,
          }}
        />
        {/* bracket corners */}
        {[
          { t: 20, l: 20, r: false, b: false },
          { t: 20, r: 20, l: false, b: false },
          { b: 20, l: 20, r: false, t: false },
          { b: 20, r: 20, l: false, t: false },
        ].map((c, i) => (
          <div key={i} style={{ position: "absolute", ...c as any, width: 40, height: 40, border: `3px solid ${detected ? "#3eff8b" : CYAN}` , borderRight: c.r ? `3px solid ${detected ? "#3eff8b" : CYAN}` : "none", borderLeft: c.l ? `3px solid ${detected ? "#3eff8b" : CYAN}` : "none", borderTop: c.t ? `3px solid ${detected ? "#3eff8b" : CYAN}` : "none", borderBottom: c.b ? `3px solid ${detected ? "#3eff8b" : CYAN}` : "none" }} />
        ))}
        {detected && (
          <div style={{ position: "absolute", bottom: 30, left: 30, fontFamily: orbitron, color: "#3eff8b", fontSize: 22, letterSpacing: 2, textShadow: "0 0 12px #3eff8b" }}>
            MATCH · 96.4%
          </div>
        )}
      </div>
      <div style={{ marginTop: 40, fontFamily: orbitron, fontSize: 56, color: "#fff", fontWeight: 700, letterSpacing: 4 }}>
        AI FACE MATCH
      </div>
    </AbsoluteFill>
  );
};

// === Scene 4: Product montage flash (210-300) ===
const SceneMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const shots = ["shots/02-dashboard.png", "shots/05-shield.png", "shots/07-faceeval.png", "shots/08-marketplace.png"];
  const op = interpolate(frame, [0, 10, 80, 90], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: BG, opacity: op, padding: 60, gap: 20, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      {shots.map((s, i) => {
        const delay = i * 8;
        const sp = spring({ frame: frame - delay, fps: 30, config: { damping: 15, stiffness: 150 } });
        const y = interpolate(sp, [0, 1], [200, 0]);
        const o = interpolate(sp, [0, 1], [0, 1]);
        const drift = Math.sin((frame - delay) / 20) * 8;
        return (
          <div key={i} style={{ flex: 1, height: 760, borderRadius: 12, overflow: "hidden", transform: `translateY(${y + drift}px)`, opacity: o, border: `1px solid ${CYAN}40`, boxShadow: `0 20px 60px ${CYAN}20` }}>
            <Img src={staticFile(s)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", top: 50, left: 60, fontFamily: orbitron, color: CYAN, fontSize: 26, letterSpacing: 6 }}>
        ONE PLATFORM · EVERY MISSION
      </div>
    </AbsoluteFill>
  );
};

// === Scene 5: Final logo + tagline (300-360) ===
const SceneEnd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  const lineW = interpolate(s, [0, 1], [0, 400]);
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: "center", alignItems: "center" }}>
      <div style={{ fontFamily: orbitron, fontWeight: 900, fontSize: 140, color: "#fff", letterSpacing: 6 }}>
        VISION<span style={{ color: CYAN }}>TRACK</span>
      </div>
      <div style={{ width: lineW, height: 2, background: CYAN, marginTop: 30, boxShadow: `0 0 20px ${CYAN}` }} />
      <div style={{ marginTop: 30, fontFamily: inter, fontSize: 28, color: "#9ad", letterSpacing: 8, opacity: interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" }) }}>
        EYES THAT NEVER BLINK
      </div>
      <div style={{ marginTop: 60, fontFamily: inter, fontSize: 16, color: "#557", letterSpacing: 4, opacity: interpolate(frame, [35, 55], [0, 0.8], { extrapolateRight: "clamp" }) }}>
        visiontrack.ai · ITC EGYPT 2026
      </div>
    </AbsoluteFill>
  );
};

export const AdVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG }}>
      <Sequence from={0} durationInFrames={60}><SceneHook /></Sequence>
      <Sequence from={60} durationInFrames={70}><SceneStat /></Sequence>
      <Sequence from={130} durationInFrames={80}><SceneScan /></Sequence>
      <Sequence from={210} durationInFrames={90}><SceneMontage /></Sequence>
      <Sequence from={300} durationInFrames={60}><SceneEnd /></Sequence>
    </AbsoluteFill>
  );
};

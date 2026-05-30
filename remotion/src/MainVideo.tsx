import React from "react";
import {
  AbsoluteFill,
  Img,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Orbitron";

const { fontFamily } = loadFont("normal", { weights: ["500", "700"] });

type Shot = { file: string; w: number; h: number; label: string };

const SHOTS: Shot[] = [
  { file: "shots/01-home.png", w: 1905, h: 6187, label: "Home" },
  { file: "shots/02-dashboard.png", w: 1905, h: 1562, label: "Dashboard" },
  { file: "shots/03-command.png", w: 1905, h: 1411, label: "Mission Control" },
  { file: "shots/04-cases.png", w: 1905, h: 1406, label: "Missing Cases" },
  { file: "shots/05-shield.png", w: 1905, h: 2284, label: "Urban Shield" },
  { file: "shots/06-classify.png", w: 1905, h: 1406, label: "AI Classifier" },
  { file: "shots/07-faceeval.png", w: 1905, h: 1406, label: "Face Recognition Eval" },
  { file: "shots/08-marketplace.png", w: 1905, h: 1406, label: "Donation Marketplace" },
  { file: "shots/09-gallery.png", w: 1905, h: 1370, label: "Gallery" },
];

const SCENE_DURATION = 120; // 4s per page at 30fps
const FADE = 18;
export const TOTAL_FRAMES = SCENE_DURATION * SHOTS.length;

const SceneShot: React.FC<{ shot: Shot; index: number }> = ({ shot, index }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Scale image to fill width 1920
  const scale = width / shot.w;
  const scaledH = shot.h * scale;

  // Pan from top down. Limit pan distance so tall pages don't fly past — cap at 1.5x viewport.
  const fullOffset = Math.min(0, height - scaledH);
  const maxOffset = Math.max(fullOffset, -height * 1.5);
  const progress = interpolate(frame, [0, SCENE_DURATION - 1], [0, 1], {
    extrapolateRight: "clamp",
  });
  const offsetY = interpolate(progress, [0, 1], [0, maxOffset]);

  // Subtle zoom for short pages
  const zoom = scaledH >= height ? 1 : interpolate(progress, [0, 1], [1.02, 1.08]);

  // Fade in/out
  const opacity = interpolate(
    frame,
    [0, FADE, SCENE_DURATION - FADE, SCENE_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Label slide
  const labelY = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: "clamp" });
  const labelOpacity = interpolate(
    frame,
    [0, 20, SCENE_DURATION - 20, SCENE_DURATION],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill style={{ background: "#05070d", opacity }}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width,
          height: scaledH,
          transform: `translateY(${offsetY}px) scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <Img
          src={staticFile(shot.file)}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      {/* Vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.65) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Top gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 220,
          background:
            "linear-gradient(to bottom, rgba(5,7,13,0.92), rgba(5,7,13,0))",
        }}
      />

      {/* Label */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 80,
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
          fontFamily,
          color: "#22f5e3",
          textShadow: "0 0 24px rgba(34,245,227,0.6)",
        }}
      >
        <div style={{ fontSize: 18, letterSpacing: 6, color: "#7ee6dc", opacity: 0.8 }}>
          VISIONTRACK AI · 0{index + 1}/0{SHOTS.length}
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginTop: 10, letterSpacing: 2 }}>
          {shot.label.toUpperCase()}
        </div>
      </div>

      {/* HUD frame */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <g stroke="#22f5e3" strokeWidth="2" fill="none" opacity="0.55">
          <path d="M 40 40 L 40 110 M 40 40 L 110 40" />
          <path d={`M ${width - 40} 40 L ${width - 40} 110 M ${width - 40} 40 L ${width - 110} 40`} />
          <path d={`M 40 ${height - 40} L 40 ${height - 110} M 40 ${height - 40} L 110 ${height - 40}`} />
          <path d={`M ${width - 40} ${height - 40} L ${width - 40} ${height - 110} M ${width - 40} ${height - 40} L ${width - 110} ${height - 40}`} />
        </g>
      </svg>

      {/* Bottom status bar */}
      <div
        style={{
          position: "absolute",
          bottom: 50,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "monospace",
          color: "#7ee6dc",
          fontSize: 18,
          letterSpacing: 2,
          opacity: labelOpacity * 0.85,
        }}
      >
        <span>● LIVE WALKTHROUGH</span>
        <span>ITC-EGYPT 2026 · 6TH INTL INNOVATION COMPETITION</span>
        <span>REC ◉</span>
      </div>
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#05070d" }}>
      {SHOTS.map((shot, i) => (
        <Sequence key={i} from={i * SCENE_DURATION} durationInFrames={SCENE_DURATION}>
          <SceneShot shot={shot} index={i} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

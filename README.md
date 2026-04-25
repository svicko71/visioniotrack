👁️ VisionIOTrack — Real-Time AI Urban Surveillance Dashboard

The GIS dashboard and tracking interface for the Urban Shield & Link (USL) system — IC-SIT 2026 Competition entry. Real-time object detection visualization, missing persons tracking, and dual-pipeline alert management



🎯 Overview
VisionIOTrack is the real-time web dashboard component of the Urban Shield & Link (USL) dual-pipeline edge AI system. It provides live visualization of object detection events, missing persons alerts, GIS mapping, and a donation matching engine — all fed by YOLOv8 + FaceNet inference running concurrently on a Raspberry Pi 4.
This project was built for the IC-SIT 2026 Vision Track Competition as part of the USL platform addressing urban safety and missing persons identification.

🧠 The USL System (Full Architecture)
Raspberry Pi 4 (Edge Hardware)
        ↓
┌────────────────────────────────────────┐
│         Dual-Pipeline AI               │
│  Pipeline 1: YOLOv8 Object Detection  │  → Urban Shield (safety monitoring)
│  Pipeline 2: CNN/FaceNet Recognition  │  → Link (missing persons ID)
│  Concurrent inference: < 2.5s         │
│  No cloud dependency                   │
└────────────────────────────────────────┘
        ↓
VisionIOTrack Dashboard (this repo)
  ├── Real-time dual alerts
  ├── GIS map (React + Leaflet.js)
  ├── Donation Matching Engine
  └── Incident log & analytics

📊 Performance Benchmarks
MetricResultObject Detection Accuracy89.3%Facial Recognition Accuracy92.4%Accuracy on low-quality footage84%FaceNet baseline improvement+2.4 percentage pointsInference time (dual pipeline)< 2.5 secondsHardwareRaspberry Pi 4 (no cloud)Donation Matching success rate78% (25 test scenarios)

✨ Dashboard Features
🗺️ GIS Live Map

Real-time incident plotting on city map (React + Leaflet.js)
Dual alert layers: Urban Shield events + Link missing persons
Incident history with timestamps and location data

🚨 Dual Alert System

Urban Shield alerts — object detection events (suspicious activity, crowd density, hazards)
Link alerts — facial recognition matches for missing persons
Real-time push notifications with priority classification

🤝 Donation Matching Engine

Matches donors with relevant missing persons cases and community needs
78% match success rate across 25 test scenarios
Automated matching algorithm with manual review option

🔒 Privacy-First Design

Face blurring applied at the capture stage before urban pipeline processing
Compliant with Egypt's Data Protection Law No. 151/2020
Minimal data retention policy


🛠️ Tech Stack
LayerTechnologyFrontendReact, TypeScript, Tailwind CSSGIS / MappingLeaflet.jsBackend / DBSupabaseBuild ToolViteTestingPlaywright, VitestEdge AI (separate)Python, YOLOv8, FaceNet, OpenCVEdge HardwareRaspberry Pi 4

🚀 Getting Started
bash# Clone the repo
git clone https://github.com/svicko71/visioniotrack.git
cd visioniotrack

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add Supabase credentials and API endpoints

# Run locally
npm run dev

# Run tests
npm run test
npx playwright test

🏆 Competition Context
Built for IC-SIT 2026 — Vision Track and ITC Egypt 2026 competitions as Team Lead. The USL system addresses two real urban problems:

Urban safety monitoring — real-time detection of hazards and incidents in city environments
Missing persons identification — privacy-compliant facial recognition to assist in locating missing individuals


📄 Published Research
Full architecture, training pipeline, and benchmark documentation:
DOI: doi.org/10.5281/zenodo.19537076

🔮 Roadmap

 Live video stream integration (WebRTC)
 Multi-camera dashboard support
 Advanced analytics with trend detection
 Mobile alert app (React Native)
 Integration with city emergency services APIs


👤 Author
Youssef Salama — Computer Vision & Edge AI Engineer | Team Lead, USL Project


📌 Note: The edge AI inference code (Python/YOLOv8/FaceNet) runs on the Raspberry Pi 4 hardware. This repo contains the web dashboard that receives and visualizes the pipeline output.

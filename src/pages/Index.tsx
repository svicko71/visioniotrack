import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield, Eye, Zap, MapPin, Bell, Search, Radar, Video, Cpu, Users,
  Upload, Brain, ScanFace, BarChart3, ChevronRight, Play, CheckCircle2,
  Building2, Heart, DollarSign, Globe, Lock, Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: Eye, title: "Real-Time Scanning", desc: "AI-powered facial recognition across multiple video sources" },
  { icon: MapPin, title: "Predictive Paths", desc: "Movement prediction using advanced tracking algorithms" },
  { icon: Bell, title: "Instant Alerts", desc: "Real-time notifications when matches are detected" },
  { icon: Video, title: "Multi-Source Input", desc: "CCTV, mobile uploads, and public video analysis" },
  { icon: Shield, title: "Secure & Private", desc: "End-to-end encryption for all sensitive data" },
  { icon: Zap, title: "Lightning Fast", desc: "Results in seconds, not hours" },
];

const stats = [
  { value: "92.4%", label: "Overall Accuracy" },
  { value: "< 3s", label: "Scan Speed" },
  { value: "84%", label: "Low-Quality Accuracy" },
  { value: "4.8%", label: "False Positive Rate" },
];

const pipeline = [
  { icon: Upload, title: "Upload", desc: "Photo + basic details" },
  { icon: ScanFace, title: "Preprocessing", desc: "Face detection & alignment" },
  { icon: Brain, title: "AI Matching", desc: "128-dim CNN embeddings" },
  { icon: BarChart3, title: "Results", desc: "Ranked matches + confidence" },
];

const metrics = [
  { metric: "Overall Accuracy", value: "92.4%", detail: "On standard quality images" },
  { metric: "Precision", value: "89%", detail: "True positive identification" },
  { metric: "Recall", value: "87%", detail: "Successfully found cases" },
  { metric: "Low-Quality Accuracy", value: "84%", detail: "Surveillance & poor lighting" },
  { metric: "False Positive Rate", value: "4.8%", detail: "At confidence > 0.75" },
  { metric: "Processing Time", value: "< 3s", detail: "End-to-end per image" },
];

const team = [
  { name: "Youssef Salama", role: "Lead AI Engineer" },
  { name: "Ahmed Walid", role: "Full-Stack Developer" },
  { name: "Mohamed Nasser", role: "Computer Vision Specialist" },
  { name: "Mohamed Sayyad", role: "Data Scientist" },
  { name: "Ahmed Yasser", role: "Backend Engineer" },
];

const businessModels = [
  { icon: Building2, title: "Government Licensing", desc: "Integrated with police and security agencies for nationwide deployment." },
  { icon: Heart, title: "NGO & Charity Tier", desc: "Free or discounted access for non-profits working on missing persons cases." },
  { icon: Users, title: "Family Plans", desc: "Affordable plans for families to report and track missing loved ones." },
  { icon: Globe, title: "API Service", desc: "SaaS API for third-party developers and security platforms." },
];

const Index = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="absolute inset-0 opacity-10 z-[1]"
          style={{
            backgroundImage: "linear-gradient(hsl(180 100% 50% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(180 100% 50% / 0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <img src={logo} alt="VisionTrack AI" className="w-36 h-36 mx-auto rounded-full object-cover neon-border animate-float" />
          </motion.div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs font-display tracking-[0.5em] uppercase text-accent neon-text-green mb-4"
          >
            ITC-EGYPT 2026 — 6th International Innovation Competition
          </motion.p>
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-display font-black tracking-[0.15em] mb-4"
          >
            <span className="text-foreground">Vision</span>{" "}
            <span className="text-foreground">Track</span>{" "}
            <span className="text-primary neon-text">AI</span>
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground font-light mb-2"
          >
            Finding Missing Persons Faster, Smarter, Safer
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            An intelligent AI platform using advanced computer vision and deep learning to locate missing persons in real-time. Optimized for Egyptian and Arabic faces, low-quality surveillance footage, and rapid deployment.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="font-display tracking-[0.15em] bg-primary text-primary-foreground hover:bg-primary/80 neon-border px-8 h-12">
                <Radar className="w-5 h-5 mr-2" /> Launch Demo
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="font-display tracking-[0.15em] border-primary/50 text-primary hover:bg-primary/10 px-8 h-12"
              onClick={() => window.open("https://youtu.be/nfctHJiqIIA", "_blank", "noopener,noreferrer")}
            >
              <Play className="w-5 h-5 mr-2" /> Watch Demo
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-5 text-center"
              >
                <div className="text-3xl font-display font-black text-primary neon-text">{s.value}</div>
                <div className="text-xs text-muted-foreground font-display tracking-wider uppercase mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-4 tracking-[0.15em] uppercase"
          >
            How It <span className="text-primary neon-text">Works</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto text-sm">
            Our AI pipeline processes images through 4 stages to deliver fast, accurate results.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pipeline.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass rounded-xl p-6 text-center relative"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs font-display tracking-[0.3em] text-muted-foreground mb-1">STEP {i + 1}</div>
                <h3 className="font-display text-sm font-bold tracking-wider mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
                {i < pipeline.length - 1 && (
                  <ChevronRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Video */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-4 tracking-[0.15em] uppercase"
          >
            Live <span className="text-accent neon-text-green">Demo</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-8 text-sm">Watch VisionTrack AI in action</p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass rounded-xl overflow-hidden neon-border"
          >
            <div className="aspect-video">
              <iframe
                src="https://www.youtube.com/embed/nfctHJiqIIA"
                title="VisionTrack AI Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </motion.div>
          <div className="flex justify-center mt-6">
            <Link to="/dashboard">
              <Button className="font-display tracking-[0.15em] bg-accent text-accent-foreground hover:bg-accent/80 px-6">
                <Radar className="w-4 h-4 mr-2" /> Try the Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-12 tracking-[0.15em] uppercase"
          >
            Powerful <span className="text-primary neon-text">Features</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:neon-border transition-all duration-500 group"
              >
                <f.icon className="w-10 h-10 text-primary mb-4 group-hover:neon-text transition-all" />
                <h3 className="font-display text-sm font-bold tracking-wider mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance & Results */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-4 tracking-[0.15em] uppercase"
          >
            Performance <span className="text-primary neon-text">Metrics</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-10 text-sm max-w-xl mx-auto">
            Tested on 10,000+ images including low-quality CCTV footage and challenging conditions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={m.metric}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass rounded-xl p-5"
              >
                <div className="text-2xl font-display font-black text-primary neon-text">{m.value}</div>
                <div className="text-sm font-display font-semibold tracking-wider mt-1">{m.metric}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.detail}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Novelty & Differentiation */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-4 tracking-[0.15em] uppercase"
          >
            Why <span className="text-accent neon-text-green">Vision Track</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-10 text-sm max-w-xl mx-auto">
            Purpose-built for the Egyptian and Arab region with unique optimizations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: ScanFace, title: "Arabic Face Optimization", desc: "Our CNN model is specifically trained on diverse Egyptian and Arab facial features, reducing racial bias found in western-trained models." },
              { icon: Camera, title: "Low-Quality Image Handling", desc: "Achieves 84% accuracy on poor-quality surveillance footage, low lighting, and challenging angles — critical for real-world CCTV." },
              { icon: Lock, title: "Privacy-First Architecture", desc: "End-to-end encryption, anonymized 128-dimensional embeddings, explicit consent mechanisms, and full GDPR-style compliance." },
              { icon: Cpu, title: "Modular & Scalable", desc: "Ready for IoT camera integration, police API connections, and nationwide deployment across Egypt's infrastructure." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:neon-border transition-all duration-500"
              >
                <item.icon className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-display text-sm font-bold tracking-[0.15em] uppercase mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-4 tracking-[0.15em] uppercase"
          >
            The <span className="text-primary neon-text">Team</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-10 text-sm">Built by a high school team for ITC-EGYPT 2026</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {team.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-4 text-center hover:neon-border transition-all duration-500"
              >
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="font-display text-sm font-bold text-primary">
                    {t.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <h3 className="font-display text-xs font-bold tracking-wider">{t.name}</h3>
                <p className="text-[10px] text-primary mt-1 font-display tracking-wider">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Model & Impact */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-4 tracking-[0.15em] uppercase"
          >
            Business <span className="text-accent neon-text-green">Model</span>
          </motion.h2>
          <p className="text-center text-muted-foreground mb-10 text-sm max-w-xl mx-auto">
            Sustainable impact through multiple revenue streams and social responsibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {businessModels.map((bm, i) => (
              <motion.div
                key={bm.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 hover:neon-border transition-all duration-500"
              >
                <bm.icon className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-display text-sm font-bold tracking-[0.15em] uppercase mb-2">{bm.title}</h3>
                <p className="text-sm text-muted-foreground">{bm.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl font-display font-bold text-center mb-10 tracking-[0.15em] uppercase"
          >
            Tech <span className="text-primary neon-text">Stack</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="glass rounded-xl p-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Frontend", value: "React + TypeScript" },
                { label: "Backend", value: "Python (Flask)" },
                { label: "AI / ML", value: "TensorFlow + PyTorch" },
                { label: "Vision", value: "OpenCV + CNN" },
                { label: "Database", value: "MySQL + Cloud" },
                { label: "Future", value: "IoT Cameras + Police API" },
              ].map((t) => (
                <div key={t.label} className="text-center p-3">
                  <div className="text-xs font-display tracking-[0.3em] text-muted-foreground uppercase mb-1">{t.label}</div>
                  <div className="text-sm font-display font-bold text-foreground">{t.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-10 neon-border"
          >
            <h2 className="text-3xl font-display font-bold tracking-[0.15em] uppercase mb-4">
              Ready to <span className="text-primary neon-text">Find</span> Them?
            </h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Join VisionTrack AI and help bring missing persons home. Every second counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard">
                <Button size="lg" className="font-display tracking-[0.15em] bg-primary text-primary-foreground hover:bg-primary/80 neon-border px-8 h-12">
                  <Radar className="w-5 h-5 mr-2" /> Launch Dashboard
                </Button>
              </Link>
              <Link to="/cases">
                <Button size="lg" variant="outline" className="font-display tracking-[0.15em] border-primary/50 text-primary hover:bg-primary/10 px-8 h-12">
                  <Search className="w-5 h-5 mr-2" /> View Cases
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;

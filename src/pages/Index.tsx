import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Eye, Zap, MapPin, Bell, Search, Radar, Video, Cpu, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";
import heroEye from "@/assets/hero-eye.jpg";

const features = [
  { icon: Eye, title: "Real-Time Scanning", desc: "AI-powered facial recognition across multiple video sources" },
  { icon: MapPin, title: "Predictive Paths", desc: "Movement prediction using advanced tracking algorithms" },
  { icon: Bell, title: "Instant Alerts", desc: "Real-time notifications when matches are detected" },
  { icon: Video, title: "Multi-Source Input", desc: "CCTV, mobile uploads, and public video analysis" },
  { icon: Shield, title: "Secure & Private", desc: "End-to-end encryption for all sensitive data" },
  { icon: Zap, title: "Lightning Fast", desc: "Results in seconds, not hours" },
];

const stats = [
  { value: "99.2%", label: "Recognition Accuracy" },
  { value: "< 3s", label: "Scan Speed" },
  { value: "24/7", label: "Monitoring" },
  { value: "500+", label: "CCTV Sources" },
];

const Index = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={heroEye} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Grid overlay */}
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

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-display font-black tracking-[0.15em] mb-4"
          >
            <span className="text-foreground">VisionTrack</span>{" "}
            <span className="text-primary neon-text">AI</span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-muted-foreground font-light mb-2"
          >
            AI-Powered Real-Time Missing Persons Search
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg font-display font-semibold tracking-[0.3em] text-accent neon-text-green mb-10"
          >
            FASTER. SMARTER. SAFER.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
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
    </div>
  );
};

export default Index;

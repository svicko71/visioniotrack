import { motion } from "framer-motion";
import { Users, Target, Shield, Cpu, Trophy, Lightbulb } from "lucide-react";

const team = [
  { name: "Youssef Salama", role: "Lead AI Engineer", desc: "Architected the CNN model and training pipeline." },
  { name: "Ahmed Walid", role: "Full-Stack Developer", desc: "Built the web platform and integrated all systems." },
  { name: "Mohamed Nasser", role: "Computer Vision Specialist", desc: "Developed face detection and preprocessing pipeline." },
  { name: "Mohamed Sayyad", role: "Data Scientist", desc: "Designed the dataset strategy and evaluation metrics." },
  { name: "Ahmed Yasser", role: "Backend Engineer", desc: "Built APIs, database architecture, and deployment." },
];

const values = [
  { icon: Target, title: "Mission-Driven", desc: "Every line of code serves the mission of finding missing persons faster." },
  { icon: Shield, title: "Privacy First", desc: "We handle sensitive data with the highest security standards and encryption." },
  { icon: Cpu, title: "Cutting-Edge AI", desc: "CNN-based facial recognition with 128-dim embeddings and triplet loss." },
  { icon: Users, title: "Community Impact", desc: "Working to make Egypt and the Arab world safer for everyone." },
];

const About = () => (
  <div className="py-20 px-4">
    <div className="container mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-accent" />
          <span className="text-xs font-display tracking-[0.4em] uppercase text-accent neon-text-green">
            ITC-EGYPT 2026 — 6th International Innovation Competition
          </span>
        </div>
        <h1 className="text-4xl font-display font-bold tracking-[0.15em] uppercase mb-6">
          About <span className="text-primary neon-text">Vision Track AI</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          VisionTrack AI is an intelligent platform developed by a high school team for the 6th International Innovation Competition (ITC-EGYPT 2026). Our system uses advanced computer vision and deep learning to help locate missing persons quickly and efficiently.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-12">
          Our CNN model, inspired by FaceNet architecture, generates 128-dimensional face embeddings trained with triplet loss. The system processes multiple video sources simultaneously, achieving 92.4% accuracy on standard images and 84% on low-quality surveillance footage — specifically optimized for Egyptian and Arabic facial features.
        </p>
      </motion.div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-6 hover:neon-border transition-all duration-500"
          >
            <v.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-sm font-bold tracking-[0.15em] uppercase mb-2">{v.title}</h3>
            <p className="text-sm text-muted-foreground">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Team */}
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-3xl font-display font-bold tracking-[0.15em] uppercase mb-8"
      >
        Our <span className="text-accent neon-text-green">Team</span>
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-6 text-center hover:neon-border transition-all duration-500 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/30" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/30" />
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-display text-lg font-bold text-primary">
                {t.name.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
            <h3 className="font-display text-sm font-bold tracking-wider">{t.name}</h3>
            <p className="text-xs text-primary mt-1 font-display tracking-wider">{t.role}</p>
            <p className="text-xs text-muted-foreground mt-2">{t.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Competition Info */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 glass rounded-xl p-8 text-center neon-border"
      >
        <Lightbulb className="w-10 h-10 text-accent mx-auto mb-4" />
        <h3 className="font-display text-lg font-bold tracking-[0.15em] uppercase mb-3">
          Innovation for <span className="text-accent neon-text-green">Impact</span>
        </h3>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          VisionTrack AI was created to demonstrate how AI can serve humanitarian goals. Our system is designed to be affordable, scalable, and accessible — making advanced facial recognition technology available where it's needed most.
        </p>
      </motion.div>
    </div>
  </div>
);

export default About;

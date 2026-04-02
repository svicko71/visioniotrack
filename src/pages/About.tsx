import { motion } from "framer-motion";
import { Users, Target, Shield, Cpu } from "lucide-react";

const team = [
  { name: "يوسف سلامه", nameEn: "Youssef Salama", role: "Lead AI Engineer" },
  { name: "أحمد وليد", nameEn: "Ahmed Walid", role: "Full-Stack Developer" },
  { name: "محمد ناصر", nameEn: "Mohamed Nasser", role: "Computer Vision Specialist" },
  { name: "محمد صياد", nameEn: "Mohamed Sayyad", role: "Data Scientist" },
  { name: "أحمد ياسر", nameEn: "Ahmed Yasser", role: "Backend Engineer" },
];

const values = [
  { icon: Target, title: "Mission-Driven", desc: "Every line of code serves the mission of finding missing persons faster." },
  { icon: Shield, title: "Privacy First", desc: "We handle sensitive data with the highest security standards." },
  { icon: Cpu, title: "Cutting-Edge AI", desc: "We use the latest in computer vision and machine learning." },
  { icon: Users, title: "Community Impact", desc: "Working with authorities and communities worldwide." },
];

const About = () => (
  <div className="py-20 px-4">
    <div className="container mx-auto max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-display font-bold tracking-wider mb-6">
          About <span className="text-primary neon-text">Us</span>
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-12">
          We are a dedicated team of AI engineers and developers committed to leveraging technology
          to help authorities find missing persons quickly and efficiently. VisionTrack AI integrates
          cutting-edge AI with real-time video analysis to make public safety smarter. Our system
          processes multiple video sources simultaneously, using advanced facial recognition and
          movement prediction algorithms to locate missing individuals in record time.
        </p>
      </motion.div>

      {/* Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-6"
          >
            <v.icon className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-display text-sm font-bold tracking-wider mb-2">{v.title}</h3>
            <p className="text-sm text-muted-foreground">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Team */}
      <motion.h2
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-3xl font-display font-bold tracking-wider mb-8"
      >
        Our <span className="text-accent neon-text-green">Team</span>
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((t, i) => (
          <motion.div
            key={t.nameEn}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-xl p-6 text-center hover:neon-border transition-all duration-500"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-display text-lg font-bold text-primary">
                {t.nameEn.split(" ").map(n => n[0]).join("")}
              </span>
            </div>
            <h3 className="font-display text-sm font-bold tracking-wider">{t.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{t.nameEn}</p>
            <p className="text-xs text-primary mt-2">{t.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default About;

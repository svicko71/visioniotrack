import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We'll get back to you soon.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold tracking-wider mb-6"
        >
          Contact <span className="text-primary neon-text">Us</span>
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-muted-foreground mb-8">
              Have a question or want to report a missing person? Reach out to our team and we'll respond as quickly as possible.
            </p>
            <div className="space-y-4">
              {[
                { icon: Mail, label: "contact@visiontrack.ai" },
                { icon: Phone, label: "+20 100 000 0000" },
                { icon: MapPin, label: "Cairo, Egypt" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <item.icon className="w-5 h-5 text-primary" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-6 space-y-4"
          >
            <Input
              placeholder="Your Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-secondary border-border"
              required
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="bg-secondary border-border"
              required
            />
            <Textarea
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-secondary border-border min-h-[120px]"
              required
            />
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-display tracking-wider">
              <Send className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

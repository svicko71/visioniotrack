import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, MapPin, Send, Shield } from "lucide-react";
import { toast } from "sonner";

const governorates = [
  { name: "القاهرة", phone: "02-27921000" },
  { name: "الجيزة", phone: "02-35720000" },
  { name: "الإسكندرية", phone: "03-4879000" },
  { name: "الدقهلية", phone: "050-2220000" },
  { name: "الشرقية", phone: "055-2300000" },
  { name: "القليوبية", phone: "013-2800000" },
  { name: "المنوفية", phone: "048-2200000" },
  { name: "الغربية", phone: "040-3300000" },
  { name: "كفر الشيخ", phone: "047-3200000" },
  { name: "البحيرة", phone: "045-3300000" },
  { name: "الفيوم", phone: "084-6300000" },
  { name: "بني سويف", phone: "082-2300000" },
  { name: "المنيا", phone: "086-2300000" },
  { name: "أسيوط", phone: "088-2300000" },
  { name: "سوهاج", phone: "093-2300000" },
  { name: "قنا", phone: "096-5300000" },
  { name: "الأقصر", phone: "095-2300000" },
  { name: "أسوان", phone: "097-2300000" },
  { name: "البحر الأحمر", phone: "065-3500000" },
  { name: "الوادي الجديد", phone: "092-7900000" },
  { name: "مطروح", phone: "046-4900000" },
  { name: "شمال سيناء", phone: "068-3300000" },
  { name: "جنوب سيناء", phone: "069-3600000" },
  { name: "بورسعيد", phone: "066-3200000" },
  { name: "الإسماعيلية", phone: "064-3300000" },
  { name: "السويس", phone: "062-3300000" },
  { name: "دمياط", phone: "057-2300000" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [searchGov, setSearchGov] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("تم إرسال الرسالة بنجاح! سيتم التواصل معك قريباً.");
    setForm({ name: "", phone: "", message: "" });
  };

  const filteredGov = governorates.filter(g => g.name.includes(searchGov));

  return (
    <div className="py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-display font-bold tracking-wider mb-6"
        >
          تواصل مع <span className="text-primary neon-text">أقرب مركز شرطة</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Police stations by governorate */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <p className="text-muted-foreground mb-4">
              تواصل مع أقرب مركز شرطة في محافظتك للإبلاغ عن حالة مفقود أو الاستفسار.
            </p>

            <Input
              placeholder="ابحث عن محافظتك..."
              value={searchGov}
              onChange={(e) => setSearchGov(e.target.value)}
              className="bg-secondary border-border mb-4"
              dir="rtl"
            />

            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredGov.map((g) => (
                <div key={g.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-medium" dir="rtl">{g.name}</span>
                  </div>
                  <a href={`tel:${g.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <Phone className="w-3 h-3" />
                    <span dir="ltr">{g.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-6 space-y-4"
          >
            <h3 className="font-display text-sm font-bold tracking-wider uppercase text-primary mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              إرسال بلاغ سريع
            </h3>
            <Input
              placeholder="اسمك"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-secondary border-border"
              dir="rtl"
              required
            />
            <Input
              placeholder="رقم تليفونك"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="bg-secondary border-border"
              dir="rtl"
              required
            />
            <Textarea
              placeholder="تفاصيل البلاغ..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-secondary border-border min-h-[120px]"
              dir="rtl"
              required
            />
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-display tracking-wider">
              <Send className="w-4 h-4 mr-2" /> إرسال البلاغ
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;

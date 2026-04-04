import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, Plus, Search, MapPin, Clock, User,
  Loader2, Video, CreditCard, Phone
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Cases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCase, setNewCase] = useState({
    name: "", age: "", lastSeen: "", description: "", nationalId: "", phone: "", gender: "unknown"
  });
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = async () => {
    const { data, error } = await supabase
      .from("missing_cases")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) { toast.error("Failed to load cases"); console.error(error); }
    else setCases(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCases(); }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setNewPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error("Video must be under 50MB"); return; }
    setNewVideoFile(file);
    toast.success("Video selected: " + file.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to report a case"); navigate("/auth"); return; }
    if (!newCase.name || !newCase.lastSeen) { toast.error("Please fill in name and location"); return; }

    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      let video_url: string | null = null;

      if (newPhotoFile) {
        const fileExt = newPhotoFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("case-photos").upload(filePath, newPhotoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("case-photos").getPublicUrl(filePath);
        photo_url = urlData.publicUrl;
      }

      if (newVideoFile) {
        const fileExt = newVideoFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("case-videos").upload(filePath, newVideoFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("case-videos").getPublicUrl(filePath);
        video_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("missing_cases").insert({
        user_id: user.id,
        name: newCase.name,
        age: newCase.age || null,
        last_seen: newCase.lastSeen,
        description: newCase.description || null,
        national_id: newCase.nationalId || null,
        phone: newCase.phone || null,
        gender: newCase.gender,
        photo_url,
        video_url,
        status: "active",
      } as any);

      if (error) throw error;

      toast.success("تم تسجيل الحالة بنجاح!");
      setNewCase({ name: "", age: "", lastSeen: "", description: "", nationalId: "", phone: "", gender: "unknown" });
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
      setNewVideoFile(null);
      setShowForm(false);
      fetchCases();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = cases.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.last_seen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.national_id && c.national_id.includes(searchTerm)) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const statusBadge = (s: string) => {
    if (s === "found") return "bg-accent/20 text-accent";
    if (s === "urgent") return "bg-destructive/20 text-destructive animate-pulse-neon";
    return "bg-primary/20 text-primary";
  };

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-[0.15em] uppercase">
              Missing <span className="text-primary neon-text">Cases</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{cases.length} cases registered</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, location, ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <Button
              onClick={() => {
                if (!user) { toast.error("Please sign in first"); navigate("/auth"); return; }
                setShowForm(!showForm);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/80 font-display text-xs tracking-wider"
            >
              <Plus className="w-4 h-4 mr-1" /> Report
            </Button>
          </div>
        </motion.div>

        {/* New Case Form - Expanded */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-6 mb-8 space-y-4"
          >
            <h3 className="font-display text-sm font-bold tracking-[0.15em] uppercase text-primary">تسجيل بيانات المفقود</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder="الاسم الكامل *" value={newCase.name} onChange={(e) => setNewCase({ ...newCase, name: e.target.value })} className="bg-secondary border-border" required dir="rtl" />
              <Input placeholder="السن" type="number" value={newCase.age} onChange={(e) => setNewCase({ ...newCase, age: e.target.value })} className="bg-secondary border-border" dir="rtl" />
              <select
                value={newCase.gender}
                onChange={(e) => setNewCase({ ...newCase, gender: e.target.value })}
                className="flex h-10 w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              >
                <option value="unknown">النوع</option>
                <option value="male">ذكر</option>
                <option value="female">أنثى</option>
              </select>
              <Input placeholder="آخر مكان شوهد فيه *" value={newCase.lastSeen} onChange={(e) => setNewCase({ ...newCase, lastSeen: e.target.value })} className="bg-secondary border-border" required dir="rtl" />
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="رقم تليفون للتواصل" value={newCase.phone} onChange={(e) => setNewCase({ ...newCase, phone: e.target.value })} className="bg-secondary border-border pl-10" />
              </div>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="الرقم القومي" value={newCase.nationalId} onChange={(e) => setNewCase({ ...newCase, nationalId: e.target.value })} className="bg-secondary border-border pl-10" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:border-primary/50 transition-colors">
                <Upload className="w-5 h-5" /> {newPhotoFile ? "✓ تم رفع الصورة" : "رفع صورة المفقود"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-4 py-3 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:border-accent/50 transition-colors">
                <Video className="w-5 h-5" /> {newVideoFile ? "✓ تم اختيار الفيديو" : "رفع فيديو (حد أقصى 50MB)"}
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
              </label>
            </div>

            {newPhotoPreview && (
              <div className="flex items-center gap-4">
                <img src={newPhotoPreview} alt="Preview" className="w-24 h-24 rounded-lg object-cover border border-primary/30" />
                <button type="button" onClick={() => { setNewPhotoFile(null); setNewPhotoPreview(null); }} className="text-xs text-destructive hover:underline">حذف</button>
              </div>
            )}

            <Textarea placeholder="وصف تفصيلي / ملاحظات إضافية (ملابس، علامات مميزة...)" value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} className="bg-secondary border-border min-h-[100px]" dir="rtl" />

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/80 font-display text-xs tracking-wider">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> جاري الإرسال...</> : "تسجيل البلاغ"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border text-muted-foreground font-display text-xs tracking-wider">إلغاء</Button>
            </div>
          </motion.form>
        )}

        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-5 hover:neon-border transition-all duration-500"
              >
                <div className="flex gap-4">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0 border border-primary/20" />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-10 h-10 text-primary/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-sm font-bold tracking-wider truncate">{c.name}</h3>
                      <span className={`text-[10px] font-display tracking-widest uppercase px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                    {c.age && <p className="text-xs text-muted-foreground">السن: {c.age} {c.gender === "male" ? "• ذكر" : c.gender === "female" ? "• أنثى" : ""}</p>}
                    {c.national_id && <p className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3" /> {c.national_id}</p>}
                    {c.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> {c.phone}</p>}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {c.last_seen}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {new Date(c.reported_at).toLocaleString()}
                    </p>
                    {c.video_url && (
                      <a href={c.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                        <Video className="w-3 h-3" /> View Video
                      </a>
                    )}
                    {c.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "لا توجد حالات مطابقة للبحث." : "لا توجد حالات مسجلة بعد. كن أول من يبلغ."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cases;

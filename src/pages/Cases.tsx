import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload, Plus, Search, MapPin, Clock, User,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type MissingCase = Tables<"missing_cases">;

const Cases = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<MissingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCase, setNewCase] = useState({ name: "", age: "", lastSeen: "", description: "" });
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in to report a case"); navigate("/auth"); return; }
    if (!newCase.name || !newCase.lastSeen) { toast.error("Please fill in name and location"); return; }

    setSubmitting(true);
    try {
      let photo_url: string | null = null;

      if (newPhotoFile) {
        const fileExt = newPhotoFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("case-photos")
          .upload(filePath, newPhotoFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("case-photos")
          .getPublicUrl(filePath);
        photo_url = urlData.publicUrl;
      }

      const { error } = await supabase.from("missing_cases").insert({
        user_id: user.id,
        name: newCase.name,
        age: newCase.age || null,
        last_seen: newCase.lastSeen,
        description: newCase.description || null,
        photo_url,
        status: "active",
      });

      if (error) throw error;

      toast.success("تم تسجيل الحالة بنجاح!");
      setNewCase({ name: "", age: "", lastSeen: "", description: "" });
      setNewPhotoFile(null);
      setNewPhotoPreview(null);
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
      c.last_seen.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-3xl font-display font-bold tracking-wider">
              Missing <span className="text-primary neon-text">Cases</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{cases.length} cases registered</p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
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

        {/* New Case Form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleSubmit}
            className="glass rounded-xl p-6 mb-8 space-y-4"
          >
            <h3 className="font-display text-sm font-bold tracking-wider text-primary">Report Missing Person</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Full Name *" value={newCase.name} onChange={(e) => setNewCase({ ...newCase, name: e.target.value })} className="bg-secondary border-border" required />
              <Input placeholder="Age" value={newCase.age} onChange={(e) => setNewCase({ ...newCase, age: e.target.value })} className="bg-secondary border-border" />
              <Input placeholder="Last Known Location *" value={newCase.lastSeen} onChange={(e) => setNewCase({ ...newCase, lastSeen: e.target.value })} className="bg-secondary border-border" required />
              <div>
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg bg-secondary border border-border text-sm text-muted-foreground hover:border-primary/50 transition-colors">
                  <Upload className="w-4 h-4" /> {newPhotoFile ? "Photo uploaded ✓" : "Upload Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            {newPhotoPreview && (
              <div className="flex items-center gap-4">
                <img src={newPhotoPreview} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                <button type="button" onClick={() => { setNewPhotoFile(null); setNewPhotoPreview(null); }} className="text-xs text-destructive hover:underline">Remove</button>
              </div>
            )}

            <Textarea placeholder="Description / Additional Details" value={newCase.description} onChange={(e) => setNewCase({ ...newCase, description: e.target.value })} className="bg-secondary border-border" />

            <div className="flex gap-3">
              <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/80 font-display text-xs tracking-wider">
                {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : "Submit Report"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-border text-muted-foreground font-display text-xs tracking-wider">Cancel</Button>
            </div>
          </motion.form>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          </div>
        )}

        {/* Cases Grid */}
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
                    <img src={c.photo_url} alt={c.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-primary/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-sm font-bold tracking-wider truncate">{c.name}</h3>
                      <span className={`text-[10px] font-display tracking-widest uppercase px-2 py-0.5 rounded-full ${statusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </div>
                    {c.age && <p className="text-xs text-muted-foreground">Age: {c.age}</p>}
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {c.last_seen}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" /> {new Date(c.reported_at).toLocaleString()}
                    </p>
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
              {searchTerm ? "No cases found matching your search." : "No cases yet. Be the first to report one."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cases;

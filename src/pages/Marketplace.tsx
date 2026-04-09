import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Upload, Package, Trees, Hammer, Sofa, Boxes, Plus, Search, MapPin, Tag, Loader2, User
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  { value: "wood", label: "Wood", icon: Package },
  { value: "plants", label: "Plants", icon: Trees },
  { value: "furniture", label: "Furniture", icon: Sofa },
  { value: "building_materials", label: "Building Materials", icon: Hammer },
  { value: "other", label: "Other", icon: Boxes },
];

const conditionLabels: Record<string, string> = {
  new: "New", good: "Good", fair: "Fair", poor: "Poor",
};

const statusColors: Record<string, string> = {
  available: "bg-green-500/20 text-green-400 border-green-500/30",
  assigned: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  used: "bg-muted text-muted-foreground border-border",
};

const Marketplace = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("wood");
  const [condition, setCondition] = useState("good");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    setLoading(true);
    const { data } = await supabase.from("donations").select("*").order("created_at", { ascending: false });
    if (data) setDonations(data);
    setLoading(false);
  };

  const handleFile = useCallback((file: File) => {
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const submitDonation = async () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSubmitting(true);

    try {
      let imageUrl = null;
      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `donations/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("case-photos").upload(path, photo);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("case-photos").getPublicUrl(path);
          imageUrl = urlData.publicUrl;
        }
      }

      const { error } = await supabase.from("donations").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        category,
        condition,
        image_url: imageUrl,
        lat: 30.0 + Math.random() * 1.5,
        lng: 31.0 + Math.random() * 1.5,
      });

      if (error) throw error;
      toast.success("Donation listed successfully!");
      setTitle(""); setDescription(""); setCategory("wood"); setCondition("good");
      setPhoto(null); setPhotoPreview(null); setShowForm(false);
      loadDonations();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = donations.filter((d) => {
    if (filterCat && d.category !== filterCat) return false;
    if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="py-6 px-4 min-h-screen">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black tracking-[0.15em] uppercase">
              <span className="text-primary neon-text">Donation</span> <span className="text-accent">Marketplace</span>
            </h1>
            <p className="text-xs font-display tracking-widest text-muted-foreground uppercase mt-1">Community Resource Sharing • Urban Shield & Link</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-accent text-accent-foreground hover:bg-accent/80 font-display tracking-wider text-sm">
            <Plus className="w-4 h-4 mr-2" /> Donate Item
          </Button>
        </motion.div>

        {/* Donation Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass rounded-xl p-6 mb-6">
            <h3 className="font-display text-sm font-bold tracking-wider mb-4 text-primary">List a Donation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Input placeholder="Item title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-secondary border-primary/20 font-display text-sm" />
                <textarea placeholder="Description..." value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 bg-secondary border border-primary/20 rounded-md px-3 py-2 text-sm resize-none" />
                <div className="flex gap-2 flex-wrap">
                  {categories.map((c) => (
                    <button key={c.value} onClick={() => setCategory(c.value)}
                      className={`text-xs px-3 py-1.5 rounded-full font-display tracking-wider transition-all flex items-center gap-1 ${category === c.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      <c.icon className="w-3 h-3" /> {c.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {Object.entries(conditionLabels).map(([k, v]) => (
                    <button key={k} onClick={() => setCondition(k)}
                      className={`text-xs px-3 py-1.5 rounded-full font-display tracking-wider transition-all ${condition === k ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                {photoPreview ? (
                  <div className="relative">
                    <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-primary/30" />
                    <button onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 bg-background/80 rounded-full p-1 text-xs text-destructive">✕</button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-primary/5 transition-colors rounded-lg border-2 border-dashed border-primary/20">
                    <Upload className="w-8 h-8 text-primary/50 mb-2" />
                    <span className="text-xs text-muted-foreground">Upload photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </label>
                )}
                <Button onClick={submitDonation} disabled={submitting} className="w-full mt-4 bg-primary text-primary-foreground font-display tracking-wider">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Donation"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search donations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-secondary border-primary/20 text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterCat(null)}
              className={`text-xs px-3 py-1.5 rounded-full font-display tracking-wider ${!filterCat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>All</button>
            {categories.map((c) => (
              <button key={c.value} onClick={() => setFilterCat(c.value)}
                className={`text-xs px-3 py-1.5 rounded-full font-display tracking-wider flex items-center gap-1 ${filterCat === c.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                <c.icon className="w-3 h-3" /> {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-xl p-16 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-display tracking-wider">No donations yet. Be the first to contribute!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((d, i) => {
              const catCfg = categories.find((c) => c.value === d.category);
              const CatIcon = catCfg?.icon || Boxes;
              return (
                <motion.div key={d.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl overflow-hidden hover:neon-border transition-all group">
                  {d.image_url ? (
                    <img src={d.image_url} alt={d.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-40 bg-secondary flex items-center justify-center">
                      <CatIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-display text-sm font-bold tracking-wider truncate">{d.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColors[d.status]}`}>{d.status}</span>
                    </div>
                    {d.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{d.description}</p>}
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Tag className="w-3 h-3" /> {catCfg?.label || d.category}
                      <span>•</span>
                      <span>{conditionLabels[d.condition] || d.condition}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;

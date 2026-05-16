import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Download, Filter, AlertTriangle, Loader2, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import JSZip from "jszip";

type Fitz = "I-II" | "III" | "IV" | "V" | "VI";
type Quality = "Standard" | "Low-Quality" | "Surveillance";
type AgeGroup = "Child" | "Youth" | "Adult" | "Elderly";
type Gender = "Male" | "Female";

interface Item {
  id: string;
  file: File;
  url: string;
  status: "pending" | "tagging" | "done" | "error";
  fitzpatrick?: Fitz;
  quality?: Quality;
  age_group?: AgeGroup;
  gender?: Gender;
  confidence?: number;
  notes?: string;
  error?: string;
}

const FITZ: Fitz[] = ["I-II", "III", "IV", "V", "VI"];
const QUALS: Quality[] = ["Standard", "Low-Quality", "Surveillance"];
const AGES: AgeGroup[] = ["Child", "Youth", "Adult", "Elderly"];
const GENDERS: Gender[] = ["Male", "Female"];

const fitzColor = (f?: Fitz) => ({
  "I-II": "bg-amber-100 text-amber-900 border-amber-300",
  "III": "bg-orange-100 text-orange-900 border-orange-300",
  "IV": "bg-rose-100 text-rose-900 border-rose-300",
  "V": "bg-purple-100 text-purple-900 border-purple-300",
  "VI": "bg-slate-200 text-slate-900 border-slate-400",
}[f || "III"]);

const qualColor = (q?: Quality) => ({
  "Standard": "bg-emerald-100 text-emerald-900 border-emerald-300",
  "Low-Quality": "bg-yellow-100 text-yellow-900 border-yellow-300",
  "Surveillance": "bg-red-100 text-red-900 border-red-300",
}[q || "Standard"]);

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const DatasetLab = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagging, setTagging] = useState(false);
  const [taggedCount, setTaggedCount] = useState(0);
  const [filterFitz, setFilterFitz] = useState<string>("all");
  const [filterQual, setFilterQual] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).slice(0, 500).filter(f => /image\/(jpe?g|png)/i.test(f.type));
    if (!arr.length) { toast.error("No valid JPG/PNG images"); return; }
    setUploadProgress(0);
    const newItems: Item[] = [];
    for (let i = 0; i < arr.length; i++) {
      const f = arr[i];
      newItems.push({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2,7)}`,
        file: f, url: URL.createObjectURL(f), status: "pending",
      });
      setUploadProgress(Math.round(((i + 1) / arr.length) * 100));
    }
    setItems(prev => [...prev, ...newItems]);
    toast.success(`Uploaded ${arr.length} images`);
    setTimeout(() => setUploadProgress(0), 1500);
  };

  const autoTagAll = async () => {
    const pending = items.filter(i => i.status === "pending" || i.status === "error");
    if (!pending.length) { toast.info("Nothing to tag"); return; }
    setTagging(true);
    setTaggedCount(0);
    const BATCH = 5;
    let done = 0;
    for (let i = 0; i < pending.length; i += BATCH) {
      const batch = pending.slice(i, i + BATCH);
      setItems(prev => prev.map(it => batch.find(b => b.id === it.id) ? { ...it, status: "tagging" } : it));
      await Promise.all(batch.map(async (it) => {
        try {
          const b64 = await fileToBase64(it.file);
          const { data, error } = await supabase.functions.invoke("tag-image", { body: { imageBase64: b64 } });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          setItems(prev => prev.map(p => p.id === it.id ? {
            ...p, status: "done",
            fitzpatrick: data.fitzpatrick, quality: data.quality,
            age_group: data.age_group, gender: data.gender,
            confidence: data.confidence, notes: data.notes,
          } : p));
        } catch (e: any) {
          setItems(prev => prev.map(p => p.id === it.id ? { ...p, status: "error", error: e.message } : p));
        } finally {
          done++;
          setTaggedCount(done);
        }
      }));
    }
    setTagging(false);
    toast.success(`Tagging complete: ${done} processed`);
  };

  const updateTag = (id: string, key: keyof Item, value: any) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, [key]: value } : p));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(p => p.id !== id));

  const tagged = items.filter(i => i.status === "done");

  const filtered = useMemo(() => tagged.filter(i =>
    (filterFitz === "all" || i.fitzpatrick === filterFitz) &&
    (filterQual === "all" || i.quality === filterQual) &&
    (filterAge === "all" || i.age_group === filterAge)
  ), [tagged, filterFitz, filterQual, filterAge]);

  const fitzDist = useMemo(() => FITZ.map(f => ({
    name: f, count: tagged.filter(i => i.fitzpatrick === f).length,
    pct: tagged.length ? Math.round((tagged.filter(i => i.fitzpatrick === f).length / tagged.length) * 100) : 0,
  })), [tagged]);

  const qualDist = useMemo(() => QUALS.map(q => ({
    name: q, count: tagged.filter(i => i.quality === q).length,
  })), [tagged]);

  const ageDist = useMemo(() => AGES.map(a => ({
    name: a, count: tagged.filter(i => i.age_group === a).length,
    pct: tagged.length ? Math.round((tagged.filter(i => i.age_group === a).length / tagged.length) * 100) : 0,
  })), [tagged]);

  const missingCoverage = fitzDist.filter(f => tagged.length >= 10 && f.pct < 10).map(f => f.name);

  const paperSentence = useMemo(() => {
    if (!tagged.length) return "";
    const lowPct = Math.round((tagged.filter(i => i.quality !== "Standard").length / tagged.length) * 100);
    return `The expanded dataset comprises ${tagged.length} images with the following demographic distribution: Fitzpatrick Types I-II (${fitzDist[0].pct}%), III (${fitzDist[1].pct}%), IV (${fitzDist[2].pct}%), V (${fitzDist[3].pct}%), VI (${fitzDist[4].pct}%); age groups Child (${ageDist[0].pct}%), Youth (${ageDist[1].pct}%), Adult (${ageDist[2].pct}%), Elderly (${ageDist[3].pct}%); ${lowPct}% low-quality/surveillance images.`;
  }, [tagged, fitzDist, ageDist]);

  const exportZip = async (forVisionTrack = false) => {
    if (!tagged.length) { toast.error("No tagged images to export"); return; }
    const zip = new JSZip();
    const imgFolder = zip.folder("images")!;
    const rows = [["filename", "fitzpatrick", "quality", "age_group", "gender", "confidence", "notes"]];
    for (const it of tagged) {
      const ext = it.file.name.split(".").pop() || "jpg";
      const fname = `${it.id}.${ext}`;
      imgFolder.file(fname, it.file);
      rows.push([fname, it.fitzpatrick || "", it.quality || "", it.age_group || "", it.gender || "", String(it.confidence ?? ""), (it.notes || "").replace(/[\r\n,]/g, " ")]);
    }
    zip.file("labels.csv", rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n"));
    zip.file("dataset_summary.json", JSON.stringify({
      total: tagged.length, fitzpatrick: fitzDist, quality: qualDist, age: ageDist,
      paper_sentence: paperSentence, generated_at: new Date().toISOString(),
      format: forVisionTrack ? "visiontrack-face-eval" : "standard",
    }, null, 2));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = forVisionTrack ? "visiontrack_dataset.zip" : "dataset.zip";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dataset exported");
  };

  return (
    <div className="min-h-screen pt-20 bg-background">
      {/* Dark header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-7 h-7 text-primary" />
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-wider text-primary neon-text">
                DATASET LAB
              </h1>
            </div>
            <p className="text-muted-foreground text-sm tracking-wide">
              AI-POWERED FACE DATASET PREPARATION · AUTO-TAG · REVIEW · EXPORT
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="upload">1. Upload</TabsTrigger>
            <TabsTrigger value="tag">2. Auto-Tag</TabsTrigger>
            <TabsTrigger value="review">3. Review</TabsTrigger>
            <TabsTrigger value="export">4. Export</TabsTrigger>
          </TabsList>

          {/* UPLOAD */}
          <TabsContent value="upload" className="space-y-4">
            <Card
              className="border-2 border-dashed border-primary/30 p-12 text-center cursor-pointer hover:border-primary/60 transition-colors"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-primary" />
              <p className="font-display text-lg tracking-wider mb-1">DROP IMAGES HERE</p>
              <p className="text-sm text-muted-foreground">JPG / PNG · up to 500 images</p>
              <input
                ref={inputRef} type="file" multiple accept="image/jpeg,image/png"
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </Card>

            {uploadProgress > 0 && (
              <div>
                <div className="flex justify-between text-xs mb-2 text-muted-foreground">
                  <span>Uploading...</span><span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {items.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">{items.length} images loaded</p>
                  <Button onClick={() => setItems([])} variant="outline" size="sm">Clear</Button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {items.slice(0, 80).map(it => (
                    <div key={it.id} className="relative aspect-square rounded overflow-hidden border border-border">
                      <img src={it.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {items.length > 80 && (
                    <div className="aspect-square rounded border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground">
                      +{items.length - 80}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAG */}
          <TabsContent value="tag" className="space-y-4">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="font-display text-xl tracking-wider mb-1">AUTO-TAGGING ENGINE</h2>
                  <p className="text-sm text-muted-foreground">
                    Lovable AI · batches of 5 · Fitzpatrick / Quality / Age / Gender
                  </p>
                </div>
                <Button onClick={autoTagAll} disabled={tagging || !items.length} className="gap-2">
                  {tagging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {tagging ? `Tagging ${taggedCount}/${items.filter(i => i.status !== "done").length + taggedCount}...` : "Auto-Tag All"}
                </Button>
              </div>
              {tagging && (
                <Progress value={Math.round((taggedCount / Math.max(1, items.filter(i => i.status === "tagging" || i.status === "done").length + items.filter(i => i.status === "pending").length)) * 100)} />
              )}
            </Card>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {items.map(it => (
                <Card key={it.id} className="p-2 space-y-1">
                  <div className="relative aspect-square rounded overflow-hidden">
                    <img src={it.url} alt="" className="w-full h-full object-cover" />
                    {it.status === "tagging" && (
                      <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {it.status === "done" && (
                    <div className="flex flex-wrap gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${fitzColor(it.fitzpatrick)}`}>{it.fitzpatrick}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${qualColor(it.quality)}`}>{it.quality}</span>
                    </div>
                  )}
                  {it.status === "error" && (
                    <p className="text-[10px] text-destructive truncate" title={it.error}>{it.error}</p>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* REVIEW */}
          <TabsContent value="review" className="space-y-6">
            {missingCoverage.length > 0 && (
              <Card className="p-4 border-yellow-500/40 bg-yellow-500/5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Missing coverage</p>
                  <p className="text-xs text-muted-foreground">
                    Fitzpatrick type{missingCoverage.length > 1 ? "s" : ""} {missingCoverage.join(", ")} below 10%.
                  </p>
                </div>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h3 className="font-display text-sm tracking-wider mb-3">FITZPATRICK DISTRIBUTION</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={fitzDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))">
                      {fitzDist.map((_, i) => <Cell key={i} fill="hsl(var(--primary))" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-4">
                <h3 className="font-display text-sm tracking-wider mb-3">QUALITY DISTRIBUTION</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={qualDist}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={filterFitz} onValueChange={setFilterFitz}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Fitzpatrick" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fitzpatrick</SelectItem>
                    {FITZ.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterQual} onValueChange={setFilterQual}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Quality" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Quality</SelectItem>
                    {QUALS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterAge} onValueChange={setFilterAge}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Age" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ages</SelectItem>
                    {AGES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-xs text-muted-foreground ml-auto">{filtered.length} / {tagged.length} shown</span>
              </div>
            </Card>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(it => (
                <Card key={it.id} className="p-3 space-y-2">
                  <div className="relative aspect-square rounded overflow-hidden">
                    <img src={it.url} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeItem(it.id)} className="absolute top-1 right-1 bg-background/80 rounded p-1 hover:bg-destructive hover:text-destructive-foreground">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <Select value={it.fitzpatrick} onValueChange={(v) => updateTag(it.id, "fitzpatrick", v)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{FITZ.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={it.quality} onValueChange={(v) => updateTag(it.id, "quality", v)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{QUALS.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={it.age_group} onValueChange={(v) => updateTag(it.id, "age_group", v)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{AGES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={it.gender} onValueChange={(v) => updateTag(it.id, "gender", v)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {typeof it.confidence === "number" && (
                    <Badge variant="outline" className="text-[10px]">conf {Math.round(it.confidence * 100)}%</Badge>
                  )}
                  {it.notes && <p className="text-[10px] text-muted-foreground truncate" title={it.notes}>{it.notes}</p>}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* EXPORT */}
          <TabsContent value="export" className="space-y-4">
            <Card className="p-6 space-y-4">
              <h2 className="font-display text-xl tracking-wider">EXPORT DATASET</h2>
              <p className="text-sm text-muted-foreground">{tagged.length} tagged images ready for export.</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => exportZip(false)} className="gap-2"><Download className="w-4 h-4" /> Export Dataset ZIP</Button>
                <Button onClick={() => exportZip(true)} variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export for VisionTrack</Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-display text-sm tracking-wider mb-3">PAPER SENTENCE</h3>
              <div className="bg-muted/50 p-4 rounded border border-border text-sm leading-relaxed font-mono">
                {paperSentence || "Tag images to generate the summary."}
              </div>
              {paperSentence && (
                <Button size="sm" variant="ghost" className="mt-3" onClick={() => { navigator.clipboard.writeText(paperSentence); toast.success("Copied"); }}>
                  Copy to clipboard
                </Button>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DatasetLab;

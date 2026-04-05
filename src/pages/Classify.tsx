import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Brain, BarChart3, Image as ImageIcon, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Prediction {
  class: string;
  confidence: number;
}

interface ClassifyResult {
  predicted_class: string;
  confidence: number;
  description: string;
  all_predictions: Prediction[];
}

interface HistoryItem {
  id: string;
  image_url: string | null;
  predicted_class: string;
  confidence: number;
  model_used: string;
  all_predictions: Prediction[];
  created_at: string;
}

const Classify = () => {
  const { user } = useAuth();
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("classifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as unknown as HistoryItem[]);
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB"); return; }
    setPhoto(file);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPhotoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const classify = async () => {
    if (!photoPreview) { toast.error("Upload an image first"); return; }
    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/classify-image`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ image_base64: photoPreview }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Classification failed");
      }

      const data: ClassifyResult = await resp.json();
      setResult(data);
      toast.success(`Classified: ${data.predicted_class} (${Math.round(data.confidence * 100)}%)`);
      if (user) fetchHistory();
    } catch (e: any) {
      toast.error(e.message || "Classification failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setPhotoPreview(null);
    setResult(null);
  };

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return "text-accent neon-text-green";
    if (c >= 0.5) return "text-primary neon-text";
    return "text-destructive";
  };

  const confidenceBarColor = (c: number) => {
    if (c >= 0.8) return "bg-accent";
    if (c >= 0.5) return "bg-primary";
    return "bg-destructive";
  };

  return (
    <div className="py-6 px-4 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-4xl font-display font-black tracking-[0.2em] uppercase">
            <span className="text-primary neon-text">Image Classification</span>
          </h1>
          <p className="text-sm text-muted-foreground font-display tracking-wider mt-2">
            AI-Powered Computer Vision • Upload an image to classify it
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Zone */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div
              className={`relative glass rounded-xl p-6 transition-all duration-300 ${dragOver ? "neon-border" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-primary/20 rounded-xl pointer-events-none" />
              <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                <Upload className="w-4 h-4" /> Upload Image
              </h3>

              {photoPreview ? (
                <div className="relative mb-4">
                  <img src={photoPreview} alt="Upload" className="w-full h-64 object-contain rounded-lg border border-primary/30 bg-secondary/30" />
                  <button onClick={reset}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-64 cursor-pointer hover:bg-primary/5 transition-colors mb-4 rounded-lg">
                  <ImageIcon className="w-16 h-16 text-primary/30 mb-3" />
                  <span className="text-sm text-muted-foreground font-display tracking-wider">Drag & drop or click to browse</span>
                  <span className="text-xs text-muted-foreground/50 mt-1">JPG, PNG, WEBP • Max 10MB</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                </label>
              )}

              <Button
                onClick={classify}
                disabled={loading || !photoPreview}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/80 font-display tracking-[0.15em] uppercase text-sm h-12 neon-border"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Classifying...</>
                ) : (
                  <><Brain className="w-4 h-4 mr-2" /> Classify Image</>
                )}
              </Button>
            </div>

            {/* History */}
            {history.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-6">
                <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                  <Clock className="w-4 h-4" /> Recent Classifications
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40 text-sm">
                      <span className="font-display tracking-wider font-bold capitalize">{h.predicted_class}</span>
                      <span className={`font-display font-black ${confidenceColor(h.confidence)}`}>
                        {Math.round(h.confidence * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Results */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <AnimatePresence>
              {loading && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-xl p-10 text-center relative overflow-hidden">
                  <div className="absolute inset-0 scan-line" />
                  <Brain className="w-20 h-20 text-primary mx-auto mb-4 animate-spin" style={{ animationDuration: "3s" }} />
                  <p className="font-display text-sm tracking-[0.2em] uppercase text-primary neon-text">Analyzing image...</p>
                  <p className="text-xs text-muted-foreground mt-2">Running deep learning classification model</p>
                </motion.div>
              )}
            </AnimatePresence>

            {result && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {/* Main Result */}
                <div className="glass rounded-xl p-6 neon-border">
                  <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                    <Brain className="w-4 h-4" /> Classification Result
                  </h3>
                  <div className="text-center py-4">
                    <p className="text-5xl font-display font-black text-primary neon-text capitalize mb-2">{result.predicted_class}</p>
                    <p className={`text-3xl font-display font-black ${confidenceColor(result.confidence)}`}>
                      {Math.round(result.confidence * 100)}% Confidence
                    </p>
                    {result.description && (
                      <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{result.description}</p>
                    )}
                  </div>
                </div>

                {/* All Predictions */}
                {result.all_predictions && result.all_predictions.length > 0 && (
                  <div className="glass rounded-xl p-6">
                    <h3 className="font-display text-xs font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2 text-primary">
                      <BarChart3 className="w-4 h-4" /> All Predictions
                    </h3>
                    <div className="space-y-3">
                      {result.all_predictions.map((p, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-display tracking-wider capitalize">{p.class}</span>
                            <span className={`text-sm font-display font-bold ${confidenceColor(p.confidence)}`}>
                              {Math.round(p.confidence * 100)}%
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${confidenceBarColor(p.confidence)}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.round(p.confidence * 100)}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Model Info */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-display tracking-wider">
                    <span>Model: Gemini Vision</span>
                    <span>Engine: VisionTrack AI</span>
                  </div>
                </div>
              </motion.div>
            )}

            {!loading && !result && (
              <div className="glass rounded-xl p-10 text-center">
                <Brain className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground font-display tracking-wider">Upload an image and click Classify to start</p>
                <p className="text-xs text-muted-foreground/50 mt-2">Powered by deep learning computer vision</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Classify;

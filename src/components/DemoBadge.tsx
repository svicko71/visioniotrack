import { useAuth } from "@/hooks/useAuth";

/**
 * Small non-intrusive badge shown to unauthenticated visitors so they know
 * their interactions run in Demo Mode (no data is persisted to the backend).
 */
export const DemoBadge = () => {
  const { user, loading } = useAuth();
  if (loading || user) return null;
  return (
    <div
      className="fixed bottom-3 left-3 z-40 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase border border-border bg-background/80 backdrop-blur text-muted-foreground pointer-events-none select-none"
      aria-hidden="true"
    >
      Demo Mode
    </div>
  );
};

export default DemoBadge;

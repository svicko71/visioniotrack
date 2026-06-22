import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border bg-card/40 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-sm font-bold text-primary neon-text mb-3">{t("brand")}</h3>
            <p className="text-sm text-muted-foreground">{t("footer.tagline")}</p>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">{t("footer.platform")}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.home")}</Link>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.dashboard")}</Link>
              <Link to="/classify" className="text-sm text-muted-foreground hover:text-primary transition-colors">Classify</Link>
              <Link to="/cases" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("nav.cases")}</Link>
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">{t("footer.company")}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.about")}</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("footer.contact")}</Link>
              <span className="text-sm text-muted-foreground">{t("footer.privacy")}</span>
              <span className="text-sm text-muted-foreground">{t("footer.terms")}</span>
            </div>
          </div>
          <div>
            <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">{t("footer.techStack")}</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>React + TypeScript</span>
              <span>TensorFlow + PyTorch</span>
              <span>OpenCV + CNN</span>
              <span>Python (Flask)</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{t("footer.rights")}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Shield className="w-3 h-3" /> ITC-EGYPT 2026 — 6th International Innovation Competition
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { Link } from "react-router-dom";
import { Shield, Mail, Globe } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/40 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-sm font-bold text-primary neon-text mb-3">VisionTrack AI</h3>
          <p className="text-sm text-muted-foreground">AI-Powered Real-Time Missing Person Finder. Built for ITC-EGYPT 2026.</p>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">PLATFORM</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/classify" className="text-sm text-muted-foreground hover:text-primary transition-colors">Classify</Link>
            <Link to="/cases" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cases</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">COMPANY</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
            <span className="text-sm text-muted-foreground">Privacy Policy</span>
            <span className="text-sm text-muted-foreground">Terms of Service</span>
          </div>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">TECH STACK</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <span>React + TypeScript</span>
            <span>TensorFlow + PyTorch</span>
            <span>OpenCV + CNN</span>
            <span>Python (Flask)</span>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">© 2026 VisionTrack AI. All rights reserved.</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Shield className="w-3 h-3" /> ITC-EGYPT 2026 — 6th International Innovation Competition
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;

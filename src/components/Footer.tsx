import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card/40 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-sm font-bold text-primary neon-text mb-3">VisionTrack AI</h3>
          <p className="text-sm text-muted-foreground">AI-Powered Real-Time Search for missing persons.</p>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">LINKS</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold text-foreground mb-3 tracking-wider">LEGAL</h4>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Privacy Policy</span>
            <span className="text-sm text-muted-foreground">Terms of Service</span>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 VisionTrack AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

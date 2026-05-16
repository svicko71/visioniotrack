import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogIn, LogOut, User, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/command", label: "Command" },
  { to: "/search", label: "AI Search" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/cases", label: "Cases" },
  { to: "/shield", label: "Urban Shield" },
  { to: "/shield-live", label: "Shield Live" },
  { to: "/field", label: "Field Trial" },
  { to: "/face-eval", label: "Face Eval" },
  { to: "/urban", label: "Urban AI" },
  { to: "/admin", label: "Admin" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border"
    >
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="VisionTrack AI" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-lg font-bold tracking-wider text-primary neon-text">
            VisionTrack AI
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                location.pathname === l.to
                  ? "text-primary bg-primary/10 neon-text"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <button
            onClick={toggle}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" /> {user.email?.split("@")[0]}
              </span>
              <Button size="sm" variant="outline" onClick={signOut} className="text-xs border-border text-muted-foreground hover:text-destructive">
                <LogOut className="w-3 h-3 mr-1" /> Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth" className="ml-2">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/80 text-xs font-display tracking-wider">
                <LogIn className="w-3 h-3 mr-1" /> Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden glass border-t border-border"
        >
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm transition-colors ${
                location.pathname === l.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <button onClick={() => { signOut(); setOpen(false); }} className="block w-full text-left px-6 py-3 text-sm text-destructive">
              Sign Out
            </button>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)} className="block px-6 py-3 text-sm text-primary">
              Sign In
            </Link>
          )}
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;

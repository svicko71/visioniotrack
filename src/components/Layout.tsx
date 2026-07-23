import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AIChatbot from "./AIChatbot";
import ErrorBoundary from "./ErrorBoundary";
import DemoBadge from "./DemoBadge";

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16">
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </main>
    <Footer />
    <AIChatbot />
    <DemoBadge />
  </div>
);

export default Layout;

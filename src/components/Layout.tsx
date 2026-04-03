import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AIChatbot from "./AIChatbot";

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pt-16">
      <Outlet />
    </main>
    <Footer />
    <AIChatbot />
  </div>
);

export default Layout;

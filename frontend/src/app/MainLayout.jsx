// frontend/src/app/MainLayout.jsx
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0a0f1d] to-[#050a14]">
      <Navbar />
      <main className="overflow-x-hidden px-3 pb-12 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;

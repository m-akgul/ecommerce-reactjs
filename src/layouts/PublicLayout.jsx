// src/layouts/PublicLayout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/common/Footer";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="container py-4 px-3">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default PublicLayout;

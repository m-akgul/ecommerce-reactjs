import { Link, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar */}
      <aside
        className="bg-dark text-white d-flex flex-column p-3 shadow"
        style={{
          width: "250px",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        <div className="mb-4 text-center border-bottom pb-3">
          <img
            src="/logo.png"
            alt="Admin"
            style={{ width: "60px", height: "auto", marginBottom: "10px" }}
          />
          <h5 className="fw-bold text-white">Admin Panel</h5>
        </div>
        <nav className="nav flex-column gap-2">
          {[
            { to: "/admin/products", icon: "📦", label: "Products" },
            { to: "/admin/categories", icon: "🗂️", label: "Categories" },
            { to: "/admin/coupons", icon: "🎟️", label: "Coupons" },
            { to: "/admin/orders", icon: "📑", label: "Orders" },
            { to: "/admin/users", icon: "👥", label: "Users" },
            { to: "/admin/roles", icon: "🔐", label: "Roles" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link px-3 py-2 rounded ${
                isActive(item.to)
                  ? "bg-primary text-white fw-bold"
                  : "text-white"
              }`}
            >
              <span className="me-2">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <hr className="text-secondary my-3" />
          <Link
            to="/"
            className="nav-link px-3 py-2 rounded text-white bg-secondary"
          >
            🏠 Back to Store
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-grow-1 p-4 bg-light">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

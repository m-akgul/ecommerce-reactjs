import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Collapse } from "bootstrap";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    collapseNavbar();
    navigate("/login");
  };

  const collapseNavbar = () => {
    const navbarEl = document.getElementById("navbarToggler");
    if (navbarEl?.classList.contains("show")) {
      const bsCollapse = Collapse.getOrCreateInstance(navbarEl);
      bsCollapse.hide();
    }
  };

  return (
    <nav className="navbar navbar-expand-xl sticky-top bg-white border-bottom shadow-sm py-3">
      <div className="container">
        <Link
          className="navbar-brand fw-bold text-primary d-block p-0 m-0 "
          to="/"
          onClick={collapseNavbar}
        >
          <img
            src="/logo.png"
            alt="VahaShop"
            className="d-block object-fit-contain me-3"
            style={{ height: "3.5rem", width: "auto" }}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarToggler"
          aria-controls="navbarToggler"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarToggler">
          {user &&
            Array.isArray(user.roles) &&
            user.roles.includes("Admin") && (
              <div className="navbar-nav d-xl-flex flex-xl-row align-items-xl-center">
                <div className="vr d-none d-xl-block" />
                <Link
                  className="nav-link fw-semibold text-muted"
                  to="/admin/products"
                >
                  Admin Panel
                </Link>
                <div className="vr d-none d-xl-block" />
              </div>
            )}
          <div className="navbar-nav">
            <Link className="nav-link" to="/products" onClick={collapseNavbar}>
              Products
            </Link>
            <Link
              className="nav-link"
              to="/categories"
              onClick={collapseNavbar}
            >
              Categories
            </Link>
            <Link className="nav-link" to="/cart" onClick={collapseNavbar}>
              Cart
            </Link>
          </div>
          <div className="ms-auto navbar-nav">
            {!isAuthenticated ? (
              <>
                <Link className="nav-link" to="/login" onClick={collapseNavbar}>
                  Login
                </Link>
                <Link
                  className="nav-link"
                  to="/register"
                  onClick={collapseNavbar}
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  className="nav-link"
                  to="/wishlist"
                  onClick={collapseNavbar}
                >
                  Wishlist
                </Link>
                <Link
                  className="nav-link"
                  to="/profile"
                  onClick={collapseNavbar}
                >
                  Profile
                </Link>
                <button onClick={handleLogout} className="nav-link">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

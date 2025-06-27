import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { useCart } from "./contexts/CartContext";
import { useEffect } from "react";
import { useDialog } from "./contexts/DialogContext";

import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";

// Public pages
import Products from "./pages/Products";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import MyOrders from "./pages/user/MyOrders";
import Wishlist from "./pages/user/Wishlist";
import Profile from "./pages/user/Profile";

// Admin pages
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminRoles from "./pages/admin/AdminRoles";

function App() {
  const { isAuthenticated } = useAuth();
  const { syncGuestCart } = useCart();
  const { logout } = useAuth();
  const { showDialog } = useDialog();

  useEffect(() => {
    const handleUnauthorized = async () => {
      await showDialog({
        type: "alert",
        message: "Your session has expired. Please log in again.",
      });

      logout(); // clears context and localStorage
      window.location.href = "/login";
    };

    window.addEventListener("unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized);
    };
  }, [logout, showDialog]);

  useEffect(() => {
    if (isAuthenticated) {
      syncGuestCart(); // merge cart on login
    }
  }, [isAuthenticated, syncGuestCart]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Products />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <MyOrders />
              </PrivateRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <PrivateRoute>
                <Wishlist />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Route>

        {/* Admin Layout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetails />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="users/:id" element={<AdminUserDetails />} />
          <Route path="roles" element={<AdminRoles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

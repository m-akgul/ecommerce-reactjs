import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import { useDialog } from "../../contexts/DialogContext";

function MyOrders() {
  const { token } = useAuth();
  const { showDialog } = useDialog();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!token) return;
    axios
      .get(API_ENDPOINTS.ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setOrders(res.data.data))
      .catch(() => console.error("Failed to fetch orders"));
  }, [token]);

  const handleCancel = async (orderId) => {
    try {
      await axios.put(
        `${API_ENDPOINTS.ORDERS}/${orderId}/cancel`,
        { orderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Order cancelled.");
      // Refresh
      const updated = await axios.get(API_ENDPOINTS.ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(updated.data.data);
    } catch {
      toast.error("Cancel failed.");
      showDialog({
        type: "alert",
        message: "Failed to cancel order.",
      });
    }
  };

  const handleInvoiceDownload = (orderId) => {
    axios
      .get(`${API_ENDPOINTS.ORDERS}/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      })
      .then((res) => {
        const url = URL.createObjectURL(res.data);
        window.open(url);
        setTimeout(() => URL.revokeObjectURL(url), 10000); // Clean up URL after 10 seconds
      })
      .catch((error) => {
        console.error("Failed to open PDF:", error);
      });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Paid";
      case 2:
        return "Shipped";
      case 3:
        return "Delivered";
      case 4:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 0:
        return "warning";
      case 1:
        return "primary";
      case 2:
        return "info";
      case 3:
        return "success";
      case 4:
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-muted">You have no orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="card mb-4 shadow-sm">
            <div className="card-body">
              {/* Order Header */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-1">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h5>
                  <small className="text-muted">
                    Placed on {new Date(order.createdAt).toLocaleString()}
                  </small>
                </div>
                <div>
                  <span
                    className={`badge bg-${getStatusColor(
                      order.status
                    )} px-3 py-2`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <ul className="list-group list-group-flush mb-3">
                {order.items.map((item, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <div>
                      {item.productName} × {item.quantity}
                    </div>
                    <div className="fw-medium">
                      ₺{item.price * item.quantity}
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Total:</strong> ₺{order.totalAmount}
                </div>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleInvoiceDownload(order.id)}
                  >
                    🧾 Invoice
                  </button>
                  {![2, 3, 4].includes(order.status) && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(order.id)}
                    >
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default MyOrders;

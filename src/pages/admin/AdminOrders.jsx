import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import { useNavigate } from "react-router-dom";
import { useDialog } from "../../contexts/DialogContext";
import { FaTh, FaList } from "react-icons/fa";

const ORDER_STATUS = {
  0: "Pending",
  1: "Paid",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

function AdminOrders() {
  const { token } = useAuth();
  const { showDialog } = useDialog();
  const [orders, setOrders] = useState([]);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [viewMode, setViewMode] = useState("table");
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN_ORDERS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.data);
    } catch {
      console.error("Failed to load orders.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchOrders();
    }
  }, [fetchOrders, token]);

  const handleStatusChange = (orderId, newStatus) => {
    setStatusUpdates((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleStatusSubmit = async (orderId) => {
    try {
      const newStatus = statusUpdates[orderId];
      await axios.put(
        `${API_ENDPOINTS.ADMIN_ORDERS}/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Order status updated.");
      fetchOrders();
    } catch {
      toast.error("Failed to update status.");
      showDialog({
        type: "alert",
        message: "Failed to update order status.",
      });
    }
  };

  return (
    <div className="admin-orders-page mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 m-0">📦 Manage Orders</h2>
        <button
          className="btn btn-outline-secondary"
          onClick={() =>
            setViewMode((prev) => (prev === "grid" ? "table" : "grid"))
          }
        >
          {viewMode === "grid" ? <FaTh /> : <FaList />} View
        </button>
      </div>

      {viewMode === "grid" ? (
        <div className="row g-3">
          {orders.length === 0 ? (
            <div className="col">
              <div className="alert alert-info text-center">
                No orders found
              </div>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="col-12 col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title text-primary">
                      Order #{o.id.slice(0, 8)}
                    </h5>
                    <p className="mb-2">
                      <strong>User:</strong> {o.userId.slice(0, 8)}
                    </p>
                    <p className="mb-2">
                      <strong>Total:</strong> ₺{o.totalAmount}
                    </p>
                    <p className="mb-2">
                      <strong>Date:</strong> {o.createdAt}
                    </p>
                    <p className="mb-2">
                      <strong>Status:</strong> {ORDER_STATUS[o.status]}
                    </p>
                    <select
                      className="form-select form-select-sm mb-2"
                      value={statusUpdates[o.id] ?? o.status}
                      onChange={(e) =>
                        handleStatusChange(o.id, parseInt(e.target.value))
                      }
                    >
                      {Object.entries(ORDER_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <div className="d-flex justify-content-between">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleStatusSubmit(o.id)}
                        disabled={
                          statusUpdates[o.id] === undefined ||
                          statusUpdates[o.id] === o.status
                        }
                      >
                        Update
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="table-responsive bg-white shadow-sm rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>User #</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Change Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id.slice(0, 8)}...</td>
                    <td>{o.userId.slice(0, 8)}...</td>
                    <td>₺{o.totalAmount}</td>
                    <td>{o.createdAt}</td>
                    <td>{ORDER_STATUS[o.status]}</td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={statusUpdates[o.id] ?? o.status}
                        onChange={(e) =>
                          handleStatusChange(o.id, parseInt(e.target.value))
                        }
                      >
                        {Object.entries(ORDER_STATUS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button
                        className="btn btn-sm btn-success mt-1"
                        onClick={() => handleStatusSubmit(o.id)}
                        disabled={
                          statusUpdates[o.id] === undefined ||
                          statusUpdates[o.id] === o.status
                        }
                      >
                        Update
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => navigate(`/admin/orders/${o.id}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;

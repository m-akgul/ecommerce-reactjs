import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import fileDownload from "js-file-download";
import { useDialog } from "../../contexts/DialogContext";

const ORDER_STATUS = {
  0: "Pending",
  1: "Paid",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
};

function AdminOrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const { showDialog } = useDialog();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINTS.ADMIN_ORDERS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data.data);
      } catch {
        console.error("Failed to load order.");
      }
    };

    if (token) {
      fetchOrder();
    }
  }, [id, token]);

  const handleDownloadInvoice = async () => {
    try {
      const res = await axios.get(
        `${API_ENDPOINTS.ADMIN_ORDERS}/${order.id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      fileDownload(res.data, `invoice_${order.id}.pdf`);
    } catch {
      toast.error("Failed to download invoice.");
      showDialog({
        type: "alert",
        message: "Failed to download invoice.",
      });
    }
  };

  if (!order) return <div className="container mt-5">Loading...</div>;

  return (
    <div className="admin-order-details-page">
      <div className="mb-4">
        <h2 className="h4">🧾 Order Details #{order.id.slice(0, 8)}...</h2>
        <hr />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Order Summary</h5>
              <p>
                <strong>Order ID:</strong> {order.id}
              </p>
              <p>
                <strong>User ID:</strong> {order.userId}
              </p>
              <p>
                <strong>Status:</strong> {ORDER_STATUS[order.status]}
              </p>
              <p>
                <strong>Total:</strong> ₺{order.totalAmount}
              </p>
              <p>
                <strong>Created:</strong> {order.createdAt}
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Shipping Address</h5>
              <p>{order.shippingAddress}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Order Items</h5>
          <div className="table-responsive">
            <table className="table align-middle table-bordered mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Price (₺)</th>
                  <th>Quantity</th>
                  <th>Subtotal (₺)</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.productName}>
                    <td>{item.productName}</td>
                    <td>{item.price}</td>
                    <td>{item.quantity}</td>
                    <td>{item.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="text-end">
        <button
          className="btn btn-outline-secondary"
          onClick={handleDownloadInvoice}
        >
          📄 Download Invoice
        </button>
      </div>
    </div>
  );
}

export default AdminOrderDetails;

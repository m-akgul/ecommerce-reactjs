import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import CouponFormModal from "../../components/admin/CouponFormModal";
import { API_ENDPOINTS } from "../../utils/constants";
import { safeAxios } from "../../api/axiosWrapper";
import { useDialog } from "../../contexts/DialogContext";
import { FaTh, FaList, FaPlus, FaEdit, FaTrash } from "react-icons/fa";

function AdminCoupons() {
  const { token } = useAuth();
  const { showDialog } = useDialog();
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN_COUPONS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data.data);
    } catch {
      console.error("Failed to load coupons");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCoupons();
    }
  }, [fetchCoupons, token]);

  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
  };

  const handleCreate = async (data) => {
    const result = await safeAxios(
      () =>
        axios.post(API_ENDPOINTS.ADMIN_COUPONS, data, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Create failed."
    );
    if (result && result.success) {
      toast.success("Coupon created!");
      closeModal();
      fetchCoupons();
    } else {
      toast.error(result.Message || result);
      showDialog({
        type: "alert",
        message: result.Message || result,
      });
    }
  };

  const handleUpdate = async (data) => {
    const result = await safeAxios(
      () =>
        axios.put(`${API_ENDPOINTS.ADMIN_COUPONS}/${editingCoupon.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Update failed."
    );
    if (result && result.success) {
      toast.success("Coupon updated!");
      closeModal();
      fetchCoupons();
    } else {
      toast.error(result.Message || result);
      showDialog({
        type: "alert",
        message: result.Message || result,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    const result = await safeAxios(
      () =>
        axios.delete(`${API_ENDPOINTS.ADMIN_COUPONS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Delete failed."
    );
    if (result && result.success) {
      toast.success("Coupon deleted!");
      fetchCoupons();
    } else {
      toast.error(result.Message || result);
      showDialog({
        type: "alert",
        message: result.Message || result,
      });
    }
  };

  return (
    <div className="admin-coupons-page mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 m-0">🎟️ Manage Coupons</h2>
        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              setViewMode((prev) => (prev === "grid" ? "table" : "grid"))
            }
          >
            {viewMode === "grid" ? <FaTh /> : <FaList />} View
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-1" /> Add Coupon
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="row g-3">
          {coupons.length === 0 ? (
            <div className="col">
              <div className="alert alert-info text-center">
                No coupons found.
              </div>
            </div>
          ) : (
            coupons.map((c) => (
              <div key={c.id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title text-primary">{c.code}</h5>
                    <p className="mb-2">
                      <strong>Discount:</strong> ₺{c.discountAmount}
                    </p>
                    <p className="mb-2">
                      <strong>Expiry:</strong> {c.expiryDate}
                    </p>
                    <p className="mb-2">
                      <strong>Max Usage:</strong> {c.maxUsageCount}
                    </p>
                    <p className="mb-2">
                      <strong>Used:</strong> {c.totalUsageCount}
                    </p>
                    <p className="mb-2">
                      <strong>Per User:</strong> {c.maxUsagePerUser}
                    </p>
                    <p className="mb-2">
                      <strong>Status:</strong>{" "}
                      {c.isActive ? (
                        <span className="text-success">Active</span>
                      ) : (
                        <span className="text-danger">Inactive</span>
                      )}
                    </p>
                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => {
                          setEditingCoupon(c);
                          setShowModal(true);
                        }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        <FaTrash /> Delete
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
                <th>Code</th>
                <th>Discount</th>
                <th>Expiry</th>
                <th>Allowed Usage</th>
                <th>Total Used</th>
                <th>Per User</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-muted">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id}>
                    <td>{c.code}</td>
                    <td>₺{c.discountAmount}</td>
                    <td>{c.expiryDate}</td>
                    <td>{c.maxUsageCount}</td>
                    <td>{c.totalUsageCount}</td>
                    <td>{c.maxUsagePerUser}</td>
                    <td className={c.isActive ? "text-success" : "text-danger"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-warning"
                          onClick={() => {
                            setEditingCoupon(c);
                            setShowModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(c.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <CouponFormModal
        show={showModal}
        onClose={closeModal}
        onSubmit={editingCoupon ? handleUpdate : handleCreate}
        initialData={editingCoupon}
      />
    </div>
  );
}

export default AdminCoupons;

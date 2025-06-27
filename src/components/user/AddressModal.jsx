import { useState, useEffect } from "react";
import { safeAxios } from "../../api/axiosWrapper";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";

export default function AddressModal({ show, onClose, initial }) {
  const { token } = useAuth();
  const [model, setModel] = useState({
    title: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    if (show) {
      setModel({
        title: initial?.title || "",
        fullAddress: initial?.fullAddress || "",
        city: initial?.city || "",
        postalCode: initial?.postalCode || "",
      });
    }
  }, [initial, show]);

  const handleSave = async () => {
    const endpoint = initial?.id
      ? axios.put(`${API_ENDPOINTS.ADDRESSES}/${initial.id}`, model, {
          headers: { Authorization: `Bearer ${token}` },
        })
      : axios.post(API_ENDPOINTS.ADDRESSES, model, {
          headers: { Authorization: `Bearer ${token}` },
        });

    const res = await safeAxios(() => endpoint, "Save address failed.");
    if (res?.success) {
      toast.success("Address saved.");
      onClose(true);
    }
  };

  if (!show) return null;
  return (
    <div className="dialog-overlay">
      <div className="dialog-box p-4 rounded-3 shadow-lg bg-white">
        <h5 className="mb-4">{initial ? "Edit Address" : "Add New Address"}</h5>

        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Home, Office"
            value={model.title}
            onChange={(e) => setModel({ ...model, title: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Full Address</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Street, Apt, etc."
            value={model.fullAddress}
            onChange={(e) =>
              setModel({ ...model, fullAddress: e.target.value })
            }
            style={{ resize: "none" }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">City</label>
          <input
            type="text"
            className="form-control"
            value={model.city}
            onChange={(e) => setModel({ ...model, city: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Postal Code</label>
          <input
            type="text"
            className="form-control"
            value={model.postalCode}
            onChange={(e) => setModel({ ...model, postalCode: e.target.value })}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => onClose(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

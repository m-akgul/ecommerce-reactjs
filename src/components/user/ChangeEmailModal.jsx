import { useState } from "react";
import { safeAxios } from "../../api/axiosWrapper";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import { useNavigate } from "react-router-dom";

export default function ChangeEmailModal({ show, onClose }) {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleChange = async () => {
    const res = await safeAxios(
      () =>
        axios.put(
          `${API_ENDPOINTS.PROFILE_UPDATE}/email`,
          { newEmail: email },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      "Change email failed."
    );
    if (res?.success) {
      toast.success("Email changed. Please login again.");
      onClose(true);
      logout();
      navigate("/login");
    }
  };

  if (!show) return null;
  return (
    <div className="dialog-overlay">
      <div className="dialog-box p-4 rounded-3 shadow-lg bg-white">
        <h5 className="mb-4">Change Email</h5>

        <div className="mb-3">
          <label className="form-label">New Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => onClose(false)}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleChange}>
            Change
          </button>
        </div>
      </div>
    </div>
  );
}

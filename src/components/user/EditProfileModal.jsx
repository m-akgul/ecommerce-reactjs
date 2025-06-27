import { useState, useEffect } from "react";
import { safeAxios } from "../../api/axiosWrapper";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";

export default function EditProfileModal({ show, onClose, initial }) {
  const { token } = useAuth();
  const [model, setModel] = useState({ username: "", phone: "" });

  useEffect(() => initial && setModel(initial), [initial]);

  const handleSave = async () => {
    const res = await safeAxios(
      () =>
        axios.put(API_ENDPOINTS.PROFILE_UPDATE, model, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Update profile failed."
    );
    if (res?.success) {
      toast.success("Profile updated.");
      onClose(true);
    }
  };

  if (!show) return null;
  return (
    <div className="dialog-overlay">
      <div className="dialog-box p-4 rounded-3 shadow-lg bg-white">
        <h5 className="mb-4">Edit Profile</h5>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={model.username}
            onChange={(e) => setModel({ ...model, username: e.target.value })}
            placeholder="Enter your username"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            value={model.phone}
            onChange={(e) => setModel({ ...model, phone: e.target.value })}
            placeholder="Enter your phone number"
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

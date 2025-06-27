import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../../api/axios";
import { API_ENDPOINTS } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { safeAxios } from "../../api/axiosWrapper";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaCheckCircle,
  FaBan,
  FaUserEdit,
} from "react-icons/fa";

function AdminUserDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  const [user, setUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [newRoles, setNewRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      const [uRes, rolesRes] = await Promise.all([
        safeAxios(
          () =>
            axios.get(`${API_ENDPOINTS.ADMIN_USERS}/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          "Error loading user"
        ),
        safeAxios(
          () =>
            axios.get(API_ENDPOINTS.ADMIN_ROLES, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          "Error loading roles"
        ),
      ]);
      if (uRes?.success) {
        setUser(uRes.data);
        setNewRoles(uRes.data.roles);
      }
      if (rolesRes?.success) setAvailableRoles(rolesRes.data);
      setLoading(false);
    };
    loadUserData();
  }, [id, token]);

  const toggleBan = async () => {
    const res = await safeAxios(
      () =>
        axios.put(
          `${API_ENDPOINTS.ADMIN_USERS}/${id}/ban`,
          { isBanned: !user.isBanned },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      "Error toggling ban"
    );
    if (res?.success) setUser((u) => ({ ...u, isBanned: !u.isBanned }));
  };

  const saveRoles = async () => {
    const res = await safeAxios(
      () =>
        axios.put(
          `${API_ENDPOINTS.ADMIN_USERS}/${id}/roles`,
          { roles: newRoles },
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      "Error updating roles"
    );
    if (res?.success) {
      setUser((u) => ({ ...u, roles: newRoles }));
    }
  };

  if (loading || !user) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">👤 User Details</h2>

      <div className="card shadow-sm border-0">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <p className="mb-2">
                <FaUser className="me-2 text-primary" />
                <strong>Username:</strong> {user.username}
              </p>
              <p className="mb-2">
                <FaEnvelope className="me-2 text-success" />
                <strong>Email:</strong> {user.email}
              </p>
              <p className="mb-2">
                <FaPhone className="me-2 text-info" />
                <strong>Phone:</strong> {user.phone || "-"}
              </p>
            </div>
            <div className="col-md-6">
              <p className="mb-2">
                <FaUserShield className="me-2 text-warning" />
                <strong>Roles:</strong> {user.roles.join(", ")}
              </p>
              <p className="mb-2">
                {user.isBanned ? (
                  <span className="text-danger">
                    <FaBan className="me-2" />
                    <strong>Status:</strong> Banned
                  </span>
                ) : (
                  <span className="text-success">
                    <FaCheckCircle className="me-2" />
                    <strong>Status:</strong> Active
                  </span>
                )}
              </p>
              <div className="mt-3">
                <button
                  className={`btn btn-sm ${
                    user.isBanned ? "btn-success" : "btn-danger"
                  } me-2`}
                  onClick={toggleBan}
                >
                  {user.isBanned ? "Unban User" : "Ban User"}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  data-bs-toggle="modal"
                  data-bs-target="#rolesModal"
                >
                  <FaUserEdit className="me-1" />
                  Assign Roles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Roles Assignment Modal */}
      <div
        className="modal fade"
        id="rolesModal"
        tabIndex="-1"
        aria-labelledby="rolesModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="rolesModalLabel">
                🎯 Assign Roles to {user.username}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              {availableRoles.map((r) => (
                <div key={r.name} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`role-${r.name}`}
                    checked={newRoles.includes(r.name)}
                    onChange={(e) =>
                      setNewRoles((prev) =>
                        e.target.checked
                          ? [...prev, r.name]
                          : prev.filter((x) => x !== r.name)
                      )
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`role-${r.name}`}
                  >
                    {r.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={saveRoles}
                data-bs-dismiss="modal"
              >
                Save Roles
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUserDetails;

import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { API_ENDPOINTS } from "../../utils/constants";
import { toast } from "react-toastify";
import { safeAxios } from "../../api/axiosWrapper";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

function AdminRoles() {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roleName, setRoleName] = useState("");

  const loadRoles = useCallback(async () => {
    const res = await safeAxios(() =>
      axios.get(API_ENDPOINTS.ADMIN_ROLES, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    if (res?.success) setRoles(res.data);
  }, [token]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const openCreateModal = () => {
    setEditing(null);
    setRoleName("");
    setShowModal(true);
  };

  const openEditModal = (role) => {
    setEditing(role);
    setRoleName(role.name);
    setShowModal(true);
  };

  const saveRole = async () => {
    if (!roleName.trim()) return toast.warn("Role name required.");
    const endpoint = editing
      ? axios.put(
          `${API_ENDPOINTS.ADMIN_ROLES}/${editing.id}`,
          { newName: roleName },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      : axios.post(
          API_ENDPOINTS.ADMIN_ROLES,
          { name: roleName },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

    const res = await safeAxios(() => endpoint);
    if (res?.success) {
      toast.success(`Role ${editing ? "updated" : "created"}.`);
      setShowModal(false);
      loadRoles();
    }
  };

  const deleteRole = async (id) => {
    if (!confirm("Are you sure you want to delete this role?")) return;
    const res = await safeAxios(() =>
      axios.delete(`${API_ENDPOINTS.ADMIN_ROLES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    if (res?.success) {
      toast.success("Role deleted.");
      loadRoles();
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h5 mb-0">🔐 Manage Roles</h2>
        <button className="btn btn-success" onClick={openCreateModal}>
          <FaPlus className="me-1" />
          Add Role
        </button>
      </div>

      {/* Roles Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="ps-4">Role Name</th>
                <th className="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan="2" className="text-center py-4">
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id}>
                    <td className="ps-4 text-primary fw-semibold">{r.name}</td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => openEditModal(r)}
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteRole(r.id)}
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="dialog-overlay">
          <div className="dialog-box p-4 rounded shadow">
            <h5 className="mb-3">{editing ? "Edit Role" : "Create Role"}</h5>
            <input
              type="text"
              className="form-control mb-4"
              placeholder="Role Name"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              autoFocus
            />
            <div className="text-end">
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveRole}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoles;

import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "../../api/axios";
import { API_ENDPOINTS } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { safeAxios } from "../../api/axiosWrapper";
import { Link } from "react-router-dom";
import {
  FaList,
  FaThLarge,
  FaSortAlphaDown,
  FaSortAlphaUp,
} from "react-icons/fa";

function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [newRoles, setNewRoles] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  // sorting state
  const [sortField, setSortField] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // filter state
  const [filterBan, setFilterBan] = useState("all");
  const [filterRoles, setFilterRoles] = useState([]);

  const loadUsers = useCallback(async () => {
    const res = await safeAxios(() =>
      axios.get(`${API_ENDPOINTS.ADMIN_USERS}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    if (res?.success) setUsers(res.data);
  }, [token]);

  const loadRoles = useCallback(async () => {
    const res = await safeAxios(() =>
      axios.get(`${API_ENDPOINTS.ADMIN_ROLES}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    );
    if (res?.success) setAvailableRoles(res.data);
  }, [token]);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [loadRoles, loadUsers]);

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRoles(user.roles);
  };

  const assignRoles = async () => {
    const res = await safeAxios(() =>
      axios.put(
        `${API_ENDPOINTS.ADMIN_USERS}/${selectedUser.id}/roles`,
        { roles: newRoles },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );
    if (res?.success) {
      toast.success("Roles updated.");
      setSelectedUser(null);
      loadUsers();
    }
  };

  const toggleBan = async (user) => {
    const res = await safeAxios(() =>
      axios.put(
        `${API_ENDPOINTS.ADMIN_USERS}/${user.id}/ban`,
        { isBanned: !user.isBanned },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
    );
    if (res?.success) {
      toast.success("User ban status updated.");
      loadUsers();
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const displayedUsers = useMemo(() => {
    let arr = [...users];

    // filter banned
    if (filterBan !== "all") {
      arr = arr.filter((u) =>
        filterBan === "banned" ? u.isBanned : !u.isBanned
      );
    }

    // filter by roles
    if (filterRoles.length) {
      arr = arr.filter((u) => filterRoles.every((r) => u.roles.includes(r)));
    }

    // sorting
    if (sortField) {
      arr.sort((a, b) => {
        const aVal = a[sortField] || "";
        const bVal = b[sortField] || "";
        const cmp = aVal.toString().localeCompare(bVal.toString(), undefined, {
          sensitivity: "base",
        });
        return sortAsc ? cmp : -cmp;
      });
    }

    return arr;
  }, [users, filterBan, filterRoles, sortField, sortAsc]);

  return (
    <div className="admin-users-page">
      {/* Controls */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <h2 className="h4 m-0">👥 Manage Users</h2>
        <div className="d-flex gap-2">
          {/* Ban Filter */}
          <select
            className="form-select form-select-sm"
            value={filterBan}
            onChange={(e) => setFilterBan(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="banned">Banned Only</option>
          </select>

          {/* Role Filter */}
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Filter Roles
            </button>
            <ul
              className="dropdown-menu p-2"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {availableRoles.map((role) => (
                <li key={role.name}>
                  <label className="dropdown-item d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={filterRoles.includes(role.name)}
                      onChange={(e) => {
                        setFilterRoles((prev) =>
                          e.target.checked
                            ? [...prev, role.name]
                            : prev.filter((r) => r !== role.name)
                        );
                      }}
                    />
                    <span>{role.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* View toggles */}
          <div className="btn-group">
            <button
              className={`btn btn-sm btn-outline-secondary ${
                viewMode === "grid" ? "active" : ""
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid"
            >
              <FaThLarge />
            </button>
            <button
              className={`btn btn-sm btn-outline-secondary ${
                viewMode === "table" ? "active" : ""
              }`}
              onClick={() => setViewMode("table")}
              title="Table"
            >
              <FaList />
            </button>
          </div>
        </div>
      </div>

      {/* Render grid or table */}
      {viewMode === "grid" ? (
        <div className="row g-4">
          {displayedUsers.map((user) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={user.id}>
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title mb-1">{user.username}</h5>
                    <p className="mb-1 text-muted small">{user.email}</p>
                    <div className="mb-2">
                      {user.roles.map((r) => (
                        <span key={r} className="badge bg-primary me-1">
                          {r}
                        </span>
                      ))}
                    </div>
                    <span
                      className={`badge ${
                        user.isBanned ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {user.isBanned ? "Banned" : "Active"}
                    </span>
                  </div>
                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <Link
                      to={`/admin/users/${user.id}`}
                      className="btn btn-sm btn-outline-secondary w-100"
                    >
                      View
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-primary w-100"
                      onClick={() => openRoleModal(user)}
                    >
                      Assign Roles
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() => toggleBan(user)}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th
                  onClick={() => toggleSort("username")}
                  style={{ cursor: "pointer" }}
                >
                  Username{" "}
                  {sortField === "username" &&
                    (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
                </th>
                <th
                  onClick={() => toggleSort("email")}
                  style={{ cursor: "pointer" }}
                >
                  Email{" "}
                  {sortField === "email" &&
                    (sortAsc ? <FaSortAlphaDown /> : <FaSortAlphaUp />)}
                </th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.roles.map((r) => (
                      <span key={r} className="badge bg-primary me-1">
                        {r}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.isBanned ? "bg-danger" : "bg-success"
                      }`}
                    >
                      {u.isBanned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <Link
                        to={`/admin/users/${u.id}`}
                        className="btn btn-outline-secondary"
                      >
                        View
                      </Link>
                      <button
                        className="btn btn-outline-info"
                        onClick={() => openRoleModal(u)}
                      >
                        Assign Roles
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => toggleBan(u)}
                      >
                        {u.isBanned ? "Unban" : "Ban"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Role Assignment */}
      {selectedUser && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-1050">
          <div
            className="bg-white rounded shadow-lg overflow-hidden"
            style={{ width: "100%", maxWidth: "500px" }}
          >
            <div className="bg-primary text-white px-4 py-3">
              <h5 className="m-0">Assign Roles - {selectedUser.username}</h5>
            </div>
            <div className="p-4">
              {availableRoles.map((role) => (
                <div key={role.name} className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={role.name}
                    checked={newRoles.includes(role.name)}
                    onChange={(e) =>
                      setNewRoles((prev) =>
                        e.target.checked
                          ? [...prev, role.name]
                          : prev.filter((r) => r !== role.name)
                      )
                    }
                  />
                  <label className="form-check-label" htmlFor={role.name}>
                    {role.name}
                  </label>
                </div>
              ))}
              <div className="text-end mt-4">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setSelectedUser(null)}
                >
                  Cancel
                </button>
                <button className="btn btn-success" onClick={assignRoles}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;

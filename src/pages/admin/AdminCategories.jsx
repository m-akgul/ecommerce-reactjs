import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import CategoryFormModal from "../../components/admin/CategoryFormModal";
import { safeAxios } from "../../api/axiosWrapper";
import { useDialog } from "../../contexts/DialogContext";
import { FaPlus, FaTh, FaList, FaEdit, FaTrash } from "react-icons/fa";

function AdminCategories() {
  const { token } = useAuth();
  const { showDialog } = useDialog();
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN_CATEGORIES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data);
    } catch {
      console.error("Failed to load categories.");
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCategories();
    }
  }, [fetchCategories, token]);

  const handleCreate = async (data) => {
    const result = await safeAxios(
      () =>
        axios.post(API_ENDPOINTS.ADMIN_CATEGORIES, data, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Create failed."
    );
    if (result && result.success) {
      toast.success("Category created!");
      setShowModal(false);
      fetchCategories();
    } else {
      toast.error(result.Message || result);
      await showDialog({
        type: "alert",
        message: result.Message || result,
      });
    }
  };

  const handleUpdate = async (data) => {
    const result = await safeAxios(
      () =>
        axios.put(
          `${API_ENDPOINTS.ADMIN_CATEGORIES}/${editingCategory.id}`,
          data,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      "Update failed."
    );
    if (result && result.success) {
      toast.success("Category updated!");
      setShowModal(false);
      setEditingCategory(null);
      fetchCategories();
    } else {
      toast.error(result.Message || result);
      await showDialog({
        type: "alert",
        message: result.Message || result,
      });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this category?");
    if (!confirmed) return;

    const result = await safeAxios(
      () =>
        axios.delete(`${API_ENDPOINTS.ADMIN_CATEGORIES}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Delete failed."
    );
    if (result && result.success) {
      toast.success("Category deleted!");
      fetchCategories();
    } else {
      toast.error(result.Message || result);
      await showDialog({
        type: "alert",
        message: result.Message || result,
      });
    }
  };

  return (
    <div className="admin-categories-page mb-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 m-0">🗂️ Manage Categories</h2>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() =>
              setViewMode((mode) => (mode === "grid" ? "table" : "grid"))
            }
          >
            {viewMode === "grid" ? <FaTh /> : <FaList />} View
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-1" /> Add Category
          </button>
        </div>
      </div>

      {/* Conditional layout */}
      {viewMode === "grid" ? (
        <div className="row g-3">
          {categories.length === 0 ? (
            <div className="col">
              <div className="alert alert-info text-center">
                No categories found.
              </div>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                <div className="card h-100 shadow-sm">
                  <div className="card-body d-flex flex-column justify-content-between">
                    <h5 className="card-title">{cat.name}</h5>
                    <div className="mt-3 d-flex justify-content-between">
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => {
                          setEditingCategory(cat);
                          setShowModal(true);
                        }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(cat.id)}
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
                <th style={{ minWidth: "200px" }}>Category Name</th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-muted">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.name}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button
                          className="btn btn-outline-warning"
                          onClick={() => {
                            setEditingCategory(cat);
                            setShowModal(true);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(cat.id)}
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

      {/* <div className="row g-3">
        {categories.length === 0 ? (
          <div className="col">
            <div className="alert alert-info text-center">
              No categories found.
            </div>
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="card-title">{cat.name}</h5>
                  <div className="mt-3 d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => {
                        setEditingCategory(cat);
                        setShowModal(true);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(cat.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div> */}

      {/* Add/Edit Modal */}
      <CategoryFormModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        initialData={editingCategory || {}}
      />
    </div>
  );
}

export default AdminCategories;

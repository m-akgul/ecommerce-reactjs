import { useEffect, useState, useCallback } from "react";
import axios from "../../api/axios";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../../utils/constants";
import ProductFormModal from "../../components/admin/ProductFormModal";
import { useDialog } from "../../contexts/DialogContext";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxes,
  FaStore,
  FaChartBar,
  FaChartLine,
  FaTh,
  FaList,
} from "react-icons/fa";

export default function AdminProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const { token } = useAuth();
  const { showDialog } = useDialog();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("ASC");
  const [viewMode, setViewMode] = useState("table"); // or "grid"
  const [filterCategories, setFilterCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.ADMIN_PRODUCTS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { Page: 1, PageSize: 1000 },
      });
      setAllProducts(res.data.data.items);
    } catch {
      console.error("Failed to load products.");
    }
  }, [token]);

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
      fetchProducts();
      fetchCategories();
    }
  }, [fetchCategories, fetchProducts, token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // wait 300ms after typing ends

    return () => clearTimeout(timeout); // cleanup if typing continues
  }, [searchQuery]);

  const totalProducts = allProducts.length;
  const totalStock = allProducts.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalSold = allProducts.reduce((sum, p) => sum + p.soldQuantity, 0);

  const filtered = allProducts.filter((p) => {
    const matchesCategory =
      filterCategories.length === 0 ||
      filterCategories.includes(p.categoryName);

    const matchesSearch =
      debouncedSearch.trim() === "" ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.productCode.toLowerCase().includes(debouncedSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy],
      bVal = b[sortBy];
    if (aVal === undefined || bVal === undefined) return 0;
    const order = sortDirection === "ASC" ? 1 : -1;
    if (typeof aVal === "number") return (aVal - bVal) * order;
    return aVal.toString().localeCompare(bVal.toString()) * order;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col) => {
    setSortBy(col);
    setSortDirection((d) =>
      sortBy === col ? (d === "ASC" ? "DESC" : "ASC") : "ASC"
    );
  };

  const handleEdit = (p) => {
    setEditingProduct(p);
    setShowModal(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted!");
      fetchProducts();
    } catch {
      toast.error("Delete failed.");
      showDialog({ type: "alert", message: "Failed to delete product." });
    }
  };

  return (
    <div className="admin-products-page">
      {/* Dashboard Tiles */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <div className="d-flex align-items-center">
              <FaBoxes size={30} className="text-primary me-3" />
              <div>
                <div className="small text-muted">Total Products</div>
                <h4 className="mb-0">{totalProducts}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <div className="d-flex align-items-center">
              <FaStore size={30} className="text-success me-3" />
              <div>
                <div className="small text-muted">Total Stock</div>
                <h4 className="mb-0">{totalStock}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <div className="d-flex align-items-center">
              <FaChartLine size={30} className="text-success me-3" />
              <div>
                <div className="small text-muted">Total Sold</div>
                <h4 className="mb-0">{totalSold}</h4>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 p-3">
            <div className="d-flex align-items-center">
              <FaChartBar size={30} className="text-warning me-3" />
              <div>
                <div className="small text-muted">Categories</div>
                <h4 className="mb-0">{categories.length}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header + Add */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="h5 mb-0">🛍️ Manage Products</h2>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Add Product Button */}
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <FaPlus className="me-1" /> Add Product
          </button>

          {/* View Toggle */}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn btn-outline-secondary ${
                viewMode === "table" ? "active" : ""
              }`}
              onClick={() => setViewMode("table")}
              title="Table View"
            >
              <FaList />
            </button>
            <button
              className={`btn btn-outline-secondary ${
                viewMode === "grid" ? "active" : ""
              }`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <FaTh />
            </button>
          </div>

          {/* Category Filter Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-sm btn-outline-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              Filter Categories
            </button>
            <ul
              className="dropdown-menu p-2"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {categories.map((cat) => (
                <li key={cat.id}>
                  <label className="dropdown-item d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={filterCategories.includes(cat.name)}
                      onChange={(e) => {
                        setFilterCategories((prev) =>
                          e.target.checked
                            ? [...prev, cat.name]
                            : prev.filter((c) => c !== cat.name)
                        );
                      }}
                    />
                    <span>{cat.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          {/* Search Bar */}
          <input
            type="text"
            className="form-control form-control-sm"
            style={{ maxWidth: "200px" }}
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1); // reset pagination
            }}
          />
        </div>
      </div>

      {/* Modal */}
      <ProductFormModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingProduct(null);
        }}
        onSubmit={
          editingProduct
            ? (data) =>
                axios
                  .put(
                    `${API_ENDPOINTS.ADMIN_PRODUCTS}/${editingProduct.id}`,
                    data,
                    { headers: { Authorization: `Bearer ${token}` } }
                  )
                  .then(fetchProducts)
                  .finally(() => setShowModal(false))
            : (data) =>
                axios
                  .post(API_ENDPOINTS.ADMIN_PRODUCTS, data, {
                    headers: { Authorization: `Bearer ${token}` },
                  })
                  .then(fetchProducts)
                  .finally(() => setShowModal(false))
        }
        initialData={editingProduct || {}}
        categories={categories}
      />

      {/* Table */}
      {viewMode === "table" ? (
        <div className="table-responsive bg-white rounded shadow-sm p-3">
          <table className="table align-middle table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th
                  style={{
                    minWidth: "120px",
                    padding: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("productCode")}
                >
                  Code{" "}
                  {sortBy === "productCode" &&
                    (sortDirection === "ASC" ? "🔼" : "🔽")}
                </th>
                <th
                  style={{
                    minWidth: "120px",
                    padding: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("name")}
                >
                  Name{" "}
                  {sortBy === "name" && (sortDirection === "ASC" ? "🔼" : "🔽")}
                </th>
                <th style={{ minWidth: "120px", padding: "0.75rem" }}>Image</th>
                <th
                  style={{
                    minWidth: "120px",
                    padding: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("price")}
                >
                  ₺ Price{" "}
                  {sortBy === "price" &&
                    (sortDirection === "ASC" ? "🔼" : "🔽")}
                </th>
                <th
                  style={{
                    minWidth: "120px",
                    padding: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("stockQuantity")}
                >
                  Stock{" "}
                  {sortBy === "stockQuantity" &&
                    (sortDirection === "ASC" ? "🔼" : "🔽")}
                </th>
                <th
                  style={{
                    minWidth: "120px",
                    padding: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("soldQuantity")}
                >
                  Sold{" "}
                  {sortBy === "soldQuantity" &&
                    (sortDirection === "ASC" ? "🔼" : "🔽")}
                </th>
                <th
                  style={{
                    minWidth: "120px",
                    padding: "0.75rem",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSort("categoryName")}
                >
                  Category{" "}
                  {sortBy === "categoryName" &&
                    (sortDirection === "ASC" ? "🔼" : "🔽")}
                </th>
                <th style={{ minWidth: "120px", padding: "0.75rem" }}>
                  Description
                </th>
                <th style={{ minWidth: "120px", padding: "0.75rem" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id}>
                  <td>{p.productCode}</td>
                  <td>{p.name}</td>
                  <td>
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                  </td>
                  <td>₺{p.price}</td>
                  <td>{p.stockQuantity}</td>
                  <td>{p.soldQuantity}</td>
                  <td>{p.categoryName}</td>
                  <td className="text-truncate" style={{ maxWidth: "250px" }}>
                    {p.description}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => handleEdit(p)}
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(p.id)}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="row g-3">
          {paginated.map((p) => (
            <div key={p.id} className="col-md-6 col-lg-4 col-xl-3">
              <div className="card shadow-sm h-100">
                <div className="image-wrapper rounded-4 bg-light shadow-sm overflow-hidden">
                  <img
                    src={p.imageUrl}
                    className="w-100 h-100 card-img-top object-fit-contain img-hover-effect"
                    alt={p.name}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text text-muted mb-1">{p.categoryName}</p>
                  <p className="card-text fw-semibold mb-2">₺{p.price}</p>
                  <div className="mt-auto d-flex justify-content-between gap-2">
                    <button
                      className="btn btn-sm btn-outline-warning w-100"
                      onClick={() => handleEdit(p)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger w-100"
                      onClick={() => handleDelete(p.id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(+e.target.value);
            setPage(1);
          }}
          className="form-select form-select-sm"
          style={{ width: "auto" }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <div>
          <button
            className="btn btn-outline-secondary btn-sm me-1"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Prev
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm ms-1"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

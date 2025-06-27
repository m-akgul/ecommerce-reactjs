import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "../api/axios";
import { API_ENDPOINTS } from "../utils/constants";
import ProductCard from "../components/common/ProductCard";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [filters, setFilters] = useState({
    searchTerm: "",
    categoryId: "",
    sortBy: "",
    sortDirection: "",
    minPrice: "",
    maxPrice: "",
    page: 1,
    pageSize: 10,
  });

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1, // reset page unless updating page
    }));
  }, []);

  useEffect(() => {
    const query = {};
    for (const [key, value] of Object.entries(filters)) {
      if (
        value !== "" &&
        !(key === "page" && value === 1) &&
        !(key === "pageSize" && value === 10) &&
        key !== "totalPages"
      ) {
        query[key] = value;
      }
    }
    setSearchParams(query);
  }, [filters, setSearchParams]);

  useEffect(() => {
    const params = Object.fromEntries([...searchParams]);
    setFilters((prev) => ({
      ...prev,
      searchTerm: params.searchTerm || "",
      categoryId: params.categoryId || "",
      sortBy: params.sortBy || "",
      sortDirection: params.sortDirection || "",
      minPrice: params.minPrice || "",
      maxPrice: params.maxPrice || "",
      page: Number(params.page) || 1,
      pageSize: Number(params.pageSize) || 10,
    }));
    setSearchInput(params.searchTerm || "");
    setMinPriceInput(params.minPrice || "");
    setMaxPriceInput(params.maxPrice || "");
  }, [searchParams]);

  useEffect(() => {
    const query = Object.fromEntries([...searchParams]);

    axios
      .get(API_ENDPOINTS.PRODUCTS, { params: query })
      .then((res) => {
        const { items, page, pageSize, totalPages } = res.data.data;
        setProducts(items);
        setFilters((prev) => ({
          ...prev,
          page,
          pageSize,
          totalPages,
        }));
      })
      .catch(() => console.error("Failed to load products"));
    axios
      .get(API_ENDPOINTS.CATEGORIES)
      .then((res) => setCategories(res.data.data))
      .catch(() => console.error("Failed to load categories"));
  }, [searchParams]);

  useEffect(() => {
    const delay = setTimeout(() => {
      updateFilter("searchTerm", searchInput);
    }, 300);

    return () => clearTimeout(delay);
  }, [searchInput, updateFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (minPriceInput !== filters.minPrice) {
        updateFilter("minPrice", minPriceInput);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [filters.minPrice, minPriceInput, updateFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (maxPriceInput !== filters.maxPrice) {
        updateFilter("maxPrice", maxPriceInput);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [filters.maxPrice, maxPriceInput, updateFilter]);

  const activeFilterCount = [
    filters.searchTerm,
    filters.categoryId,
    filters.sortBy,
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="container my-5">
      <div className="row">
        {/* FILTER SIDEBAR */}
        <div className="col-12 col-lg-3 mb-4">
          <div className="accordion" id="filterAccordion">
            <div className="accordion-item border rounded-3 shadow-sm">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed fw-semibold"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseFilters"
                  aria-expanded="false"
                  aria-controls="collapseFilters"
                >
                  <i className="fas fa-sliders me-2"></i>
                  Filter Products
                  {activeFilterCount > 0 && (
                    <span className="badge bg-primary ms-2">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </h2>

              {/* FILTER BADGES */}
              {activeFilterCount > 0 && (
                <div className="px-3 pt-3 pb-2 bg-light border-top d-flex flex-wrap gap-2">
                  {filters.searchTerm && (
                    <span className="badge bg-secondary">
                      Search: {filters.searchTerm}
                      <button
                        type="button"
                        className="btn-close btn-close-white btn-sm ms-2"
                        aria-label="Clear"
                        onClick={() => updateFilter("searchTerm", "")}
                      />
                    </span>
                  )}
                  {filters.categoryId && (
                    <span className="badge bg-secondary">
                      Category:{" "}
                      {categories.find((c) => c.id === filters.categoryId)
                        ?.name || filters.categoryId}
                      <button
                        type="button"
                        className="btn-close btn-close-white btn-sm ms-2"
                        aria-label="Clear"
                        onClick={() => updateFilter("categoryId", "")}
                      />
                    </span>
                  )}
                  {filters.sortBy && (
                    <span className="badge bg-secondary">
                      Sort: {filters.sortBy}
                      <button
                        type="button"
                        className="btn-close btn-close-white btn-sm ms-2"
                        aria-label="Clear"
                        onClick={() => updateFilter("sortBy", "")}
                      />
                    </span>
                  )}
                  {filters.minPrice && (
                    <span className="badge bg-secondary">
                      Min: ₺{filters.minPrice}
                      <button
                        type="button"
                        className="btn-close btn-close-white btn-sm ms-2"
                        aria-label="Clear"
                        onClick={() => updateFilter("minPrice", "")}
                      />
                    </span>
                  )}
                  {filters.maxPrice && (
                    <span className="badge bg-secondary">
                      Max: ₺{filters.maxPrice}
                      <button
                        type="button"
                        className="btn-close btn-close-white btn-sm ms-2"
                        aria-label="Clear"
                        onClick={() => updateFilter("maxPrice", "")}
                      />
                    </span>
                  )}
                </div>
              )}

              {/* COLLAPSIBLE FILTER FORM */}
              <div
                id="collapseFilters"
                className="accordion-collapse collapse"
                data-bs-parent="#filterAccordion"
              >
                <div className="accordion-body">
                  <div className="mb-3">
                    <label className="form-label">Search</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name"
                      value={searchInput || ""}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={filters.categoryId}
                      onChange={(e) =>
                        updateFilter("categoryId", e.target.value)
                      }
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sort By</label>
                    <select
                      className="form-select"
                      value={filters.sortBy}
                      onChange={(e) => updateFilter("sortBy", e.target.value)}
                    >
                      <option value="">Sort</option>
                      <option value="name">Name</option>
                      <option value="price">Price</option>
                      <option value="sold">Sold</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Direction</label>
                    <select
                      className="form-select"
                      value={filters.sortDirection}
                      onChange={(e) =>
                        updateFilter("sortDirection", e.target.value)
                      }
                    >
                      <option value="">Direction</option>
                      <option value="ASC">ASC</option>
                      <option value="DESC">DESC</option>
                    </select>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <label className="form-label">Min ₺</label>
                      <input
                        type="number"
                        className="form-control"
                        value={minPriceInput || ""}
                        onChange={(e) => setMinPriceInput(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Max ₺</label>
                      <input
                        type="number"
                        className="form-control"
                        value={maxPriceInput || ""}
                        onChange={(e) => setMaxPriceInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-secondary w-100 mt-3"
                    onClick={() => {
                      setFilters({
                        searchTerm: "",
                        categoryId: "",
                        sortBy: "",
                        sortDirection: "",
                        minPrice: "",
                        maxPrice: "",
                      });
                      setSearchParams({});
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT LISTING */}
        <div className="col-12 col-lg-9">
          <div className="d-flex justify-content-end align-items-center mb-3">
            <label className="me-2 mb-0 small fw-medium">Items per page:</label>
            <select
              className="form-select form-select-sm w-auto"
              value={filters.pageSize}
              onChange={(e) => updateFilter("pageSize", Number(e.target.value))}
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="row g-4">
            {products.length === 0 ? (
              <p className="text-center">No products found.</p>
            ) : (
              products.map((p) => (
                <div key={p.id} className="col-12 col-sm-6 col-md-4">
                  <ProductCard product={p} />
                </div>
              ))
            )}
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-center align-items-center mt-5 gap-3">
            <button
              className="btn btn-outline-primary"
              disabled={filters.page <= 1}
              onClick={() => updateFilter("page", filters.page - 1)}
            >
              ⬅ Prev
            </button>
            <span className="fw-semibold">
              Page {filters.page} of {filters.totalPages}
            </span>
            <button
              className="btn btn-outline-primary"
              disabled={filters.page >= filters.totalPages}
              onClick={() => updateFilter("page", filters.page + 1)}
            >
              Next ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { API_ENDPOINTS } from "../utils/constants";
import { toast } from "react-toastify";

function Categories() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(API_ENDPOINTS.CATEGORIES)
      .then((res) => setCategories(res.data.data))
      .catch(() => toast.error("Failed to load categories."));
  }, []);

  return (
    <div className="container my-5">
      <h2 className="mb-4">Browse Categories</h2>

      <div className="row g-4">
        {categories.map((cat) => (
          <div key={cat.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
            <div
              className="card text-center border-0 shadow-sm h-100 category-tile"
              role="button"
              onClick={() => navigate(`/products?categoryId=${cat.id}`)}
              style={{ transition: "transform 0.2s" }}
            >
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                <div
                  className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "60px", height: "60px", fontSize: "1.75rem" }}
                >
                  📦
                </div>
                <h6 className="fw-semibold mb-0">{cat.name}</h6>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Categories;

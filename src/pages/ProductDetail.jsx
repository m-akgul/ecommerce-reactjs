import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { API_ENDPOINTS } from "../utils/constants";
import { useCart } from "../contexts/CartContext";
import { useFavorites } from "../contexts/FavoritesContext";

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_ENDPOINTS.PRODUCTS}/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => console.error("Failed to load product"));
  }, [id]);

  if (!product) return <p>Loading product...</p>;

  return (
    <div className="container my-5">
      {/* MAIN PRODUCT BLOCK */}
      <div className="row g-5 align-items-start">
        {/* IMAGE COLUMN */}
        <div className="col-12 col-md-6">
          <div
            className="rounded shadow-sm p-4 bg-light border"
            style={{
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="img-fluid"
              style={{ maxHeight: "500px", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* INFO COLUMN */}
        <div className="col-12 col-md-6">
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <p className="fs-4 text-primary fw-semibold mb-2">₺{product.price}</p>

          <p className="mb-2">
            <span className="fw-medium">Stock:</span>{" "}
            {product.stockQuantity > 0 ? (
              <span className="text-success fw-semibold">In Stock</span>
            ) : (
              <span className="text-danger fw-semibold">Out of Stock</span>
            )}
          </p>

          <div className="d-flex gap-3 mt-4 flex-wrap">
            {product.stockQuantity > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => addToCart(product.id, 1)}
              >
                <i className="fas fa-cart-plus me-2"></i>
                Add to Cart
              </button>
            )}

            <button
              className={`btn ${
                isFavorite(product.id) ? "btn-danger" : "btn-outline-danger"
              }`}
              onClick={() => toggleFavorite(product.id)}
            >
              <i className="fas fa-heart me-1"></i>
              {isFavorite(product.id) ? "Remove Favorite" : "Add to Favorites"}
            </button>
          </div>
        </div>
      </div>

      {/* DESCRIPTION SECTION */}
      <div className="rounded shadow-sm mt-5">
        <h4 className="fw-semibold mb-3">Product Description</h4>
        <p className="text-muted" style={{ maxWidth: "800px" }}>
          {product.description}
        </p>
      </div>
    </div>
  );
}

import { useFavorites } from "../../contexts/FavoritesContext";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="card h-100 shadow-sm border-0">
      <div
        className="position-relative overflow-hidden"
        style={{ height: "200px" }}
      >
        <div className="image-wrapper rounded-4 bg-light shadow-sm overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-100 h-100 object-fit-contain card-img-top img-hover-effect"
          />
          <button
            onClick={() => toggleFavorite(product.id)}
            className="btn btn-light btn-sm position-absolute top-0 end-0 m-2 rounded-circle shadow-sm"
            aria-label="Toggle Favorite"
          >
            {isFavorite(product.id) ? "💖" : "🤍"}
          </button>
        </div>
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h6 className="card-title text-truncate">{product.name}</h6>
        <div className="mt-auto d-flex justify-content-between align-items-center">
          <span className="badge bg-primary fs-6">₺{product.price}</span>
          <Link
            to={`/products/${product.id}`}
            className="btn btn-sm btn-outline-primary"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

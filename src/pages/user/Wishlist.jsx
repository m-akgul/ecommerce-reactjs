import { useFavorites } from "../../contexts/FavoritesContext";
import ProductCard from "../../components/common/ProductCard";

function Wishlist() {
  const { favorites } = useFavorites();

  return (
    <div className="container my-5">
      <h2 className="mb-4">My Wishlist</h2>

      {favorites.length === 0 ? (
        <div className="text-center text-muted py-5">
          <div style={{ fontSize: "3rem" }}>💔</div>
          <p className="mt-3">
            You haven't added any products to your wishlist yet.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {favorites.map((product) => (
            <div key={product.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;

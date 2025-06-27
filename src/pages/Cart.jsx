import { useCart } from "../contexts/CartContext";
import { Link } from "react-router-dom";
import { useDialog } from "../contexts/DialogContext";
import { toast } from "react-toastify";
import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function Cart() {
  const { cart, reloadCart, removeFromCart, addToCart } = useCart();
  const { showDialog } = useDialog();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    reloadCart(); // Reload cart on mount
  }, [reloadCart]);

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty <= 0) return;

    try {
      await addToCart(productId, newQty);
    } catch {
      toast.error("Failed to update quantity.");
      showDialog({
        type: "alert",
        message: "Failed to update quantity.",
      });
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      showDialog({
        type: "alert",
        message: "You need to be logged in to proceed with checkout.",
      });
    } else {
      window.location.href = "/checkout";
    }
  };

  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="container my-5">
      <h2 className="mb-4">My Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className="row g-4">
            {cart.map((item) => (
              <div key={item.id} className="col-12">
                <div className="card shadow-sm p-3 d-flex flex-column flex-md-row align-items-center">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="img-fluid rounded"
                    style={{
                      width: "80px",
                      height: "80px",
                      objectFit: "cover",
                    }}
                  />

                  <div className="ms-md-4 mt-3 mt-md-0 flex-grow-1 w-100">
                    <h5 className="mb-1">{item.productName}</h5>
                    <p className="mb-1 text-muted small">
                      ₺{item.productPrice}
                    </p>

                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex flex-column">
                        <label className="form-label mb-1 small">
                          Quantity
                        </label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={item.quantity}
                          min={1}
                          style={{ width: "100px" }}
                          onChange={(e) =>
                            handleQuantityChange(
                              item.productId,
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="form-label mb-1 small">Total</label>
                        <p className="fw-semibold mb-0">₺{item.totalPrice}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    className="btn btn-outline-danger btn-sm ms-md-4 mt-3 mt-md-0"
                    title="Remove from cart"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 d-flex justify-content-between align-items-center flex-wrap">
            <h4 className="fw-bold mb-3 mb-md-0">Total: ₺{total.toFixed(2)}</h4>
            <button className="btn btn-primary btn-lg" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;

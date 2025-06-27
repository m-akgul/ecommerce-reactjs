import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { safeAxios } from "../api/axiosWrapper";
import { useDialog } from "../contexts/DialogContext";

function Checkout() {
  const { cart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const [newAddress, setNewAddress] = useState({
    title: "",
    fullAddress: "",
    city: "",
    postalCode: "",
  });

  const [showNewAddress, setShowNewAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("Mock");
  const [couponCode, setCouponCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  const total = cart.reduce((sum, i) => sum + i.totalPrice, 0);
  const finalTotal = total - discountAmount;

  useEffect(() => {
    if (!token) return;
    axios
      .get(API_ENDPOINTS.ADDRESSES, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAddresses(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedAddressId(res.data.data[0].id);
        }
      });
  }, [token]);

  const handleClick = async (dialogType, message) => {
    return await showDialog({
      type: dialogType,
      message: message,
    });
  };

  const handleAddAddress = async () => {
    const result = await safeAxios(
      () =>
        axios.post(API_ENDPOINTS.ADDRESSES, newAddress, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Failed to add address."
    );

    if (result && result.success) {
      setAddresses([...addresses, result.data]);
      setSelectedAddressId(result.data.id);
      setNewAddress({ title: "", fullAddress: "", city: "", postalCode: "" });
      setShowNewAddress(false);
      toast.success("Address added");
    } else {
      showDialog({ type: "alert", message: result.Message || result });
    }
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Checkout</h2>

      <div className="row g-5">
        {/* LEFT SIDE */}
        <div className="col-12 col-lg-7">
          {/* ADDRESS SELECTION */}
          <div className="mb-4">
            <h5 className="mb-3">Shipping Address</h5>
            <div className="bg-white p-3 rounded border shadow-sm">
              {addresses.map((addr) => (
                <div key={addr.id} className="form-check mb-2">
                  <input
                    type="radio"
                    className="form-check-input"
                    name="address"
                    id={`address-${addr.id}`}
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`address-${addr.id}`}
                  >
                    <strong>{addr.title}</strong>: {addr.fullAddress} /{" "}
                    {addr.city} {addr.postalCode}
                  </label>
                </div>
              ))}

              {!showNewAddress ? (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="btn btn-outline-primary btn-sm mt-2"
                >
                  ➕ Add New Address
                </button>
              ) : (
                <div className="mt-3">
                  {/* New Address Form */}
                  <input
                    className="form-control mb-2"
                    placeholder="Title"
                    value={newAddress.title}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, title: e.target.value })
                    }
                  />
                  <textarea
                    className="form-control mb-2"
                    placeholder="Full Address"
                    value={newAddress.fullAddress}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        fullAddress: e.target.value,
                      })
                    }
                  />
                  <input
                    className="form-control mb-2"
                    placeholder="City"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                  />
                  <input
                    className="form-control mb-3"
                    placeholder="Postal Code"
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        postalCode: e.target.value,
                      })
                    }
                  />
                  <div className="d-flex gap-2">
                    <button
                      onClick={handleAddAddress}
                      className="btn btn-success btn-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowNewAddress(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <h5 className="mb-3">Payment</h5>
            <div className="bg-white p-3 rounded border shadow-sm">
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="radio"
                  id="mock"
                  name="payment"
                  checked={paymentMethod === "Mock"}
                  onChange={() => setPaymentMethod("Mock")}
                />
                <label className="form-check-label" htmlFor="mock">
                  Mock Payment
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  id="paypal"
                  name="payment"
                  checked={paymentMethod === "PayPal"}
                  onChange={() => setPaymentMethod("PayPal")}
                />
                <label className="form-check-label" htmlFor="paypal">
                  PayPal
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="col-12 col-lg-5">
          <div className="bg-white p-4 rounded border shadow-sm">
            <h5 className="mb-3">Cart Summary</h5>

            <ul className="list-group mb-3">
              {cart.map((item) => (
                <li
                  key={item.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <span>
                    {item.productName} x {item.quantity}
                  </span>
                  <span>₺{item.totalPrice}</span>
                </li>
              ))}
            </ul>

            <p className="mb-2">
              <strong>Total:</strong> ₺{total}
            </p>

            {/* Coupon Input */}
            <input
              className="form-control form-control-sm mb-2"
              placeholder="Coupon Code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button
              className="btn btn-outline-success btn-sm w-100 mb-3"
              onClick={async () => {
                const result = await safeAxios(
                  () =>
                    axios.post(
                      `${API_ENDPOINTS.CART}/coupon`,
                      { couponCode },
                      { headers: { Authorization: `Bearer ${token}` } }
                    ),
                  "Failed to redeem coupon."
                );
                if (result && result.success) {
                  setDiscountAmount(result.data.discountAmount);
                  toast.success("Coupon applied");
                } else {
                  setDiscountAmount(0);
                  showDialog({
                    type: "alert",
                    message: result.Message || result,
                  });
                }
              }}
            >
              Apply Coupon
            </button>

            <p className="mb-2">
              <strong>Discount:</strong> ₺{discountAmount}
            </p>
            <p className="mb-4">
              <strong>Final:</strong> ₺{finalTotal}
            </p>

            <button
              className="btn btn-primary w-100"
              onClick={async () => {
                if (!selectedAddressId) {
                  toast.error("Please select an address.");
                  showDialog({
                    type: "alert",
                    message: "Please select an address before proceeding.",
                  });
                  return;
                }

                let couponStillValid = true;
                if (couponCode.trim() !== "") {
                  const result = await safeAxios(
                    () =>
                      axios.post(
                        `${API_ENDPOINTS.CART}/coupon`,
                        { couponCode },
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      ),
                    "Coupon validation failed."
                  );

                  if (result && result.success) {
                    setDiscountAmount(result.data.discountAmount);
                    toast.success("Coupon re-applied");
                  } else {
                    const confirm = await handleClick(
                      "confirm",
                      `${
                        result.Message || result
                      } Do you want to continue without it?`
                    );
                    if (!confirm) return;
                    couponStillValid = false;
                    setDiscountAmount(0);
                  }
                }

                const selected = addresses.find(
                  (a) => a.id === selectedAddressId
                );
                const payload = {
                  address: selected.fullAddress,
                  paymentMethod,
                  couponCode: couponStillValid ? couponCode.trim() : null,
                };

                const order = await safeAxios(
                  () =>
                    axios.post(`${API_ENDPOINTS.ORDERS}/checkout`, payload, {
                      headers: { Authorization: `Bearer ${token}` },
                    }),
                  "Checkout failed."
                );

                if (order && order.success) {
                  toast.success("Order placed");
                  navigate("/order-success");
                } else {
                  showDialog({
                    type: "alert",
                    message: order.Message || "Failed to place order.",
                  });
                }
              }}
            >
              Confirm Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div className="container my-5 d-flex justify-content-center">
      <div
        className="text-center p-5 bg-white shadow rounded-4"
        style={{ maxWidth: "600px", width: "100%" }}
      >
        <div className="mb-4">
          <div className="display-1 text-success">🎉</div>
          <h2 className="fw-bold text-success">Order Placed Successfully!</h2>
        </div>
        <p className="lead">
          Thank you for your purchase. Your order has been received and is being
          processed.
        </p>
        <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-outline-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;

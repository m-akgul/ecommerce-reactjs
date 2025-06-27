import { useEffect, useState } from "react";

function CouponFormModal({ show, onClose, onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    code: "",
    discountAmount: 0,
    expiryDate: "",
    isActive: false,
    maxUsageCount: "",
    maxUsagePerUser: "",
  });

  useEffect(() => {
    if (show) {
      setForm({
        code: initialData?.code || "",
        discountAmount: initialData?.discountAmount || 0,
        expiryDate: initialData?.expiryDate || "",
        isActive: initialData?.isActive || false,
        maxUsageCount: initialData?.maxUsageCount ?? "",
        maxUsagePerUser: initialData?.maxUsagePerUser ?? "",
      });
    }
  }, [initialData, show]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "#00000080" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                {initialData?.id ? "Edit Coupon" : "Create Coupon"}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Code</label>
                <input
                  className="form-control"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  required
                  placeholder="e.g. WELCOME10"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Discount Amount (₺)</label>
                <input
                  type="number"
                  className="form-control"
                  name="discountAmount"
                  value={form.discountAmount}
                  onChange={handleChange}
                  min={1}
                  max={500}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Expiry Date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Max Usage Count</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxUsageCount"
                    value={form.maxUsageCount}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Max Usage Per User</label>
                  <input
                    type="number"
                    className="form-control"
                    name="maxUsagePerUser"
                    value={form.maxUsagePerUser}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {initialData && initialData.isActive !== undefined && (
                <div className="form-check mb-2">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive || false}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Active
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer bg-light">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {initialData?.id ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CouponFormModal;

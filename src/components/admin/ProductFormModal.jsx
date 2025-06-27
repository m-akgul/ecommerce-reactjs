import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object().shape({
  productCode: yup.string().required("Product code is required"),
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
  price: yup
    .number()
    .min(0, "Price must be at least 0")
    .required("Price is required"),
  stockQuantity: yup
    .number()
    .min(0, "Stock must be at least 0")
    .required("Stock is required"),
  imageUrl: yup.string().url("Invalid URL").required("Image URL is required"),
  categoryId: yup.string().required("Category is required"),
});

function ProductFormModal({
  show,
  onClose,
  onSubmit,
  initialData = {},
  categories,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset, show]);

  if (!show) return null;

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      style={{ background: "#00000080" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">
                {initialData?.id ? "Edit Product" : "Add Product"}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Product Code</label>
                <input
                  className="form-control"
                  placeholder="e.g. SKU123"
                  {...register("productCode")}
                />
                {errors.productCode && (
                  <div className="text-danger">
                    {errors.productCode.message}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  className="form-control"
                  placeholder="Product name"
                  {...register("name")}
                />
                {errors.name && (
                  <div className="text-danger">{errors.name.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  placeholder="Describe the product"
                  rows={3}
                  {...register("description")}
                  style={{ resize: "none" }}
                />
                {errors.description && (
                  <div className="text-danger">
                    {errors.description.message}
                  </div>
                )}
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Price (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-control"
                    {...register("price")}
                  />
                  {errors.price && (
                    <div className="text-danger">{errors.price.message}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    className="form-control"
                    {...register("stockQuantity")}
                  />
                  {errors.stockQuantity && (
                    <div className="text-danger">
                      {errors.stockQuantity.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/image.jpg"
                  {...register("imageUrl")}
                />
                {errors.imageUrl && (
                  <div className="text-danger">{errors.imageUrl.message}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Category</label>
                <select className="form-select" {...register("categoryId")}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <div className="text-danger">{errors.categoryId.message}</div>
                )}
              </div>
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

export default ProductFormModal;

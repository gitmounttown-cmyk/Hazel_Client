import { useEffect, useState } from "react";

import {
  createTrendingProduct,
  updateTrendingProduct,
} from "../../../Services/AdminTrendingProductsService";

import axiosInstance from "../../../api/axiosInstance";

import "./AdminTrendingProductsForm.css";

const initialForm = {
  title: "Trending Products",
  subtitle: "",
  isActive: true,
};

const AdminTrendingProductsForm = ({
  editingTrendingProduct,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState(initialForm);

  const [items, setItems] = useState([]);

  const [productOptions, setProductOptions] = useState([]);

  const [loading, setLoading] = useState(false);

  const [productsLoading, setProductsLoading] = useState(false);

  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editingTrendingProduct) {
      setForm({
        title: editingTrendingProduct.title || "Trending Products",

        subtitle: editingTrendingProduct.subtitle || "",

        isActive: editingTrendingProduct.isActive !== false,
      });

      setItems(
        (editingTrendingProduct.products || []).map((item, index) => ({
          product: item.product?._id || item.product || "",

          displayOrder: item.displayOrder || index + 1,

          isFeatured: item.isFeatured === true,

          image: null,

          preview: null,

          existingImage: item.image || null,
        })),
      );
    } else {
      setForm(initialForm);

      setItems([]);

      setImageErrors({});
    }
  }, [editingTrendingProduct]);

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);

      const response = await axiosInstance.get("/products/all", {
        params: {
          page: 1,
          limit: 1000,
        },
      });

      const products = response.data?.data || [];

      setProductOptions(
        products.map((item) => ({
          label:
            item.productName ||
            item.name ||
            item.productCode ||
            "Unnamed Product",

          value: item._id,
        })),
      );
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);

      alert(error.response?.data?.message || "Failed to fetch products");
    } finally {
      setProductsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddProduct = () => {
    if (items.length >= 50) {
      alert("Maximum 50 products can be added");

      return;
    }

    setItems((prev) => [
      ...prev,
      {
        product: "",
        displayOrder: prev.length + 1,
        isFeatured: false,
        image: null,
        preview: null,
        existingImage: null,
      },
    ]);
  };

  const handleRemoveProduct = (index) => {
    setItems((prev) =>
      prev
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          displayOrder: itemIndex + 1,
        })),
    );

    setImageErrors((prev) => {
      const updated = {};

      Object.keys(prev).forEach((key) => {
        const oldIndex = Number(key);

        if (oldIndex < index) {
          updated[oldIndex] = prev[oldIndex];
        }

        if (oldIndex > index) {
          updated[oldIndex - 1] = prev[oldIndex];
        }
      });

      return updated;
    });
  };

  const handleProductChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              product: value,
            }
          : item,
      ),
    );
  };

  const handleDisplayOrderChange = (index, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              displayOrder: value,
            }
          : item,
      ),
    );
  };

  const handleFeaturedChange = (index, checked) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              isFeatured: checked,
            }
          : item,
      ),
    );
  };

  const handleImageChange = (index, e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageErrors((prev) => ({
        ...prev,
        [index]: "Please select a valid image file",
      }));

      e.target.value = "";

      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setImageErrors((prev) => ({
        ...prev,
        [index]: "Image size must be less than 2 MB",
      }));

      e.target.value = "";

      return;
    }

    setImageErrors((prev) => {
      const updated = {
        ...prev,
      };

      delete updated[index];

      return updated;
    });

    const preview = URL.createObjectURL(file);

    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              image: file,
              preview,
            }
          : item,
      ),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Please add at least one product");

      return;
    }

    const selectedProducts = new Set();

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!item.product) {
        alert(`Please select Product ${index + 1}`);

        return;
      }

      if (selectedProducts.has(item.product)) {
        alert(`Product ${index + 1} is already selected`);

        return;
      }

      selectedProducts.add(item.product);

      if (!item.displayOrder || Number(item.displayOrder) < 1) {
        alert(`Please enter a valid display order for Product ${index + 1}`);

        return;
      }

      if (!editingTrendingProduct && !item.image) {
        alert(`Please upload an image for Product ${index + 1}`);

        return;
      }

      if (editingTrendingProduct && !item.image && !item.existingImage) {
        alert(`Please upload an image for Product ${index + 1}`);

        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title.trim() || "Trending Products");

      formData.append("subtitle", form.subtitle.trim());

      formData.append("isActive", form.isActive ? "true" : "false");

      const products = items.map((item, index) => ({
        product: item.product,

        displayOrder: Number(item.displayOrder) || index + 1,

        isFeatured: item.isFeatured === true,
      }));

      formData.append("products", JSON.stringify(products));

      items.forEach((item) => {
        if (item.image) {
          formData.append("productImages", item.image);
        }
      });

      if (editingTrendingProduct?._id) {
        await updateTrendingProduct(editingTrendingProduct._id, formData);

        alert("Trending products updated successfully");
      } else {
        await createTrendingProduct(formData);

        alert("Trending products created successfully");
      }

      setForm(initialForm);
      setItems([]);

      onSuccess();
    } catch (error) {
      console.error("SAVE TRENDING PRODUCTS ERROR:", error);

      alert(
        error.response?.data?.message || "Failed to save trending products",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-trending-form-overlay">
      <div className="admin-trending-form-card">
        <div className="admin-trending-form-header">
          <h3>
            {editingTrendingProduct
              ? "Edit Trending Products"
              : "Add Trending Products"}
          </h3>

          <button
            type="button"
            className="admin-trending-form-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form className="admin-trending-form-body" onSubmit={handleSubmit}>
          <div className="admin-trending-form-group">
            <label>Title</label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter title"
            />
          </div>

          <div className="admin-trending-form-group">
            <label>Subtitle</label>

            <input
              name="subtitle"
              value={form.subtitle}
              onChange={handleChange}
              placeholder="Enter subtitle"
            />
          </div>

          <div className="admin-trending-form-group">
            <label>Status</label>

            <select
              name="isActive"
              value={form.isActive ? "true" : "false"}
              onChange={handleChange}
            >
              <option value="true">Active</option>

              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="admin-trending-products-header">
            <div>
              <h4>Products</h4>

              <span>{items.length}/50</span>
            </div>

            <button
              type="button"
              className="admin-trending-add-product-btn"
              onClick={handleAddProduct}
              disabled={items.length >= 50 || loading || productsLoading}
            >
              + Add Product
            </button>
          </div>

          {items.length === 0 && (
            <div className="admin-trending-no-products">No products added</div>
          )}

          {items.map((item, index) => (
            <div className="admin-trending-product-form-card" key={index}>
              <div className="admin-trending-product-form-header">
                <h4>Product {index + 1}</h4>

                <button
                  type="button"
                  className="admin-trending-remove-btn"
                  onClick={() => handleRemoveProduct(index)}
                  disabled={loading}
                >
                  Remove
                </button>
              </div>

              <div className="admin-trending-form-row">
                <div className="admin-trending-form-group">
                  <label>Product *</label>

                  <select
                    value={item.product}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    disabled={loading || productsLoading}
                  >
                    <option value="">Select Product</option>

                    {productOptions.map((product) => (
                      <option key={product.value} value={product.value}>
                        {product.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-trending-form-group">
                  <label>Display Order *</label>

                  <input
                    type="number"
                    min="1"
                    value={item.displayOrder}
                    onChange={(e) =>
                      handleDisplayOrderChange(index, e.target.value)
                    }
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="admin-trending-featured">
                <label>
                  <input
                    type="checkbox"
                    checked={item.isFeatured}
                    onChange={(e) =>
                      handleFeaturedChange(index, e.target.checked)
                    }
                    disabled={loading}
                  />

                  <span>Featured Product</span>
                </label>
              </div>

              <div className="admin-trending-image-group">
                <label>Product Image *</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(index, e)}
                  disabled={loading}
                />

                {imageErrors[index] && (
                  <span className="admin-trending-image-error">
                    {imageErrors[index]}
                  </span>
                )}

                {item.preview && (
                  <img
                    src={item.preview}
                    alt="Product preview"
                    className="admin-trending-image-preview"
                  />
                )}

                {!item.preview && item.existingImage && (
                  <img
                    src={item.existingImage}
                    alt="Existing product"
                    className="admin-trending-image-preview"
                  />
                )}
              </div>
            </div>
          ))}

          <div className="admin-trending-form-actions">
            <button
              type="button"
              className="admin-trending-form-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-trending-form-save-btn"
              disabled={loading || productsLoading}
            >
              {loading
                ? "Saving..."
                : editingTrendingProduct
                  ? "Update Trending Products"
                  : "Save Trending Products"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminTrendingProductsForm;

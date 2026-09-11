import { useEffect, useState } from "react";
import {
  createNewArrival,
  updateNewArrival,
} from "../../../Services/newArrivalService";
import { getProducts } from "../../../Services/productService";
import "./NewArrivalForm.css";

const emptyProduct = {
  product: "",
  displayOrder: 1,
  isFeatured: false,
  image: null,
  preview: null,
};

const NewArrivalForm = ({ editingArrival, onClose, onSuccess }) => {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [featuredProduct, setFeaturedProduct] = useState("");
  const [items, setItems] = useState([{ ...emptyProduct }]);
  const [loading, setLoading] = useState(false);

  const getProductId = (product) => {
    if (!product) return "";

    if (typeof product === "string") {
      return product;
    }

    return product._id || product.id || "";
  };

  const getProductName = (product) => {
    if (!product) return "Unknown Product";

    if (typeof product === "string") {
      const found = products.find((item) => getProductId(item) === product);

      return (
        found?.productName || found?.name || found?.title || "Unknown Product"
      );
    }

    return (
      product.productName ||
      product.name ||
      product.title ||
      product.productCode ||
      "Unknown Product"
    );
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts({
        page: 1,
        limit: 1000,
      });

      setProducts(response.data?.data || response.data?.products || []);
    } catch (error) {
      console.error("FETCH PRODUCTS ERROR:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (editingArrival) {
      setTitle(editingArrival.title || "");
      setSubtitle(editingArrival.subtitle || "");
      setDescription(editingArrival.description || "");

      setFeaturedProduct(getProductId(editingArrival.featuredProduct));

      const mappedItems =
        editingArrival.products?.map((item, index) => ({
          product: getProductId(item.product),
          displayOrder: item.displayOrder || index + 1,
          isFeatured: item.isFeatured || false,
          image: null,
          preview: item.image || null,
        })) || [];

      setItems(mappedItems.length ? mappedItems : [{ ...emptyProduct }]);
    } else {
      resetForm();
    }
  }, [editingArrival]);

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleImageChange = (index, file) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Maximum size is 2MB.");
      return;
    }

    setItems((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              image: file,
              preview: URL.createObjectURL(file),
            }
          : item,
      ),
    );
  };

  const addProduct = () => {
    if (items.length >= 4) {
      alert("Maximum 4 products are allowed");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        ...emptyProduct,
        displayOrder: prev.length + 1,
      },
    ]);
  };

  const removeProduct = (index) => {
    if (items.length === 1) {
      setItems([{ ...emptyProduct }]);
      return;
    }

    setItems((prev) =>
      prev
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          displayOrder: itemIndex + 1,
        })),
    );
  };

  const resetForm = () => {
    setTitle("");
    setSubtitle("");
    setDescription("");
    setFeaturedProduct("");
    setItems([{ ...emptyProduct }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    const validItems = items.filter((item) => item.product);

    if (!validItems.length) {
      alert("At least one product is required");
      return;
    }

    const selectedProducts = validItems.map((item, index) => ({
      product: item.product,
      displayOrder: Number(item.displayOrder) || index + 1,
      isFeatured: item.isFeatured === true,
    }));

    const imageFiles = validItems.filter((item) => item.image instanceof File);

    if (imageFiles.length > validItems.length) {
      alert("Number of images cannot exceed number of products");
      return;
    }

    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("subtitle", subtitle.trim());
    formData.append("description", description.trim());

    if (featuredProduct) {
      formData.append("featuredProduct", featuredProduct);
    }

    formData.append("products", JSON.stringify(selectedProducts));

    validItems.forEach((item) => {
      if (item.image instanceof File) {
        formData.append("productImages", item.image);
      }
    });

    try {
      setLoading(true);

      if (editingArrival?._id) {
        await updateNewArrival(editingArrival._id, formData);
        alert("New Arrival updated successfully");
      } else {
        await createNewArrival(formData);
        alert("New Arrival created successfully");
      }

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("SAVE NEW ARRIVAL ERROR:", error);

      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-arrival-form-overlay">
      <div className="new-arrival-form-card">
        <div className="new-arrival-form-header">
          <div>
            <h3>
              {editingArrival ? "Edit New Arrival" : "Create New Arrival"}
            </h3>

            <p>Manage your latest product arrivals</p>
          </div>

          <button
            type="button"
            className="new-arrival-form-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form className="new-arrival-form-body" onSubmit={handleSubmit}>
          <div className="new-arrival-form-grid">
            <div className="new-arrival-field">
              <label>Title</label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
            </div>

            <div className="new-arrival-field">
              <label>Subtitle</label>

              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Enter subtitle"
              />
            </div>

            <div className="new-arrival-field new-arrival-full">
              <label>Description</label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows="4"
              />
            </div>

            <div className="new-arrival-field">
              <label>Featured Product</label>

              <select
                value={featuredProduct}
                onChange={(e) => setFeaturedProduct(e.target.value)}
              >
                <option value="">Select Product</option>

                {products.map((product) => (
                  <option
                    key={getProductId(product)}
                    value={getProductId(product)}
                  >
                    {getProductName(product)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="new-arrival-products-header">
            <div>
              <h3>Products</h3>
              <span>Maximum 4 products</span>
            </div>

            <button
              type="button"
              className="new-arrival-add-btn"
              onClick={addProduct}
              disabled={items.length >= 4 || loading}
            >
              + Add Product
            </button>
          </div>

          <div className="new-arrival-products">
            {items.map((item, index) => (
              <div className="new-arrival-product-card" key={index}>
                <div className="new-arrival-product-top">
                  <h4>Product {index + 1}</h4>

                  <button
                    type="button"
                    className="new-arrival-remove-btn"
                    onClick={() => removeProduct(index)}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>

                <div className="new-arrival-product-grid">
                  <div className="new-arrival-field">
                    <label>Product</label>

                    <select
                      value={item.product}
                      onChange={(e) =>
                        handleItemChange(index, "product", e.target.value)
                      }
                    >
                      <option value="">Select Product</option>

                      {products.map((product) => (
                        <option
                          key={getProductId(product)}
                          value={getProductId(product)}
                        >
                          {getProductName(product)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="new-arrival-field">
                    <label>Display Order</label>

                    <input
                      type="number"
                      min="1"
                      value={item.displayOrder}
                      onChange={(e) =>
                        handleItemChange(index, "displayOrder", e.target.value)
                      }
                    />
                  </div>

                  <div className="new-arrival-featured">
                    <label>
                      <input
                        type="checkbox"
                        checked={item.isFeatured}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "isFeatured",
                            e.target.checked,
                          )
                        }
                      />
                      Featured
                    </label>
                  </div>

                  <div className="new-arrival-field">
                    <label>Product Image</label>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageChange(index, e.target.files?.[0])
                      }
                    />

                    <span className="new-arrival-image-help">
                      Maximum size: 2MB
                    </span>
                  </div>

                  {item.preview && (
                    <div className="new-arrival-image-preview">
                      <img
                        src={item.preview}
                        alt={getProductName(item.product)}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="new-arrival-actions">
            <button
              type="button"
              className="new-arrival-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="new-arrival-save-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingArrival
                  ? "Update New Arrival"
                  : "Create New Arrival"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewArrivalForm;

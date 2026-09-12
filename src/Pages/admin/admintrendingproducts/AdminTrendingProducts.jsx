import { useEffect, useState } from "react";

import {
  getTrendingProducts,
  deleteTrendingProduct,
} from "../../../Services/AdminTrendingProductsService";

import AdminTrendingProductsForm from "./AdminTrendingProductsForm";

import "./AdminTrendingProducts.css";

const AdminTrendingProducts = () => {
  const [trendingProducts, setTrendingProducts] = useState([]);

  const [editingTrendingProduct, setEditingTrendingProduct] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);

  const fetchTrendingProducts = async () => {
    try {
      setLoading(true);

      const response = await getTrendingProducts();

      setTrendingProducts(response.data?.data || []);
    } catch (error) {
      console.error("FETCH TRENDING PRODUCTS ERROR:", error);

      alert(
        error.response?.data?.message || "Failed to fetch trending products",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingProducts();
  }, []);

  const handleAdd = () => {
    setEditingTrendingProduct(null);
    setShowForm(true);
  };

  const handleEdit = (trendingProduct) => {
    setEditingTrendingProduct(trendingProduct);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingTrendingProduct(null);
    setShowForm(false);
  };

  const handleFormSuccess = async () => {
    setEditingTrendingProduct(null);
    setShowForm(false);

    await fetchTrendingProducts();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this trending product section?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteTrendingProduct(id);

      alert("Trending product deleted successfully");

      await fetchTrendingProducts();
    } catch (error) {
      console.error("DELETE TRENDING PRODUCT ERROR:", error);

      alert(
        error.response?.data?.message || "Failed to delete trending product",
      );
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product) => {
    if (!product) {
      return "Unknown Product";
    }

    return (
      product.productName ||
      product.name ||
      product.productCode ||
      "Unnamed Product"
    );
  };

  return (
    <div className="admin-trending-page">
      <div className="admin-trending-container">
        <div className="admin-trending-header">
          <div>
            <h2>Trending Products</h2>

            <p>Manage trending products displayed to customers</p>
          </div>

          {!showForm && (
            <button
              type="button"
              className="admin-trending-add-btn"
              onClick={handleAdd}
            >
              Add Trending Products
            </button>
          )}
        </div>

        {showForm && (
          <AdminTrendingProductsForm
            editingTrendingProduct={editingTrendingProduct}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        )}

        <div className="admin-trending-list-section">
          <div className="admin-trending-list-header">
            <h3>Trending Product List</h3>

            <span>
              {trendingProducts.length} section
              {trendingProducts.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && trendingProducts.length === 0 ? (
            <div className="admin-trending-empty">
              Loading trending products...
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="admin-trending-empty">
              No trending products found
            </div>
          ) : (
            <div className="admin-trending-list">
              {trendingProducts.map((trendingProduct) => (
                <div className="admin-trending-card" key={trendingProduct._id}>
                  <div className="admin-trending-card-content">
                    <div className="admin-trending-card-top">
                      <h3>{trendingProduct.title || "Trending Products"}</h3>

                      {trendingProduct.isActive ? (
                        <span className="admin-trending-active-badge">
                          Active
                        </span>
                      ) : (
                        <span className="admin-trending-inactive-badge">
                          Inactive
                        </span>
                      )}
                    </div>

                    {trendingProduct.subtitle && (
                      <p className="admin-trending-subtitle">
                        {trendingProduct.subtitle}
                      </p>
                    )}

                    <div className="admin-trending-products">
                      {(trendingProduct.products || [])
                        .slice()
                        .sort(
                          (a, b) =>
                            (a.displayOrder || 0) - (b.displayOrder || 0),
                        )
                        .map((productItem, index) => (
                          <div
                            className="admin-trending-product"
                            key={productItem._id || index}
                          >
                            <div className="admin-trending-product-image-wrapper">
                              {productItem.image ? (
                                <img
                                  src={productItem.image}
                                  alt={getProductName(productItem.product)}
                                  className="admin-trending-product-image"
                                />
                              ) : (
                                <div className="admin-trending-no-image">
                                  No Image
                                </div>
                              )}
                            </div>

                            <div className="admin-trending-product-info">
                              <h4>{getProductName(productItem.product)}</h4>

                              {productItem.product?.productCode && (
                                <p>{productItem.product.productCode}</p>
                              )}

                              <div className="admin-trending-product-meta">
                                <span>
                                  Order: {productItem.displayOrder || index + 1}
                                </span>

                                {productItem.isFeatured && (
                                  <span className="admin-trending-featured-badge">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="admin-trending-card-actions">
                    <button
                      type="button"
                      className="admin-trending-edit-btn"
                      onClick={() => handleEdit(trendingProduct)}
                      disabled={loading}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-trending-delete-btn"
                      onClick={() => handleDelete(trendingProduct._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTrendingProducts;

import { useEffect, useState } from "react";
import {
  getNewArrivals,
  deleteNewArrival,
} from "../../../Services/newArrivalService";
import { getProducts } from "../../../Services/productService";

import NewArrivalForm from "./NewArrivalForm";

import "./NewArrival.css";

const NewArrival = () => {
  const [newArrivals, setNewArrivals] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingArrival, setEditingArrival] = useState(null);
  const [showForm, setShowForm] = useState(false);
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

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);

      const response = await getNewArrivals();

      setNewArrivals(response.data?.data || []);
    } catch (error) {
      console.error("FETCH NEW ARRIVALS ERROR:", error);
    } finally {
      setLoading(false);
    }
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
    fetchNewArrivals();
    fetchProducts();
  }, []);

  const handleAdd = () => {
    setEditingArrival(null);
    setShowForm(true);
  };

  const handleEdit = (arrival) => {
    setEditingArrival(arrival);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCloseForm = () => {
    setEditingArrival(null);
    setShowForm(false);
  };

  const handleFormSuccess = async () => {
    setEditingArrival(null);
    setShowForm(false);

    await fetchNewArrivals();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this New Arrival?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteNewArrival(id);

      alert("New Arrival deleted successfully");

      if (editingArrival?._id === id) {
        setEditingArrival(null);
        setShowForm(false);
      }

      await fetchNewArrivals();
    } catch (error) {
      console.error("DELETE NEW ARRIVAL ERROR:", error);

      alert(error.response?.data?.message || "Failed to delete New Arrival");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-arrival-page">
      <div className="new-arrival-container">
        <div className="new-arrival-header">
          <div>
            <h2>New Arrival</h2>
            <p>Manage your latest product arrivals</p>
          </div>

          {!showForm && (
            <button
              type="button"
              className="new-arrival-add-btn"
              onClick={handleAdd}
            >
              + Add New Arrival
            </button>
          )}
        </div>

        {showForm && (
          <NewArrivalForm
            editingArrival={editingArrival}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        )}

        <div className="new-arrival-list-section">
          <div className="new-arrival-list-header">
            <h3>New Arrivals</h3>

            <span>{newArrivals.length} total</span>
          </div>

          {loading && newArrivals.length === 0 ? (
            <div className="new-arrival-empty">Loading New Arrivals...</div>
          ) : newArrivals.length === 0 ? (
            <div className="new-arrival-empty">No New Arrivals found</div>
          ) : (
            <div className="new-arrival-list">
              {newArrivals.map((arrival) => (
                <div className="new-arrival-list-card" key={arrival._id}>
                  <div className="new-arrival-list-content">
                    <h3>{arrival.title}</h3>

                    {arrival.subtitle && (
                      <p className="new-arrival-subtitle">{arrival.subtitle}</p>
                    )}

                    {arrival.description && (
                      <p className="new-arrival-description">
                        {arrival.description}
                      </p>
                    )}

                    <div className="new-arrival-product-list">
                      {arrival.products?.map((item, index) => (
                        <div
                          className="new-arrival-product-item"
                          key={item._id || index}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={getProductName(item.product)}
                            />
                          ) : (
                            <div className="new-arrival-no-image">No Image</div>
                          )}

                          <div>
                            <strong>{getProductName(item.product)}</strong>

                            <span>Order: {item.displayOrder}</span>

                            {item.isFeatured && (
                              <span className="new-arrival-featured-badge">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="new-arrival-list-actions">
                    <button
                      type="button"
                      className="new-arrival-edit-btn"
                      onClick={() => handleEdit(arrival)}
                      disabled={loading}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="new-arrival-delete-btn"
                      onClick={() => handleDelete(arrival._id)}
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

export default NewArrival;

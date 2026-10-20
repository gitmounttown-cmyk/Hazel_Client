import { useEffect, useState } from "react";
import {
  getAddresses,
  deleteAddress,
  setDefaultAddress,
} from "../../../Services/addressService";

import AddressForm from "./AddressForm";

import "./Address.css";
import { useMemo } from "react";
import { useAdminSearch } from "../../../context/AdminSearchContext";

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const { searchQuery } = useAdminSearch();
  useEffect(() => {
  setPage(1);
}, [searchQuery]);

const filteredAddresses = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();
// console.log("Filtering addresses with query:", query);
  if (!query) return addresses;

  return addresses.filter((address) => {
    const name = address.fullName || "";

    const brandName =
      typeof address.brand === "object"
        ? address.brand?.name || ""
        : address.brand || "";

    const colors = (address.variants || [])
      .map((variant) => variant.color || "")
      .join(" ");

    return [name, brandName, colors].some((value) =>
      value.toLowerCase().includes(query)
    );
  });
}, [addresses, searchQuery]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const response = await getAddresses();

      setAddresses(response.data?.addresses || []);
    } catch (error) {
      console.error("FETCH ADDRESSES ERROR:", error);

      alert(error.response?.data?.message || "Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAdd = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleFormSuccess = async () => {
    setEditingAddress(null);
    setShowForm(false);

    await fetchAddresses();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteAddress(id);

      alert("Address deleted successfully");

      await fetchAddresses();
    } catch (error) {
      console.error("DELETE ADDRESS ERROR:", error);

      alert(error.response?.data?.message || "Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      setLoading(true);

      await setDefaultAddress(id);

      alert("Default address updated successfully");

      await fetchAddresses();
    } catch (error) {
      console.error("SET DEFAULT ADDRESS ERROR:", error);

      alert(error.response?.data?.message || "Failed to set default address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-page">
      <div className="address-container">
        <div className="address-header">
          <div>
            <h2>Address</h2>
            <p>Manage customer delivery addresses</p>
          </div>

          {!showForm && (
            <button
              type="button"
              className="address-add-btn"
              onClick={handleAdd}
            >
              Add Address
            </button>
          )}
        </div>

        {showForm && (
          <AddressForm
            editingAddress={editingAddress}
            onClose={handleCloseForm}
            onSuccess={handleFormSuccess}
          />
        )}

        <div className="address-list-section">
          <div className="address-list-header">
            <h3>Address List</h3>

            <span>
              {filteredAddresses.length} address
              {filteredAddresses.length !== 1 ? "es" : ""}
            </span>
          </div>

          {loading && filteredAddresses.length === 0 ? (
            <div className="address-empty">Loading addresses...</div>
          ) : filteredAddresses.length === 0 ? (
            <div className="address-empty">No addresses found</div>
          ) : (
            <div className="address-list">
              {filteredAddresses.map((address) => (
                <div className="address-list-card" key={address._id}>
                  <div className="address-list-content">
                    <div className="address-card-top">
                      <h3>{address.fullName}</h3>

                      <span className="address-type-badge">
                        {address.addressType}
                      </span>

                      {address.isDefault && (
                        <span className="address-default-badge">Default</span>
                      )}
                    </div>

                    <p className="address-mobile">
                      {address.mobileNumber}

                      {address.alternateMobileNumber && (
                        <>
                          &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;
                          {address.alternateMobileNumber}
                        </>
                      )}
                    </p>

                    <p className="address-text">
                      {address.houseNo}
                      {address.street && `, ${address.street}`}
                      {address.area && `, ${address.area}`}
                      {address.landmark && `, ${address.landmark}`}
                    </p>

                    <p className="address-location">
                      {address.city}
                      {address.district && `, ${address.district}`}
                      {address.state}
                      {address.pincode}
                    </p>

                    <div className="address-card-meta">
                      {address.latitude !== null &&
                        address.latitude !== undefined && (
                          <span>Lat: {address.latitude}</span>
                        )}

                      {address.longitude !== null &&
                        address.longitude !== undefined && (
                          <span>Lng: {address.longitude}</span>
                        )}

                      {address.placeId && (
                        <span>Place ID: {address.placeId}</span>
                      )}
                    </div>
                  </div>

                  <div className="address-list-actions">
                    {!address.isDefault && (
                      <button
                        type="button"
                        className="address-default-btn"
                        onClick={() => handleSetDefault(address._id)}
                        disabled={loading}
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      type="button"
                      className="address-edit-btn"
                      onClick={() => handleEdit(address)}
                      disabled={loading}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="address-delete-btn"
                      onClick={() => handleDelete(address._id)}
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

export default Address;

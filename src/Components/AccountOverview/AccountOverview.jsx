import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AccountOverview.css";

export default function AccountOverview() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "Customer",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);


  const [currentView, setCurrentView] = useState("overview");


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [isPhoneEditable, setIsPhoneEditable] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [addresses, setAddresses] = useState([]);

 
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  const [addressFormData, setAddressFormData] = useState({
    fullName: "",
    mobileNumber: "",
    houseNo: "",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    addressType: "home",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("hazelUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const userData = {
          name: parsedUser.name || parsedUser.fullName || "Customer",
          email: parsedUser.email || "",
          phone: parsedUser.phone || parsedUser.mobileNumber || "",
        };
        setUser(userData);
        setFormData(userData);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    } else {
      navigate("/login");
      return;
    }

    fetchAddresses();
    setLoading(false);
  }, [navigate]);

 
  const fetchAddresses = async () => {
    const token = localStorage.getItem("hazelToken");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:5004/api/addresses/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setAddresses(result.addresses || []);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRequestOtp = async () => {
    if (!isPhoneEditable) {
      setIsPhoneEditable(true);
    } else {
      try {
        setOtpSent(true);
        alert(`OTP sent successfully to ${formData.phone}`);
      } catch (err) {
        console.error("Failed to send OTP", err);
      }
    }
  };


  const handleSaveChanges = (e) => {
    e.preventDefault();
    setUser(formData);
    const storedUser = localStorage.getItem("hazelUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const updatedUser = { 
        ...parsedUser, 
        name: formData.name, 
        email: formData.email, 
        phone: formData.phone 
      };
      localStorage.setItem("hazelUser", JSON.stringify(updatedUser));
    }
    setIsEditModalOpen(false);
    setIsPhoneEditable(false);
    setOtpSent(false);
  };


  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressFormData({
      fullName: "",
      mobileNumber: "",
      houseNo: "",
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      addressType: "home",
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressFormData({
      fullName: addr.fullName || "",
      mobileNumber: addr.mobileNumber || "",
      houseNo: addr.houseNo || "",
      street: addr.street || "",
      area: addr.area || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      addressType: addr.addressType || "home",
    });
    setIsAddressModalOpen(true);
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("hazelToken");
    if (!token) return;

    try {
      const url = editingAddressId
        ? `http://localhost:5004/api/addresses/update/${editingAddressId}`
        : "http://localhost:5004/api/addresses/create";
      
      const method = editingAddressId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressFormData),
      });

      const result = await response.json();
      if (result.success) {
        fetchAddresses();
        setIsAddressModalOpen(false);
      } else {
        alert(result.message || "Failed to save address");
      }
    } catch (err) {
      console.error("Error saving address:", err);
    }
  };

  const handleRemoveAddress = async (id) => {
    const token = localStorage.getItem("hazelToken");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5004/api/addresses/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error("Error deleting address:", err);
    }
  };

  const handleSetDefaultAddress = async (id) => {
    const token = localStorage.getItem("hazelToken");
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5004/api/addresses/${id}/default`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        fetchAddresses();
      }
    } catch (err) {
      console.error("Error setting default address:", err);
    }
  };

  if (loading) {
    return <div className="center loading-text" style={{ padding: "100px" }}>Loading your space...</div>;
  }

  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];

  return (
    <div className="about-page account-container">

      <div className="account-header">
        <span className="eyebrow" onClick={() => setCurrentView("overview")} style={{ cursor: "pointer" }}>
          {currentView === "addresses" ? "← Back to Overview" : "My Account"}
        </span>
        <h1 className="section-title">
          {currentView === "overview" ? "Your space." : "Saved addresses"}
        </h1>
        <p className="body-copy">
          {currentView === "overview"
            ? `Welcome back, ${user.name.split(" ")[0]}. Manage your orders, saved pieces and account details from here.`
            : "Manage your delivery addresses and preferences."}
        </p>
      </div>

      {currentView === "overview" && (
        <div className="account-workspace-full">

          <div className="info-card">
            <div className="card-header-flex">
              <h3 className="card-title">Your details</h3>
              <button className="btn-text-link" onClick={() => setIsEditModalOpen(true)}>
                Edit details &rarr;
              </button>
            </div>

            <div className="detail-group">
              <span className="detail-label">FULL NAME</span>
              <p className="detail-value">{user.name}</p>
            </div>

            <div className="detail-group">
              <span className="detail-label">MOBILE NUMBER</span>
              <div className="inline-verified">
                <p className="detail-value">{user.phone || "Not provided"}</p>
                <span className="verified-badge">✓ Verified</span>
              </div>
            </div>

            <div className="detail-group">
              <span className="detail-label">EMAIL</span>
              <p className="detail-value">{user.email}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-header-flex">
              <h3 className="card-title">Saved address</h3>
              <button className="btn-text-link" onClick={() => setCurrentView("addresses")}>
                All addresses &rarr;
              </button>
            </div>

            {defaultAddress ? (
              <div className="address-content">
                <div className="address-tag-row">
                  <span className="home-label" style={{ textTransform: "capitalize" }}>{defaultAddress.addressType}</span>
                  {defaultAddress.isDefault && <span className="default-badge">DEFAULT</span>}
                </div>
                <p className="address-name">{defaultAddress.fullName}</p>
                <p className="address-text">
                  {defaultAddress.houseNo}, {defaultAddress.street}, {defaultAddress.area}<br />
                  {defaultAddress.city}, {defaultAddress.state} – {defaultAddress.pincode}
                </p>
                <p className="address-phone">{defaultAddress.mobileNumber}</p>

                <div className="address-actions">
                  <button className="action-link" onClick={() => { setCurrentView("addresses"); handleOpenEditAddress(defaultAddress); }}>Edit</button>
                  <span className="dot-separator">•</span>
                  <button className="action-link danger" onClick={() => handleRemoveAddress(defaultAddress._id)}>Remove</button>
                </div>
              </div>
            ) : (
              <p className="body-copy">No saved addresses found.</p>
            )}
          </div>
        </div>
      )}

      {currentView === "addresses" && (
        <div className="addresses-page-container">
          <div className="addresses-top-row">
            <div></div>
            <button className="btn-add-address" onClick={handleOpenAddAddress}>
              + Add new address
            </button>
          </div>

          <div className="addresses-list-card">
            {addresses.length > 0 ? (
              addresses.map((addr, index) => (
                <div key={addr._id}>
                  <div className="address-item-block">
                    <div className="address-tag-row">
                      <span className="home-label" style={{ textTransform: "capitalize" }}>{addr.addressType}</span>
                      {addr.isDefault && <span className="default-badge">DEFAULT</span>}
                    </div>
                    <p className="address-name">{addr.fullName}</p>
                    <p className="address-text">
                      {addr.houseNo}, {addr.street}, {addr.area}<br />
                      {addr.city}, {addr.state} – {addr.pincode}
                    </p>
                    <p className="address-phone">{addr.mobileNumber}</p>

                    <div className="address-actions-row">
                      <button className="action-link" onClick={() => handleOpenEditAddress(addr)}>Edit</button>
                      <span className="dot-separator">•</span>
                      <button className="action-link danger" onClick={() => handleRemoveAddress(addr._id)}>Remove</button>
                      {!addr.isDefault && (
                        <>
                          <span className="dot-separator">•</span>
                          <button className="action-link default-link" onClick={() => handleSetDefaultAddress(addr._id)}>
                            Set as default
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {index < addresses.length - 1 && <hr className="address-divider" />}
                </div>
              ))
            ) : (
              <p className="body-copy">No saved addresses found.</p>
            )}
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="modal-title">Edit details</h2>

            <form onSubmit={handleSaveChanges}>
              <div className="modal-field">
                <label className="modal-label">FULL NAME</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">MOBILE NUMBER</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`modal-input ${!isPhoneEditable ? "disabled-bg" : ""}`}
                  disabled={!isPhoneEditable}
                  required
                />
                <span className="change-number-link" onClick={handleRequestOtp}>
                  {!isPhoneEditable ? "Change number →" : otpSent ? "Resend OTP →" : "Send OTP →"}
                </span>
              </div>

              <div className="modal-field">
                <label className="modal-label">EMAIL ADDRESS <span className="optional-text">(optional)</span></label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="modal-input"
                />
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsPhoneEditable(false);
                    setOtpSent(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn-save">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddressModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card address-modal-card">
            <h2 className="modal-title">{editingAddressId ? "Edit address" : "Add new address"}</h2>

            <form onSubmit={handleSaveAddress}>
              <div className="modal-field">
                <label className="modal-label">FULL NAME</label>
                <input
                  type="text"
                  name="fullName"
                  value={addressFormData.fullName}
                  onChange={handleAddressInputChange}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">MOBILE NUMBER</label>
                <input
                  type="text"
                  name="mobileNumber"
                  value={addressFormData.mobileNumber}
                  onChange={handleAddressInputChange}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">HOUSE / FLAT NO.</label>
                <input
                  type="text"
                  name="houseNo"
                  placeholder="House no., building"
                  value={addressFormData.houseNo}
                  onChange={handleAddressInputChange}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">STREET <span className="optional-text">(optional)</span></label>
                <input
                  type="text"
                  name="street"
                  placeholder="Street name"
                  value={addressFormData.street}
                  onChange={handleAddressInputChange}
                  className="modal-input"
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">AREA <span className="optional-text">(optional)</span></label>
                <input
                  type="text"
                  name="area"
                  placeholder="Area, sector"
                  value={addressFormData.area}
                  onChange={handleAddressInputChange}
                  className="modal-input"
                />
              </div>

              <div className="modal-grid-row">
                <div className="modal-field">
                  <label className="modal-label">CITY</label>
                  <input
                    type="text"
                    name="city"
                    value={addressFormData.city}
                    onChange={handleAddressInputChange}
                    className="modal-input"
                    required
                  />
                </div>
                <div className="modal-field">
                  <label className="modal-label">STATE</label>
                  <input
                    type="text"
                    name="state"
                    value={addressFormData.state}
                    onChange={handleAddressInputChange}
                    className="modal-input"
                    required
                  />
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">PIN CODE</label>
                <input
                  type="text"
                  name="pincode"
                  value={addressFormData.pincode}
                  onChange={handleAddressInputChange}
                  className="modal-input"
                  required
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">ADDRESS TYPE <span className="optional-text">(optional)</span></label>
                <select
                  name="addressType"
                  value={addressFormData.addressType}
                  onChange={handleAddressInputChange}
                  className="modal-input modal-select"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="modal-buttons">
                <button
                  type="button"
                  className="modal-btn-cancel"
                  onClick={() => setIsAddressModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="modal-btn-save">
                  {editingAddressId ? "Update address" : "Save address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import { useEffect, useState } from "react";
import { createAddress, updateAddress } from "../../../Services/addressService";
import "./AddressForm.css";

const initialForm = {
  addressType: "home",
  fullName: "",
  mobileNumber: "",
  alternateMobileNumber: "",
  houseNo: "",
  street: "",
  area: "",
  landmark: "",
  city: "",
  district: "",
  state: "",
  country: "India",
  pincode: "",
  latitude: "",
  longitude: "",
  placeId: "",
  isDefault: false,
};

const AddressForm = ({ editingAddress, onClose, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setForm({
        addressType: editingAddress.addressType || "home",
        fullName: editingAddress.fullName || "",
        mobileNumber: editingAddress.mobileNumber || "",
        alternateMobileNumber: editingAddress.alternateMobileNumber || "",
        houseNo: editingAddress.houseNo || "",
        street: editingAddress.street || "",
        area: editingAddress.area || "",
        landmark: editingAddress.landmark || "",
        city: editingAddress.city || "",
        district: editingAddress.district || "",
        state: editingAddress.state || "",
        country: editingAddress.country || "India",
        pincode: editingAddress.pincode || "",
        latitude: editingAddress.latitude ?? "",
        longitude: editingAddress.longitude ?? "",
        placeId: editingAddress.placeId || "",
        isDefault: editingAddress.isDefault === true,
      });
    } else {
      setForm(initialForm);
    }
  }, [editingAddress]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.fullName.trim() ||
      !form.mobileNumber.trim() ||
      !form.houseNo.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.pincode.trim()
    ) {
      alert(
        "Full name, mobile number, house number, city, state and pincode are required",
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        addressType: form.addressType,
        fullName: form.fullName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        alternateMobileNumber: form.alternateMobileNumber.trim(),
        houseNo: form.houseNo.trim(),
        street: form.street.trim(),
        area: form.area.trim(),
        landmark: form.landmark.trim(),
        city: form.city.trim(),
        district: form.district.trim(),
        state: form.state.trim(),
        country: form.country.trim() || "India",
        pincode: form.pincode.trim(),
        latitude: form.latitude === "" ? null : Number(form.latitude),
        longitude: form.longitude === "" ? null : Number(form.longitude),
        placeId: form.placeId.trim(),
        isDefault: form.isDefault,
      };

      if (editingAddress?._id) {
        await updateAddress(editingAddress._id, payload);
        alert("Address updated successfully");
      } else {
        await createAddress(payload);
        alert("Address created successfully");
      }

      setForm(initialForm);
      onSuccess();
    } catch (error) {
      console.error("SAVE ADDRESS ERROR:", error);

      alert(error.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-form-overlay">
      <div className="address-form-card">
        <div className="address-form-header">
          <h3>{editingAddress ? "Edit Address" : "Add Address"}</h3>

          <button
            type="button"
            className="address-form-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form className="address-form-body" onSubmit={handleSubmit}>
          <div className="address-form-grid">
            <div className="address-form-group">
              <label>Address Type</label>

              <select
                name="addressType"
                value={form.addressType}
                onChange={handleChange}
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="address-form-group">
              <label>Full Name *</label>

              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="address-form-group">
              <label>Mobile Number *</label>

              <input
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                placeholder="Enter mobile number"
                maxLength="10"
              />
            </div>

            <div className="address-form-group">
              <label>Alternate Mobile Number</label>

              <input
                name="alternateMobileNumber"
                value={form.alternateMobileNumber}
                onChange={handleChange}
                placeholder="Enter alternate number"
                maxLength="10"
              />
            </div>

            <div className="address-form-group">
              <label>House / Flat No *</label>

              <input
                name="houseNo"
                value={form.houseNo}
                onChange={handleChange}
                placeholder="Enter house or flat number"
              />
            </div>

            <div className="address-form-group">
              <label>Street</label>

              <input
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="Enter street"
              />
            </div>

            <div className="address-form-group">
              <label>Area</label>

              <input
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="Enter area"
              />
            </div>

            <div className="address-form-group">
              <label>Landmark</label>

              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Enter landmark"
              />
            </div>

            <div className="address-form-group">
              <label>City *</label>

              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </div>

            <div className="address-form-group">
              <label>District</label>

              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Enter district"
              />
            </div>

            <div className="address-form-group">
              <label>State *</label>

              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </div>

            <div className="address-form-group">
              <label>Country</label>

              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </div>

            <div className="address-form-group">
              <label>Pincode *</label>

              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                maxLength="6"
              />
            </div>

            <div className="address-form-group">
              <label>Place ID</label>

              <input
                name="placeId"
                value={form.placeId}
                onChange={handleChange}
                placeholder="Enter Google place ID"
              />
            </div>

            <div className="address-form-group">
              <label>Latitude</label>

              <input
                type="number"
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Enter latitude"
                step="any"
              />
            </div>

            <div className="address-form-group">
              <label>Longitude</label>

              <input
                type="number"
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Enter longitude"
                step="any"
              />
            </div>

            <div className="address-form-default">
              <label>
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={form.isDefault}
                  onChange={handleChange}
                />
                Set as default address
              </label>
            </div>
          </div>

          <div className="address-form-actions">
            <button
              type="button"
              className="address-form-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="address-form-save-btn"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingAddress
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;

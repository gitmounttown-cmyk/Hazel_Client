import { useEffect, useState } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../../Services/profileService";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    profileImage: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file");
      return;
    }
    setImageFile(file);

    setProfile((prev) => ({
      ...prev,
      profileImage: URL.createObjectURL(file),
    }));
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("hazelToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await getProfile();

      if (response.data.success) {
        setProfile({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          mobileNumber: response.data.user.mobileNumber || "",
          profileImage: response.data.user.profileImage || "",
        });
      }
    } catch (error) {
      console.error("Profile Error:", error.response?.data || error);

      if (error.response?.status === 401) {
        localStorage.removeItem("hazelToken");
        localStorage.removeItem("hazelUser");
        navigate("/login");
        return;
      }

      setMessage(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const formData = new FormData();

      formData.append("name", profile.name);
      formData.append("email", profile.email);

      if (imageFile) {
        console.log("IMAGE FILE:", imageFile);
        formData.append("profileImage", imageFile);
      }

      const response = await updateProfile(formData);

      if (response.data.success) {
        setProfile({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          mobileNumber: response.data.user.mobileNumber || "",
          profileImage: response.data.user.profileImage || "",
        });

        localStorage.setItem("hazelUser", JSON.stringify(response.data.user));

        setMessage("Profile updated successfully");
      }
    } catch (error) {
      console.error(error);

      setMessage(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>My Profile</h2>
          <p>Manage your personal information</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="profile-image-section">
            <div className="profile-image-wrapper">
              <img
                src={
                  profile.profileImage
                    ? profile.profileImage.startsWith("blob:")
                      ? profile.profileImage
                      : `http://localhost:5004${profile.profileImage}`
                    : "https://via.placeholder.com/120"
                }
                alt="Profile"
                className="profile-image"
              />

              <label
                htmlFor="profileImageUpload"
                className="profile-image-add-btn"
              >
                +
              </label>

              <input
                id="profileImageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          <div className="profile-form-group">
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>

          <div className="profile-form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="profile-form-group">
            <label>Mobile Number</label>

            <input type="text" value={profile.mobileNumber} disabled />
          </div>

          {message && <div className="profile-message">{message}</div>}

          <button type="submit" disabled={saving} className="profile-save-btn">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

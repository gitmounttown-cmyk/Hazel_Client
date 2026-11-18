import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../../../Services/profileService";
import type { ProfileFormData, ApiErrorResponse } from "../../../types/profile.types";
import { compressProductImage } from "../../../utils/compressImage";
import toast from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState<ProfileFormData>({
    name: "",
    email: "",
    mobileNumber: "",
    profileImage: "",
  });
  const [imageError, setImageError] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const fetchProfile = useCallback(async (): Promise<void> => {
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
    } catch (error: unknown) {
      console.error("Profile Error:", error);

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        if (error.response?.status === 401) {
          localStorage.removeItem("hazelToken");
          localStorage.removeItem("hazelUser");
          navigate("/login");
          return;
        }
        setMessage(error.response?.data?.message || "Failed to load profile");
      } else {
        setMessage("An unexpected error occurred while loading the profile");        
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);
  

  // const handleImageChange = (e: ChangeEvent<HTMLInputElement>): void => {
  //   const file = e.target.files?.[0];

  //   if (!file) return;
  //   if (!file.type.startsWith("image/")) {
  //     setMessage("Please select a valid image file");
  //     return;
  //   }
  //   setImageFile(file);

  //   setProfile((prev) => ({
  //     ...prev,
  //     profileImage: URL.createObjectURL(file),
  //   }));
  // };


// const handleImageChange = async (
//   e: ChangeEvent<HTMLInputElement>
// ): Promise<void> => {
//   const file = e.target.files?.[0];

//   if (!file) return;

//   try {
//     setMessage("");

//     // Validate image type
//     if (!file.type.startsWith("image/")) {
//       setMessage("Please select a valid image file");
//       return;
//     }

//     // Compress image using shared helper
//     const compressedFile = await compressProductImage(file);

//     // Validate size after compression (600 KB)
//     if (compressedFile.size > 600 * 1024) {
//       setMessage(
//         "Profile image must be smaller than 600 KB after compression."
//       );
//       return;
//     }

//     // Store compressed image for API upload
//     setImageFile(compressedFile);

//     // Preview compressed image
//     setProfile((prev) => ({
//       ...prev,
//       profileImage: URL.createObjectURL(compressedFile),
//     }));

//   } catch (error: unknown) {
//     console.error("Profile image compression failed:", error);

//     setMessage("Failed to process profile image. Please try again.");
//   } finally {
//     // Allow selecting the same file again
//     e.target.value = "";
//   }
// };

const handleImageChange = async (
  e: ChangeEvent<HTMLInputElement>
): Promise<void> => {
  const file = e.target.files?.[0];

  if (!file) return;

  try {
    setMessage("");

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file");
      return;
    }

    const compressedFile = await compressProductImage(file);

    if (compressedFile.size > 600 * 1024) {
      setMessage("Profile image must be smaller than 600 KB after compression.");
      return;
    }

    setImageFile(compressedFile);

    // Generate preview
    const previewUrl = URL.createObjectURL(compressedFile);

    setPreviewImage(previewUrl);
    setImageError(false);

  } catch (error: unknown) {
    console.error("Profile image compression failed:", error);
    setMessage("Failed to process profile image. Please try again.");
  } finally {
    e.target.value = "";
  }
};


  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
        const updatedUser = response.data.user;
        setProfile({
          name: updatedUser.name || "",
          email: updatedUser.email || "",
          mobileNumber: updatedUser.mobileNumber || "",
          profileImage: updatedUser.profileImage || "",
        });

        localStorage.setItem("hazelUser", JSON.stringify(updatedUser));

        // Notify Header about profile changes
        window.dispatchEvent(
          new CustomEvent("adminProfileUpdated", {
            detail: updatedUser,
          })
        );

        setMessage("Profile updated successfully");
        setImageFile(null);
        setPreviewImage("");
        setImageError(false);
        toast.success("Profile updated successfully");
      }
    } catch (error: unknown) {
      console.error('Profile Update Error:', error);

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
      setMessage(error.response?.data?.message || "Failed to update profile");
      } else {
        setMessage("An unexpected error occurred while updating the profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const imageSrc = previewImage
  ? previewImage
  : profile.profileImage
    ? profile.profileImage.startsWith("http")
      ? profile.profileImage
      : `${import.meta.env.VITE_UPLOAD_URL}/${profile.profileImage.replace(/^\/+/, "")}`
    : "";

    useEffect(() => {
  setImageError(false);
}, [imageSrc]);

useEffect(() => {
  return () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
  };
}, [previewImage]);


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
          {/* <div className="profile-image-section">
            <div className="profile-image-wrapper">
              {imageError ? (
                <div className="profile-image">{profile?.name?.charAt(0) || "A"}</div>
              ) : (
                <img
                  src={imageSrc}
                  alt="Profile"
                  className="profile-image"
                  onError={() => {
                    setImageError(true);
                  }}
                />
              )}

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
                onChange={(e) => void handleImageChange(e)}
                style={{ display: "none" }}
              />
            </div>
          </div> */}
          <div className="profile-image-section">
            <div className="profile-image-wrapper">

              {imageSrc && !imageError ? (
                <img
                  src={imageSrc}
                  alt="Profile"
                  className="profile-image"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="profile-image profile-image-fallback">
                  {profile?.name?.trim()?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}

              <label
                htmlFor="profileImageUpload"
                className="profile-image-add-btn"
                title="Add profile image"
              >
                +
              </label>

              <input
                id="profileImageUpload"
                type="file"
                accept="image/*"
                onChange={(e) => void handleImageChange(e)}
                hidden
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

            <input id="profileMobile" type="text" value={profile.mobileNumber} disabled />
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

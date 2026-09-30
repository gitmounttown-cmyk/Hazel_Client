import { useState, useEffect } from "react";
import { getHeroSlides, createHeroSlides, updateHeroSlide, deleteHeroSlide, getImageUrl } from "../../../Services/heroService";
import "./AdminHero.css";

const AdminHero = () => {
  const [slides, setSlides] = useState([]);
  const [tag, setTag] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSlides = async () => {
    try {
      const data = await getHeroSlides();
      if (data.success) setSlides(data.data);
    } catch (err) {
      console.error("Error fetching hero slides", err);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles(files);
      setPreviews(files.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && imageFiles.length === 0) return alert("Please select at least one image file.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tag", tag || "PREMIUM COTTON NIGHTWEAR");

      if (editingId) {
        if (imageFiles.length > 0) formData.append("image", imageFiles[0]);
        await updateHeroSlide(editingId, formData);
        alert("Hero slide updated successfully!");
      } else {
        imageFiles.forEach((file) => formData.append("images", file));
        await createHeroSlides(formData);
        alert("Hero slides added successfully!");
      }

      setTag("");
      setImageFiles([]);
      setPreviews([]);
      setEditingId(null);
      fetchSlides();
    } catch (err) {
      console.error("Error saving slide", err);
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (slide) => {
    setEditingId(slide._id);
    setTag(slide.tag);
    setPreviews([getImageUrl(slide.image)]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTag("");
    setImageFiles([]);
    setPreviews([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero slide?")) return;
    try {
      await deleteHeroSlide(id);
      setSlides(slides.filter((slide) => slide._id !== id));
    } catch (err) {
      console.error("Error deleting slide", err);
    }
  };

  return (
    <div className="admin-hero-page" style={{ padding: "20px" }}>
      <h2>{editingId ? "Edit Hero Slide" : "Manage Homepage Hero Slider"}</h2>

      <form onSubmit={handleFormSubmit} style={{ marginBottom: "30px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>Slide Tag / Badge</label>
          <input
            type="text"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>
            {editingId ? "Replace Image (Optional)" : "Select Images from Device"}
          </label>
          <input
            type="file"
            accept="image/*"
            multiple={!editingId}
            onChange={handleFileChange}
            required={!editingId}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        {previews.length > 0 && (
          <div style={{ marginBottom: "15px" }}>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Preview:</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {previews.map((src, index) => (
                <img key={index} src={src} alt="Preview" style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ddd" }} />
              ))}
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button type="submit" disabled={loading} style={{ background: "#000", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            {loading ? "Saving..." : editingId ? "Update Slide" : "Upload Hero Slides"}
          </button>
          {editingId && (
            <button type="button" onClick={handleCancelEdit} style={{ background: "#ccc", color: "#000", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div>
        <h3>Active Hero Slides ({slides.length})</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginTop: "15px" }}>
          {slides.map((slide) => {
            const imageUrl = getImageUrl(slide.image);
            return (
              <div key={slide._id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "6px", overflow: "hidden", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                <img src={imageUrl} alt="Hero Preview" style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "11px", background: "#eef2f7", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" }}>{slide.tag}</span>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => handleEditClick(slide)} style={{ flex: 1, backgroundColor: "#007bff", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(slide._id)} style={{ flex: 1, backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminHero;
import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminHero.css";

const AdminHero = () => {
  const [slides, setSlides] = useState([]);
  const [tag, setTag] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSlides = async () => {
    try {
      const res = await axios.get("http://localhost:5004/api/hero");
      if (res.data.success) {
        setSlides(res.data.data);
      }
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
      const filePreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews(filePreviews);
    }
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) return alert("Please select at least one image file.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tag", tag || "PREMIUM COTTON NIGHTWEAR");
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const res = await axios.post("http://localhost:5004/api/hero", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setTag("");
        setImageFiles([]);
        setPreviews([]);
        fetchSlides();
        alert("Hero slides added successfully!");
      }
    } catch (err) {
      console.error("Error adding slides", err);
      alert("Failed to add slides");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero slide?")) return;
    try {
      await axios.delete(`http://localhost:5004/api/hero/${id}`);
      setSlides(slides.filter((slide) => slide._id !== id));
    } catch (err) {
      console.error("Error deleting slide", err);
    }
  };

  return (
    <div className="admin-hero-page" style={{ padding: "20px" }}>
      <h2>Manage Homepage Hero Slider</h2>

      <form onSubmit={handleAddSlide} style={{ marginBottom: "30px", background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>Slide Tag / Badge</label>
          <input
            type="text"
            value={tag}
            placeholder=""
            onChange={(e) => setTag(e.target.value)}
            style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>Select Images from Device</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            required
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        {previews.length > 0 && (
          <div style={{ marginBottom: "15px" }}>
            <p style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>Selected Previews ({previews.length}):</p>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {previews.map((src, index) => (
                <img key={index} src={src} alt="Preview" style={{ width: "100px", height: "60px", objectFit: "cover", borderRadius: "4px", border: "1px solid #ddd" }} />
              ))}
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} style={{ background: "#000", color: "#fff", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer" }}>
          {loading ? "Uploading..." : "Upload Hero Slides"}
        </button>
      </form>

      <div>
        <h3>Active Hero Slides ({slides.length})</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "20px", marginTop: "15px" }}>
          {slides.map((slide) => {
            const imageUrl = slide.image.startsWith("http") ? slide.image : `http://localhost:5004${slide.image}`;
            return (
              <div key={slide._id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "6px", overflow: "hidden", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                <img src={imageUrl} alt="Hero Preview" style={{ width: "100%", height: "120px", objectFit: "cover" }} />
                <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <span style={{ fontSize: "11px", background: "#eef2f7", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" }}>{slide.tag}</span>
                  <button
                    onClick={() => handleDelete(slide._id)}
                    style={{ backgroundColor: "#ff4d4d", color: "white", border: "none", padding: "6px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                  >
                    Delete Slide
                  </button>
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
import { useEffect, useState } from "react";

import {
  createVideo,
  updateVideo,
} from "../../../Services/videoService";

const VideoForm = ({
  editingVideo,
  onSuccess,
  onCancel,
}) => {
    console.log("editingVideo in VideoForm:", editingVideo); // Debugging line
  const [title, setTitle] = useState("");

  const [price, setPrice] = useState("");

  const [video, setVideo] = useState(null);

  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_UPLOAD_URL;

  // ==========================================
  // EDIT DATA
  // ==========================================

  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.title || "");

      setPrice(editingVideo.price || "");

      setVideo(null);

      if (editingVideo.videoUrl) {
        setPreview(
          `${API_BASE_URL}${editingVideo.videoUrl}`
        );
      }
    } else {
      setTitle("");
      setPrice("");
      setVideo(null);
      setPreview("");
    }
  }, [editingVideo, API_BASE_URL]);

  // ==========================================
  // VIDEO CHANGE
  // ==========================================

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only video
    if (!file.type.startsWith("video/")) {
      setError(
        "Please select a valid video file."
      );

      return;
    }

    // 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError(
        "Video size must be less than 50MB."
      );

      return;
    }

    setError("");

    setVideo(file);

    const videoURL =
      URL.createObjectURL(file);

    setPreview(videoURL);
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // New video requires file
      if (!editingVideo && !video) {
        setError(
          "Please select a video."
        );

        return;
      }

      if (!title.trim()) {
        setError(
          "Please enter video title."
        );

        return;
      }

      if (!price) {
        setError(
          "Please enter video price."
        );

        return;
      }

      const formData = new FormData();

      // MUST match backend
      formData.append(
        "title",
        title
      );

      formData.append(
        "price",
        price
      );

      // MUST be "video"
      if (video) {
        formData.append(
          "video",
          video
        );
      }

      let response;

      if (editingVideo) {
        response = await updateVideo(
          editingVideo._id,
          formData
        );
      } else {
        response = await createVideo(
          formData
        );
      }

      if (response.data.success) {
        onSuccess();
      }
    } catch (error) {
      console.error(
        "Video save error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to save video."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="video-form"
      onSubmit={handleSubmit}
    >

      {/* HEADER */}
      <div className="video-form-header">

        <h3>
          {editingVideo
            ? "Edit Video"
            : "Add Video"}
        </h3>

      </div>

      {/* ERROR */}
      {error && (
        <div className="video-form-error">
          {error}
        </div>
      )}

      {/* TITLE */}
      <div className="video-form-group">

        <label>
          Video Title
        </label>

        <input
          type="text"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          placeholder="Enter video title"
        />

      </div>

      {/* PRICE */}
      <div className="video-form-group">

        <label>
          Price
        </label>

        <input
          type="number"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
          placeholder="Enter price"
          min="0"
        />

      </div>

      {/* VIDEO */}
      <div className="video-form-group">

        <label>
          {editingVideo
            ? "Change Video"
            : "Upload Video"}
        </label>

        <input
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
        />

        <small>
          Maximum file size: 50MB
        </small>

      </div>

      {/* PREVIEW */}
      {preview && (
        <div className="video-form-preview">

          <label>
            Video Preview
          </label>

          <video
            src={preview}
            controls
            muted
          />

        </div>
      )}

      {/* BUTTONS */}
      <div className="video-form-actions">

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Uploading..."
            : editingVideo
            ? "Update Video"
            : "Add Video"}
        </button>

      </div>

    </form>
  );
};

export default VideoForm;
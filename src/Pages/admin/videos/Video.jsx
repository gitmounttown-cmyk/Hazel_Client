import { useEffect, useState } from "react";

import {
  getVideos,
  deleteVideo,
} from "../../../Services/videoService";

import VideoForm from "./VideoForm";

import "./Video.css";

const Video = () => {
  const [videos, setVideos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [editingVideo, setEditingVideo] = useState(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_UPLOAD_URL;

  // ==========================================
  // FETCH VIDEOS
  // ==========================================

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getVideos();

      if (response.data.success) {
        setVideos(response.data.data || []);
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to fetch videos"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // ==========================================
  // ADD
  // ==========================================

  const handleAdd = () => {
    setEditingVideo(null);
    setShowForm(true);
    setMessage("");
    setError("");
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (video) => {
    setEditingVideo(video);
    setShowForm(true);
    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // FORM SUCCESS
  // ==========================================

  const handleFormSuccess = () => {
    setEditingVideo(null);
    setShowForm(false);

    fetchVideos();
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    setEditingVideo(null);
    setShowForm(false);

    setMessage("");
    setError("");
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");

      const response = await deleteVideo(id);

      if (response.data.success) {
        setMessage(response.data.message);

        fetchVideos();

        if (editingVideo?._id === id) {
          setEditingVideo(null);
        }
      }
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete video"
      );
    }
  };

  return (
    <div className="video-page">

      {/* HEADER */}
      <div className="video-page-header">

        <h2>Video Management</h2>

        <button
          type="button"
          className="video-add-btn"
          onClick={handleAdd}
        >
          Add Video
        </button>

      </div>

      {/* MESSAGE */}
      {message && (
        <div className="video-success">
          {message}
        </div>
      )}

      {error && (
        <div className="video-error">
          {error}
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="video-modal-overlay">

          <div className="video-modal">

            <VideoForm
              editingVideo={editingVideo}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />

          </div>

        </div>
      )}

      {/* TABLE */}
      <div className="video-table-card">

        {loading ? (
          <div className="video-loading">
            Loading videos...
          </div>
        ) : videos.length === 0 ? (
          <div className="video-empty">
            No videos found
          </div>
        ) : (
          <table className="video-table">

            <thead>
              <tr>
                <th>S.No</th>
                <th>Video</th>
                <th>Title</th>
                <th>Price</th>
                {/* <th>Created Date</th> */}
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {videos.map((video, index) => (

                <tr key={video._id}>

                  <td>
                    {index + 1}
                  </td>

                  <td>

                    <video
                      className="video-preview"
                      src={`${API_BASE_URL}${video.videoUrl}`}
                      muted
                      controls
                      preload="metadata"
                    />

                  </td>

                  <td>
                    {video.title}
                  </td>

                  <td>
                    ₹{video.price}
                  </td>

                  {/* <td>
                    {video.createdAt
                      ? new Date(
                          video.createdAt
                        ).toLocaleDateString(
                          "en-IN"
                        )
                      : "-"}
                  </td> */}

                  <td>

                    <div className="video-actions">

                      <button
                        className="video-edit-btn"
                        onClick={() =>
                          handleEdit(video)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="video-delete-btn"
                        onClick={() =>
                          handleDelete(
                            video._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>
        )}

      </div>

    </div>
  );
};

export default Video;
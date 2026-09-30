import axiosInstance from "../api/axiosInstance";

const BASE = "/videos";

// Get all videos
export const getVideos = () => {
  return axiosInstance.get(`${BASE}/all`);
};

// Create video
export const createVideo = (formData) => {
  return axiosInstance.post(
    `${BASE}/create`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Update video
export const updateVideo = (id, formData) => {
  return axiosInstance.put(
    `${BASE}/update/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// Delete video
export const deleteVideo = (id) => {
  return axiosInstance.delete(
    `${BASE}/delete/${id}`
  );
};
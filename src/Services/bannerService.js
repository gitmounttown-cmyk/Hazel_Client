import axiosInstance from "../api/axiosInstance";

export const getBanners = () => {
  return axiosInstance.get("/banners/all");
};

export const getBannerById = (id) => {
  return axiosInstance.get(`/banners/${id}`);
};

export const createBanner = (payload) => {
  return axiosInstance.post("/banners/create", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateBanner = (id, payload) => {
  return axiosInstance.put(`/banners/update/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteBanner = (id) => {
  return axiosInstance.delete(`/banners/delete/${id}`);
};

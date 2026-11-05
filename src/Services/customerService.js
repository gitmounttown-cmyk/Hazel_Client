import axiosInstance from "../api/axiosInstance";

export const getCustomers = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "active",
} = {}) => {
  const response = await axiosInstance.get("/users/all", {
    params: {
      page,
      limit,
      search,
      status,
    },
  });

  return response.data;
};

export const isUserLoggedIn = () => {
  const token = localStorage.getItem("hazelToken");

  return !!token;
};
//create function to role show in uppercase and replace _ with space
export const formatRole = (role) => {
  if (!role) return "";
  return role.replace(/_/g, " ").toUpperCase();
};
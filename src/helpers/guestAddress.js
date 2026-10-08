const GUEST_ADDRESS_KEY = "hazel_guest_checkout_address";

export const getGuestAddress = () => {
  try {
    const address = localStorage.getItem(GUEST_ADDRESS_KEY);

    return address ? JSON.parse(address) : null;
  } catch (error) {
    console.error("Failed to get guest address:", error);
    return null;
  }
};

export const saveGuestAddress = (address) => {
  try {
    localStorage.setItem(
      GUEST_ADDRESS_KEY,
      JSON.stringify(address)
    );
  } catch (error) {
    console.error("Failed to save guest address:", error);
  }
};

export const clearGuestAddress = () => {
  localStorage.removeItem(GUEST_ADDRESS_KEY);
};
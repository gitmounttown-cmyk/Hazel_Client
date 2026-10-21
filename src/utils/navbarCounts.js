
export const updateNavbarCounts = ({
  wishlistCount,
  cartCount,
}) => {
    console.log("Updating navbar counts:", { wishlistCount, cartCount });
  window.dispatchEvent(
    new CustomEvent("hazel:update", {
      detail: {
        wishlistCount,
        cartCount,
      },
    })
  );
};

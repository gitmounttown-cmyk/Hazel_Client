/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { isLoggedIn } from "../../../services/authService";
import { addToCart, getCart } from "../../../services/cartService";
import "./ProductPreview.css";
import {
  addToWishlist,
  checkWishlist,
  removeWishlistItem,
} from "../../../Services/wishlistService";

/* ---------- real image assets ----------
   Swap these import paths for your real product photography — everything
   else (layout, sizing, hover states) stays the same. */
import mainPhoto from "../../../assets/Trending/img2.png";
import thumb1 from "../../../assets/Trending/img1.png";
import thumb2 from "../../../assets/Trending/img2.png";
import thumb3 from "../../../assets/Trending/img3.png";
import thumb4 from "../../../assets/Trending/img4.png";
import thumb5 from "../../../assets/Trending/img5.png";
import thumb6 from "../../../assets/Trending/img2.png";
import thumb7 from "../../../assets/Trending/img2.png";
import thumb8 from "../../../assets/Trending/img2.png";
import reviewPhoto1 from "../../../assets/Trending/img1.png";
import reviewPhoto2 from "../../../assets/Trending/img2.png";
import reviewPhoto3 from "../../../assets/Trending/img3.png";
import relatedPhoto from "../../../assets/Trending/img4.png";
import { getProductById, getProducts } from "../../../services/productService";
import toast from "react-hot-toast";
import { getAllReviews } from "../../../Services/reviewService";
import { formatCurrency } from "../../../utils/currencyFormat";
import { formatTimeAgo } from "../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";

/* ---------- inline icons ---------- */
const Star = ({ filled = true }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    className={filled ? "star star--filled" : "star"}
  >
    <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L5.8 21l1.6-7L2 9.2l7.1-.6L12 2z" />
  </svg>
);

const Heart = ({ active = false }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4c2-.3 3.9.6 5 2.2C11.7 4.6 13.6 3.7 15.6 4c3.6.5 5.2 4 3.6 7.7C16.7 16.4 12 21 12 21z" />
  </svg>
);

const Check = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const PinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22s7-6.8 7-12.5A7 7 0 1 0 5 9.5C5 15.2 12 22 12 22zm0-9.5a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
  </svg>
);

const TruckIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M1 6h12v8.5h-1a2.5 2.5 0 0 1-5 0H8a2.5 2.5 0 0 1-5 0H1z" />
    <path d="M14 9h4.2L22 12.5V14.5h-8z" />
    <circle cx="6" cy="17.5" r="1.7" fill="var(--white)" />
    <circle cx="6" cy="17.5" r="1" />
    <circle cx="17" cy="17.5" r="1.7" fill="var(--white)" />
    <circle cx="17" cy="17.5" r="1" />
    <path d="M2 8h5v1.4H2z" opacity="0.7" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2 4 5v6c0 5 3.4 8.7 8 11 4.6-2.3 8-6 8-11V5l-8-3z" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const QualityIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <path
      d="m8 12.3 2.6 2.6L16.5 9"
      stroke="var(--white)"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ---------- content ---------- */
const THUMBS = [thumb1, thumb2, thumb3, thumb4, thumb5, thumb6, thumb7, thumb8];

const COLORS = [
  { id: "rose", hex: "#E7CDD3", selected: true },
  { id: "beige", hex: "#F1E9DE" },
  { id: "mint", hex: "#E4F1DC" },
  { id: "aqua", hex: "#DCF1EE" },
  { id: "lilac", hex: "#DEDCF2" },
  { id: "blush", hex: "#F1DDDC" },
];

const SIZES = [
  { id: "L", label: "In Stock", disabled: false },
  { id: "XL", label: "In Stock", disabled: false },
  { id: "XXL", label: "Out of Stock", disabled: true },
];

// const DETAILS = [
//   ["Fabric", "Cotton Flex"],
//   ["Designed For", "Feeding Moms"],
//   ["Feeding Access", "Invisible Vertical Zipper"],
//   ["Zip Detail", "Matching zipper colour as per fabric"],
//   ["Finishing", "Fully Overlocked"],
//   ["Pocket", "Convenient Side Pocket"],
//   ["Available Sizes", "L | XL | XXL | 3XL"],
// ];

const FILTERS = [
  { id: "all", label: "All Reviews" },
  { id: "photos", label: "With Photos (42)" },
  { id: "helpful", label: "Most Helpful" },
  { id: "five", label: "5 Stars (98)" },
];

const REVIEWS = [
  {
    id: 1,
    stars: 5,
    time: "2 days ago",
    title: "The softest cotton I've ever felt!",
    body: "I bought this for my post-pregnancy days and the feeding zippers are a life saver. The fabric doesn't shrink even after multiple washes. Truly premium.",
    author: "Ananya S.",
    photos: null,
  },
  {
    id: 2,
    stars: 5,
    time: "1 week ago",
    title: "Beautiful Print & Great Fit",
    body: "The print looks even better in person. I love the puff sleeves, they give it such a sophisticated look for home wear. Highly recommended.",
    author: "Megha R.",
    photos: [reviewPhoto1, reviewPhoto2, reviewPhoto3],
  },
  {
    id: 3,
    stars: 5,
    time: "3 days ago",
    title: "The softest cotton I've ever felt!",
    body: "I bought this for my post-pregnancy days and the feeding zippers are a life saver. The fabric doesn't shrink even after multiple washes. Truly premium.",
    author: "Ananya S.",
    photos: null,
  },
];

const RELATED = [1, 2, 3, 4].map((n) => ({
  id: n,
  name: "Admire Maxi Ditsy",
  subtitle: "Cambric Cotton · Hand Block Print",
  rating: 4.2,
  price: "1,299",
}));

function Stars({ count }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < Math.round(count)} />
      ))}
    </span>
  );
}

const COLOR_MAP = {
  "LIGHT ORCHID": {
    id: "light-orchid",
    hex: "#E6B7D1",
  },
  ROSE: {
    id: "rose",
    hex: "#E7CDD3",
  },
  BEIGE: {
    id: "beige",
    hex: "#F1E9DE",
  },
  MINT: {
    id: "mint",
    hex: "#E4F1DC",
  },
  AQUA: {
    id: "aqua",
    hex: "#DCF1EE",
  },
  LILAC: {
    id: "lilac",
    hex: "#DEDCF2",
  },
  BLUSH: {
    id: "blush",
    hex: "#F1DDDC",
  },
};

const FALLBACK_COLORS = [
  "#E8D5C4",
  "#D8E2DC",
  "#E2D4F0",
  "#F3D5B5",
  "#D6EAF8",
  "#F5CAC3",
  "#CDEAC0",
  "#E8C7C8",
];

const createColorId = (color) => {
  return color
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const DELIVERY_ADDRESSES = [
  {
    id: 1,
    name: "Name",
    address: "12, Gandhi Road",
    city: "Coimbatore",
    state: "Tamil Nadu",
    pincode: "641001",
  },
];

export default function ProductPage() {
  const navigate = useNavigate();
  const [addedToCart, setAddedToCart] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeColor, setActiveColor] = useState("rose");
  const [activeSize, setActiveSize] = useState("L");
  const [qty, setQty] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [relatedWishlisted, setRelatedWishlisted] = useState({});

  const [productDetails, setProductDetails] = useState(null); // State to hold product details
  const [reviews, setReviews] = useState([]); // State to hold product reviews
  const [variantMedia, setVariantMedia] = useState([]); // State to hold variant media images
  const [showLocations, setShowLocations] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [deliveryAddresses, setDeliveryAddresses] = useState([
    {
      id: 1,
      name: "Name",
      phone: "9234556783",
      address: "12, Gandhi Road",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641001",
    },
  ]);
  const { id } = useParams();
  console.log("Product ID:", id); // Log the product ID to the console

  // get product details using the id from the backend API and display them on the page. You can use useEffect to fetch the product details when the component mounts or when the id changes.
  useEffect(() => {
    // Fetch product details from the backend API using the id
    getProductById(id)
      .then((response) => {
        // Handle the response and update the state with product details
        console.log("Product details:", response.data);
        // Update state with product details here
        setProductDetails(response?.data?.data);
      })
      .catch((error) => {
        // Handle error if the API call fails
        console.error("Error fetching product details:", error);
      });
  }, [id]);

  useEffect(() => {
    if (!id || !isLoggedIn()) return;

    const checkCart = async () => {
      try {
        const response = await getCart();

        const cart = response?.data?.cart || response?.cart;

        const items = cart?.items || [];

        const exists = items.some(
          (item) =>
            String(item?.product?._id || item?.productId) === String(id),
        );

        setAddedToCart(exists);
      } catch (error) {
        console.error("CHECK CART ERROR:", error);
      }
    };

    checkCart();
  }, [id]);

  useEffect(() => {
    if (!id || !isLoggedIn()) return;

    const checkProductWishlist = async () => {
      try {
        const response = await checkWishlist(id);

        setWishlisted(
          response?.data?.isWishlisted ??
            response?.data?.wishlisted ??
            response?.data?.data?.isWishlisted ??
            false,
        );
      } catch (error) {
        console.error("CHECK WISHLIST ERROR:", error);
      }
    };

    checkProductWishlist();
  }, [id]);

  const handleRelatedWishlist = async (e, productId) => {
    e.stopPropagation();

    if (!isLoggedIn()) {
      toast.error("Please log in to use wishlist.");
      return;
    }

    if (!productId) return;

    try {
      setWishlistLoading(true);

      const isCurrentlyWishlisted = relatedWishlisted[productId];

      if (isCurrentlyWishlisted) {
        await removeWishlistItem(productId);

        setRelatedWishlisted((prev) => ({
          ...prev,
          [productId]: false,
        }));

        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({
          productId,
        });

        setRelatedWishlisted((prev) => ({
          ...prev,
          [productId]: true,
        }));

        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("RELATED WISHLIST ERROR:", error);

      toast.error(
        error?.response?.data?.message || "Failed to update wishlist",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  useEffect(() => {
    if (!productDetails?.variants?.length) {
      setVariantMedia([]);
      return;
    }

    const images = productDetails.variants.flatMap((variant) => {
      if (!variant.media?.length) return [];

      console.log(`Media for variant ${variant.id}:`, variant.media);

      return variant.media.map((mediaItem) => {
        console.log(`Media item for variant ${variant.id}:`, mediaItem);

        return mediaItem.imageURL;
      });
    });

    // Remove duplicate image URLs
    const uniqueImages = [...new Set(images)];

    console.log("All variant images:", images);
    console.log("Unique variant images:", uniqueImages);

    setVariantMedia(uniqueImages);
  }, [productDetails]);

  //get all product reviews using the product id from the backend API and display them on the page. You can use useEffect to fetch the product reviews when the component mounts or when the id changes.
  useEffect(() => {
    getAllReviews()
      .then((response) => {
        console.log("Product reviews:", response.data?.data);
        // Update state with product reviews here
        const productReviews = response?.data?.data?.filter(
          (review) => review.product === id,
        );
        console.log(
          "Filtered product reviews for product ID",
          id,
          ":",
          productReviews,
        );
        setReviews(
          productReviews?.length ? productReviews : response.data?.data,
        );
      })
      .catch((error) => {
        console.error("Error fetching product reviews:", error);
      });
  }, [id]);

  //get products using the backend API and display them on the page. You can use useEffect to fetch the products when the component mounts.
  useEffect(() => {
    getProducts()
      .then((response) => {
        console.log("Products:", response.data?.data);
        // Update state with products here
        setProducts(response.data?.data);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  console.log("Variant media state:", variantMedia); // Log the variant media state to the console

  console.log("Reviews state:", reviews); // Log the reviews state to the console

  console.log("Product details state:", productDetails); // Log the product details state to the console

  const colors = [
    ...new Map(
      (productDetails?.variants || [])
        .map((variant, index) => {
          const colorName = variant.color?.trim().toUpperCase();

          if (!colorName) return null;

          const mappedColor = COLOR_MAP[colorName];

          if (!mappedColor) {
            console.warn("New color found:", colorName);
          }

          return [
            colorName,
            {
              id: mappedColor?.id || createColorId(colorName),

              hex:
                mappedColor?.hex ||
                FALLBACK_COLORS[index % FALLBACK_COLORS.length],

              selected: index === 0,
            },
          ];
        })
        .filter(Boolean),
    ).values(),
  ];

  console.log("Colors derived from product details:", colors); // Log the colors derived from product details

  const SIZES =
    productDetails?.variants?.[0]?.sizes?.map((item) => {
      const inStock = item.isActive && item.stockQuantity > 0;

      return {
        id: item.size,
        label: inStock ? "In Stock" : "Out of Stock",
        disabled: !inStock,
      };
    }) || [];

  console.log("Sizes derived from product details:", SIZES); // Log the sizes derived from product details

  const selectedVariant =
    productDetails?.variants?.find((variant) => variant.isActive) ||
    productDetails?.variants?.[0];

  const DETAILS = [
    ["Fabric", selectedVariant?.fabric || "-"],
    ["Feel", selectedVariant?.feel || "-"],
    ["Lining", selectedVariant?.lining || "-"],
    ["Sleeves", selectedVariant?.sleeves || "-"],
    ["Finishing", selectedVariant?.finishing || "-"],
    ["Pocket", selectedVariant?.pocket || "-"],
    [
      "Available Sizes",
      selectedVariant?.sizes?.map((item) => item.size).join(" | ") || "-",
    ],
  ];

  const handleWishlist = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn()) {
      toast.error("Please log in to use wishlist.");
      return;
    }

    if (!id) return;

    try {
      setWishlistLoading(true);

      if (wishlisted) {
        await removeWishlistItem(id);
        setWishlisted(false);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({
          productId: id,
        });
        setWishlisted(true);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error("WISHLIST ERROR:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update wishlist",
      );
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    console.log("Add to Cart clicked", isLoggedIn());
    if (!isLoggedIn()) {
      toast.error("Please log in to add items to your cart.");
      return;
    }
    console.log("productDetails:", productDetails);
    console.log(
      "Adding to cart:",
      productDetails._id,
      selectedVariant._id,
      qty,
    );
    const cartItem = {
      productId: productDetails._id,
      variantId: selectedVariant._id,
      quantity: qty,
      price: selectedVariant.discountPrice || selectedVariant.price,
    };
    console.log("Cart item:", cartItem);
    const response = await addToCart(cartItem);
    console.log("Add to Cart response:", response);
    if (response.success) {
      setAddedToCart(true);
      toast.success("Product added");
    } else {
      toast.error(response?.message || "Failed to add item to cart.");
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn()) {
      toast.error("Please log in to proceed with the purchase.");
      return;
    }
  };

  const handleSaveAddress = () => {
    if (!newAddress.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!newAddress.phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!newAddress.address.trim()) {
      toast.error("Please enter your address");
      return;
    }

    if (!newAddress.city.trim()) {
      toast.error("Please enter your city");
      return;
    }

    if (!newAddress.state.trim()) {
      toast.error("Please enter your state");
      return;
    }

    if (newAddress.pincode.length !== 6) {
      toast.error("Please enter a valid 6 digit pincode");
      return;
    }

    const address = {
      id: Date.now(),
      ...newAddress,
    };

    setDeliveryAddresses((prev) => [...prev, address]);

    // Automatically select new address
    setSelectedAddress(address);

    // Reset form
    setNewAddress({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    // Close both modals
    setShowAddAddress(false);
    setShowLocations(false);

    toast.success("Address added successfully");
  };

  const RELATED = products.map((product) => {
    const variant = product.variants?.[0];

    return {
      id: product._id,
      name: product.name,
      subtitle: `${variant?.fabric || ""} · ${variant?.color || ""}`,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      price: formatCurrency(variant?.discountPrice || variant?.price || 0),
      image:
        import.meta.env.VITE_UPLOAD_URL + (variant?.media?.[0]?.imageURL || ""),
    };
  });

  useEffect(() => {
    if (!RELATED?.length || !isLoggedIn()) return;

    const checkRelatedWishlist = async () => {
      try {
        const wishlistStatus = {};

        await Promise.all(
          RELATED.slice(0, 4).map(async (product) => {
            if (!product.id) return;

            try {
              const response = await checkWishlist(product.id);

              wishlistStatus[product.id] =
                response?.data?.isWishlisted ??
                response?.data?.wishlisted ??
                response?.data?.data?.isWishlisted ??
                false;
            } catch (error) {
              wishlistStatus[product.id] = false;
            }
          }),
        );

        setRelatedWishlisted(wishlistStatus);
      } catch (error) {
        console.error("CHECK RELATED WISHLIST ERROR:", error);
      }
    };

    checkRelatedWishlist();
  }, [products, id]);

  return (
    <div className="pp">
      {/* ============ PRODUCT SECTION ============ */}
      <section className="pp-product">
        <div className="pp-breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{" "}
          {productDetails?.name || "Product Name"}
        </div>

        <div className="pp-grid">
          {/* ---- gallery ---- */}
          <div className="pp-gallery-panel">
            <div className="pp-thumbs">
              {variantMedia.map((src, i) => (
                <button
                  key={i}
                  className={`pp-thumb ${activeThumb === i ? "is-active" : ""}`}
                  onClick={() => setActiveThumb(i)}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    className="pp-thumb-img"
                    src={import.meta.env.VITE_UPLOAD_URL + src}
                    alt={`Admire Maxi view ${i + 1}`}
                    onError={(e) => {
                      console.error(`Error loading image ${src}:`, e);
                      e.target.src = mainPhoto; // Fallback to main photo on error
                    }}
                  />
                </button>
              ))}
            </div>
            <div className="pp-main-image">
              <img
                className="pp-main-image-ph"
                src={
                  import.meta.env.VITE_UPLOAD_URL +
                  (variantMedia[activeThumb] || mainPhoto)
                }
                alt={productDetails?.name || "Admire Maxi"}
                onError={(e) => {
                  console.error(`Error loading main image:`, e);
                  e.target.src = mainPhoto; // Fallback to main photo on error
                }}
              />
            </div>
          </div>

          {/* ---- info ---- */}
          <div className="pp-info">
            <div className="pp-eyebrow">
              {productDetails?.variants?.[0]?.fabric || null}
            </div>

            <div className="pp-title-row">
              {/* //if no name show nill */}
              <h1 className="pp-title">{productDetails?.name || null}</h1>
              <button
                className={`pp-wish ${wishlisted ? "is-active" : ""}`}
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                <Heart active={wishlisted} />
              </button>
            </div>

            <p className="pp-desc">
              {productDetails?.description?.about || null}
            </p>

            <div className="pp-rating">
              <Stars count={productDetails?.rating} />
              <span className="pp-rating-num">{productDetails?.rating}</span>
              <span className="pp-rating-count">
                ({productDetails?.reviewCount || 0} Reviews)
              </span>
            </div>

            <div className="pp-price">
              ₹{formatCurrency(productDetails?.variants?.[0]?.price) || "0"}
            </div>

            <div className="pp-block">
              <div className="pp-label-row">
                <span className="pp-label">
                  Choose Color — {colors.length} available
                </span>
              </div>
              <div className="pp-colors">
                {colors.map((c) => (
                  <button
                    key={c.id}
                    className={`pp-color ${activeColor === c.id ? "is-active" : ""}`}
                    style={{ background: c.hex }}
                    onClick={() => setActiveColor(c.id)}
                    aria-label={c.id}
                  >
                    {activeColor === c.id && <Check />}
                  </button>
                ))}
              </div>
            </div>

            <div className="pp-block">
              <div className="pp-label-row">
                <span className="pp-label">Select Size</span>
                <button className="pp-size-guide">Size Guide</button>
              </div>
              <div className="pp-sizes">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    disabled={s.disabled}
                    className={`pp-size ${activeSize === s.id ? "is-active" : ""} ${
                      s.disabled ? "is-disabled" : ""
                    }`}
                    onClick={() => !s.disabled && setActiveSize(s.id)}
                  >
                    <span className="pp-size-id">{s.id}</span>
                    <span className="pp-size-note">{s.label}</span>
                  </button>
                ))}
                {/* {productDetails?.variants?.[0]?.sizes?.map((s) => (
                  <button
                    key={s?._id}
                    disabled={s.isActive}
                    className={`pp-size ${activeSize === s?.size ? "is-active" : ""} ${
                      s?.isActive ? "is-disabled" : ""
                    }`}
                    onClick={() => !s.isActive && setActiveSize(s?.size)}
                  >
                    <span className="pp-size-id">{s?.size}</span>
                    <span className="pp-size-note">{s.label}</span>
                  </button>
                ))} */}
              </div>
            </div>

            <div className="pp-block pp-qty-row">
              <div>
                <span className="pp-label">Quantity</span>
                <div className="pp-qty">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="pp-qty-num">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="pp-fitmodel">
                <div>
                  <span className="pp-fitmodel-k">Sleeves</span>
                  <span className="pp-fitmodel-v">
                    {productDetails?.variants?.[0]?.sleeves || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="pp-fitmodel-k">Feel</span>
                  <span className="pp-fitmodel-v">
                    {productDetails?.variants?.[0]?.feel || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pp-actions">
              <button
                className="btn btn--primary"
                onClick={
                  addedToCart ? () => navigate("/cartpage") : handleAddToCart
                }
              >
                {addedToCart ? "Go to Cart" : "Add To Cart"}
              </button>
              <button className="btn btn--outline" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* ---- details + delivery ---- */}
        <div className="pp-lower">
          <div className="pp-details">
            <h2 className="pp-h2">Product Details</h2>
            <dl className="pp-details-table">
              {DETAILS.map(([k, v]) => (
                <div className="pp-details-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* <div className="pp-delivery"> */}
          {/* <h2 className="pp-h2">Delivery Details</h2>

            <div className="pp-delivery-card">
              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <PinIcon />
                </span>
                <span>
                  Location not set{" "}
                  <a href="#location">Select delivery location</a>
                </span>
              </div>
              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <PinIcon />
                </span>

                <div className="pp-delivery-content">
                  {selectedAddress ? (
                    <>
                      <span className="pp-delivery-text">
                        Deliver to{" "}
                        <strong>
                          {selectedAddress.city} - {selectedAddress.pincode}
                        </strong>
                      </span>

                      <button
                        type="button"
                        className="pp-change-location"
                        onClick={() => setShowLocations(true)}
                      >
                        Change
                      </button>
                    </>
                  ) : (
                    <span className="pp-delivery-text">
                      Location not set{" "}
                      <button
                        type="button"
                        className="pp-location-link"
                        onClick={() => setShowLocations(true)}
                      >
                        Select delivery location
                      </button>
                    </span>
                  )}
                </div>
              </div>

              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <TruckIcon />
                </span>
                <span>
                  Delivery by 11 Sep, Fri
                  <br />
                  <em>Order in 00h 00m 00s</em>
                </span>
              </div>
            </div>

            <div className="pp-perks">
              <div className="pp-perk">
                <ShieldIcon />
                <span>Secure Pay</span>
              </div>
              <div className="pp-perk">
                <RefreshIcon />
                <span>Easy Exchange</span>
              </div>
              <div className="pp-perk">
                <TruckIcon size={20} />
                <span>Fast Delivery</span>
              </div>
              <div className="pp-perk">
                <QualityIcon />
                <span>Quality Check</span>
              </div>
            </div> */}

          {/* <div className="pp-delivery-card"> */}
          <div className="pp-delivery">
            <h2 className="pp-h2">Delivery Details</h2>

            <div className="pp-delivery-card">
              {/* Delivery location */}
              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <PinIcon />
                </span>

                <div className="pp-delivery-content">
                  {selectedAddress ? (
                    <>
                      <span className="pp-delivery-text">
                        Deliver to{" "}
                        <strong>
                          {selectedAddress.city} - {selectedAddress.pincode}
                        </strong>
                      </span>

                      <button
                        type="button"
                        className="pp-change-location"
                        onClick={() => setShowLocations(true)}
                      >
                        Change
                      </button>
                    </>
                  ) : (
                    <span className="pp-delivery-text">
                      Location not set{" "}
                      <button
                        type="button"
                        className="pp-location-link"
                        onClick={() => setShowLocations(true)}
                      >
                        Select delivery location
                      </button>
                    </span>
                  )}
                </div>
              </div>

              {/* Delivery date */}
              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <TruckIcon />
                </span>

                <span>
                  Delivery by 11 Sep, Fri
                  <br />
                  <em>Order in 00h 00m 00s</em>
                </span>
              </div>
            </div>

            {/* ================= LOCATION POPUP ================= */}

            {showLocations && (
              <div
                className="pp-location-overlay"
                onClick={() => setShowLocations(false)}
              >
                <div
                  className="pp-location-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="pp-location-header">
                    <h3>Select delivery location</h3>

                    <button
                      type="button"
                      className="pp-location-close"
                      onClick={() => setShowLocations(false)}
                    >
                      ×
                    </button>
                  </div>

                  {/* Address list */}
                  <div className="pp-location-list">
                    {deliveryAddresses.map((address) => (
                      <button
                        type="button"
                        key={address.id}
                        className={`pp-address-card ${
                          selectedAddress?.id === address.id
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedAddress(address);
                          setShowLocations(false);
                        }}
                      >
                        <span className="pp-address-icon">
                          <PinIcon />
                        </span>

                        <span className="pp-address-info">
                          <strong>{address.name}</strong>

                          <span>{address.address}</span>

                          <span>
                            {address.city}, {address.state}
                          </span>

                          <span>{address.pincode}</span>
                        </span>

                        {/* Radio */}
                        <span className="pp-address-radio">
                          {selectedAddress?.id === address.id && <span />}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Add address */}
                  <button
                    type="button"
                    className="pp-add-address"
                    onClick={() => setShowAddAddress(true)}
                  >
                    + Add New Address
                  </button>
                </div>
              </div>
            )}

            {showAddAddress && (
              <div
                className="pp-location-overlay"
                onClick={() => setShowAddAddress(false)}
              >
                <div
                  className="pp-location-modal pp-add-address-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pp-location-header">
                    <h3>Add New Address</h3>

                    <button
                      type="button"
                      className="pp-location-close"
                      onClick={() => setShowAddAddress(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="pp-address-form">
                    <div className="pp-form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        placeholder="Enter your name"
                        value={newAddress.name}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="pp-form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={newAddress.phone}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="pp-form-group">
                      <label>Address</label>
                      <textarea
                        placeholder="House No, Street, Area"
                        rows="3"
                        value={newAddress.address}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="pp-form-row">
                      <div className="pp-form-group">
                        <label>City</label>
                        <input
                          type="text"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              city: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="pp-form-group">
                        <label>State</label>
                        <input
                          type="text"
                          placeholder="State"
                          value={newAddress.state}
                          onChange={(e) =>
                            setNewAddress({
                              ...newAddress,
                              state: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="pp-form-group">
                      <label>Pincode</label>
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="6 digit pincode"
                        value={newAddress.pincode}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            pincode: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </div>

                    <div className="pp-form-actions">
                      <button
                        type="button"
                        className="pp-cancel-address"
                        onClick={() => setShowAddAddress(false)}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="pp-save-address"
                        onClick={handleSaveAddress}
                      >
                        Save Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Perks */}
            <div className="pp-perks">
              <div className="pp-perk">
                <ShieldIcon />
                <span>Secure Pay</span>
              </div>

              <div className="pp-perk">
                <RefreshIcon />
                <span>Easy Exchange</span>
              </div>

              <div className="pp-perk">
                <TruckIcon size={20} />
                <span>Fast Delivery</span>
              </div>

              <div className="pp-perk">
                <QualityIcon />
                <span>Quality Check</span>
              </div>
            </div>
          </div>
          {/* </div> */}
          {/* </div> */}
        </div>
      </section>

      {/* ============ REVIEWS SECTION ============ */}
      <section className="pp-reviews">
        <div className="pp-reviews-head">
          <div>
            <h2 className="pp-h1-serif">Real Women. Real Comfort.</h2>
            <div className="pp-reviews-score">
              <span className="pp-score-num">
                {productDetails?.rating || 0}
              </span>
              <div className="pp-reviews-score-meta">
                <Stars count={5} />
                <span>Based On {productDetails?.reviewCount || 0} Reviews</span>
              </div>
            </div>
          </div>
          <button className="btn btn--primary btn--pill">Write A Review</button>
        </div>

        <div className="pp-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`pp-filter ${activeFilter === f.id ? "is-active" : ""}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="pp-review-grid">
          {reviews.map((r) => (
            <article className="pp-review-card" key={r?._id}>
              <div className="pp-review-top">
                <Stars count={r.rating} />
                <span className="pp-review-time">
                  {formatTimeAgo(r?.createdAt)}
                </span>
              </div>

              {r.images && (
                <div className="pp-review-photos">
                  {r.images.map((src, i) => (
                    <img
                      className="pp-review-photo"
                      src={import.meta.env.VITE_API_URL + src}
                      alt=""
                      key={i}
                      onError={(e) => {
                        e.target.src = mainPhoto;
                      }}
                    />
                  ))}
                </div>
              )}

              <h3 className="pp-review-title">&ldquo;{r.title}&rdquo;</h3>
              <p className="pp-review-body">{r.comment}</p>

              <div className="pp-review-author">
                <div className="pp-avatar" />
                <div>
                  <div className="pp-author-name">
                    {r.user?.name || "Anonymous"}
                  </div>
                  <div className="pp-verified">
                    <span className="pp-verified-dot" /> Verified Buyer
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="pp-related-head">
          <h2 className="pp-h1-serif pp-h1-serif--black">You May Also Like</h2>
          <a onClick={(e) => navigate("/shop")} className="pp-explore">
            Explore All Shop
          </a>
        </div>

        <div className="pp-related-grid">
          {/* show only 4 data */}
          {RELATED?.slice(0, 4).map((p) => (
            <article className="pp-related-card" key={p.id}>
              <div className="pp-related-image">
                <button
                  className={`pp-wish ${
                    relatedWishlisted[p.id] ? "is-active" : ""
                  }`}
                  onClick={(e) => handleRelatedWishlist(e, p.id)}
                  disabled={wishlistLoading}
                  aria-label={
                    relatedWishlisted[p.id]
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                  }
                >
                  <Heart active={!!relatedWishlisted[p.id]} />
                </button>
                <img
                  className="pp-related-image-ph"
                  src={p.image}
                  alt={p.name}
                />
              </div>
              <h3 className="pp-related-name">{p.name}</h3>
              <p className="pp-related-sub">{p.subtitle}</p>
              <div className="pp-related-rating">
                <span>{p.rating}</span>
                <Star filled />
              </div>
              <div className="pp-related-price">₹{p.price}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

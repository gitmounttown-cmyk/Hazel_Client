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
import { updateNavbarCounts } from "../../../utils/navbarCounts";

/* ---------- real image assets ---------- */
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
import { getProductReviews, createReview } from "../../../Services/reviewService"; // ✅ Fixed: Imported public getProductReviews instead of admin getAllReviews
import { formatCurrency } from "../../../utils/currencyFormat";
import { formatTimeAgo, getDeliveryDate, formatCountdown } from "../../../utils/dateFormat";
import { useNavigate } from "react-router-dom";
import { getUserAddresses, getAddresses } from "../../../Services/addressService";
import Loader from "../../../Components/Loader/Loader";

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

const CameraPlusIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 8a2 2 0 0 1 2-2h2.2l1.3-2h7l1.3 2H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

/* ---------- NEW: size chart icon ---------- */
const RulerIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 17 17 3l4 4L7 21z" />
    <path d="m7 13 2 2M10 10l2 2M13 7l2 2" />
  </svg>
);

/* =====================================================
   NEW: SIZE CHART DATA  (all measurements in inches)
   ✏️  Edit the numbers below to match your real charts.
   ===================================================== */
const SIZE_CHARTS = {
  /* ---------- CO-ORD SET (Top + Bottom) ---------- */
  coord: {
    title: "Co-ord Size Chart",
    tables: [
      {
        name: "TOP",
        diagram: "top",
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        rows: [
          ["SHOULDER", 13.5, 14, 14.5, 15, 15.5, 16, 16.5],
          ["BUST", 34, 36, 38, 40, 42, 44, 46],
          ["HIPS", 36, 38, 40, 42, 44, 46, 48],
          ["WAIST", 30, 32, 34, 36, 38, 40, 42],
          ["FRONT LENGTH", 46, 46, 46, 46, 46, 46, 46],
        ],
      },
      {
        name: "BOTTOM",
        diagram: "bottom",
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        rows: [
          ["WAIST", 30, 32, 34, 36, 38, 40, 42],
          ["OUTSEAM LENGTH", 38, 38, 38, 38, 38, 38, 38],
          ["INSEAM LENGTH", 26, 26, 26, 26, 26, 26, 26],
        ],
      },
    ],
  },

  /* ---------- MAXI DRESS ---------- */
  /* ✏️ Sample values – replace with your real maxi measurements */
  maxi: {
    title: "Maxi Dress Size Chart",
    tables: [
      {
        name: "MAXI DRESS",
        diagram: "dress",
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"],
        rows: [
          ["SHOULDER", 13.5, 14, 14.5, 15, 15.5, 16, 16.5],
          ["BUST", 34, 36, 38, 40, 42, 44, 46],
          ["WAIST", 30, 32, 34, 36, 38, 40, 42],
          ["HIPS", 36, 38, 40, 42, 44, 46, 48],
          ["FRONT LENGTH", 52, 52, 52, 52, 52, 52, 52],
        ],
      },
    ],
  },

  /* ---------- MATERNITY WEAR ---------- */
  /* ✏️ Sample values – replace with your real maternity measurements */
  maternity: {
    title: "Maternity Wear Size Chart",
    tables: [
      {
        name: "MATERNITY",
        diagram: "dress",
        sizes: ["M", "L", "XL", "2XL", "3XL"],
        rows: [
          ["SHOULDER", 14.5, 15, 15.5, 16, 16.5],
          ["BUST", 38, 40, 42, 44, 46],
          ["WAIST", 36, 38, 40, 42, 44],
          ["HIPS", 40, 42, 44, 46, 48],
          ["FRONT LENGTH", 52, 52, 52, 52, 52],
        ],
      },
    ],
  },
};

/* Picks which chart to show from the product name / category */
const getSizeChartType = (product) => {
  const text = `${product?.name || ""} ${product?.category?.name || product?.category || ""}`;
  if (/maternity|feeding|nursing|pregnan/i.test(text)) return "maternity";
  if (/co-?\s?ord|coord|set/i.test(text)) return "coord";
  return "maxi";
};

/* ---------- NEW: measurement diagrams (responsive SVG) ---------- */
const ChartDiagram = ({ type }) => {
  const line = { stroke: "#222", strokeWidth: 1, fill: "none" };
  const dash = { stroke: "#222", strokeWidth: 1, strokeDasharray: "2 2", fill: "none" };
  const txt = { fontSize: 8, fill: "#222", fontFamily: "Poppins, sans-serif" };

  if (type === "bottom") {
    return (
      <svg viewBox="0 0 240 240" className="pp-sc-svg" role="img" aria-label="Bottom measurement guide">
        <text x="6" y="22" {...txt}>WAIST</text>
        <line x1="40" y1="20" x2="68" y2="20" {...line} />
        <line x1="70" y1="20" x2="150" y2="20" {...dash} />
        <path d="M70 24 H150 L158 226 H118 L110 96 L102 226 H62 Z" {...line} />
        <text x="6" y="126" {...txt}>INSEAM</text>
        <text x="6" y="136" {...txt}>LENGTH</text>
        <line x1="46" y1="130" x2="108" y2="130" {...line} />
        <line x1="108" y1="96" x2="108" y2="226" {...line} />
        <line x1="182" y1="22" x2="182" y2="228" {...line} />
        <text x="186" y="124" {...txt}>OUTSEAM</text>
        <text x="186" y="134" {...txt}>LENGTH</text>
      </svg>
    );
  }

  if (type === "dress") {
    return (
      <svg viewBox="0 0 240 240" className="pp-sc-svg" role="img" aria-label="Dress measurement guide">
        <path d="M88 24 L112 34 L136 24 L146 36 L142 72 L132 98 L166 228 H58 L92 98 L82 72 L78 36 Z" {...line} />
        <text x="6" y="30" {...txt}>SHOULDER</text>
        <line x1="50" y1="34" x2="80" y2="34" {...line} />
        <line x1="80" y1="30" x2="144" y2="30" {...dash} />
        <text x="6" y="66" {...txt}>BUST</text>
        <line x1="30" y1="64" x2="80" y2="64" {...line} />
        <line x1="80" y1="64" x2="144" y2="64" {...dash} />
        <text x="6" y="98" {...txt}>WAIST</text>
        <line x1="34" y1="96" x2="90" y2="96" {...line} />
        <line x1="90" y1="96" x2="134" y2="96" {...dash} />
        <text x="6" y="132" {...txt}>HIPS</text>
        <line x1="28" y1="130" x2="82" y2="130" {...line} />
        <line x1="82" y1="130" x2="142" y2="130" {...dash} />
        <line x1="190" y1="24" x2="190" y2="228" {...line} />
        <text x="194" y="122" {...txt}>FRONT</text>
        <text x="194" y="132" {...txt}>LENGTH</text>
      </svg>
    );
  }

  /* default: top */
  return (
    <svg viewBox="0 0 240 240" className="pp-sc-svg" role="img" aria-label="Top measurement guide">
      <path d="M86 24 L110 34 L134 24 L146 36 L170 120 L160 130 L150 80 L152 226 H70 L72 80 L62 130 L52 120 L76 36 Z" {...line} />
      <text x="4" y="22" {...txt}>SHOULDER</text>
      <line x1="46" y1="26" x2="78" y2="30" {...line} />
      <line x1="78" y1="30" x2="144" y2="30" {...dash} />
      <text x="4" y="70" {...txt}>BUST</text>
      <line x1="28" y1="68" x2="72" y2="68" {...line} />
      <line x1="72" y1="68" x2="150" y2="68" {...dash} />
      <text x="4" y="104" {...txt}>WAIST</text>
      <line x1="32" y1="102" x2="72" y2="102" {...line} />
      <line x1="72" y1="102" x2="150" y2="102" {...dash} />
      <text x="4" y="136" {...txt}>HIPS</text>
      <line x1="26" y1="134" x2="70" y2="134" {...line} />
      <line x1="70" y1="134" x2="152" y2="134" {...dash} />
      <line x1="196" y1="24" x2="196" y2="228" {...line} />
      <text x="200" y="122" {...txt}>FRONT</text>
      <text x="200" y="132" {...txt}>LENGTH</text>
    </svg>
  );
};

const FILTERS = [
  { id: "all", label: "All Reviews" },
  { id: "photos", label: "With Photos" },
  { id: "helpful", label: "Most Helpful" },
  { id: "five", label: "5 Stars" },
];

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
  "LIGHT ORCHID": { id: "light-orchid", hex: "#E6B7D1" },
  ROSE: { id: "rose", hex: "#E7CDD3" },
  BEIGE: { id: "beige", hex: "#F1E9DE" },
  MINT: { id: "mint", hex: "#E4F1DC" },
  AQUA: { id: "aqua", hex: "#DCF1EE" },
  LILAC: { id: "lilac", hex: "#DEDCF2" },
  BLUSH: { id: "blush", hex: "#F1DDDC" },
};

const FALLBACK_COLORS = [
  "#E8D5C4", "#D8E2DC", "#E2D4F0", "#F3D5B5", "#D6EAF8", "#F5CAC3", "#CDEAC0", "#E8C7C8",
];

const createColorId = (color) => {
  return color
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const REVIEW_MAX_IMAGES = 5;
const REVIEW_MAX_IMAGE_MB = 5;
const REVIEW_MAX_CHARS = 500;
const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

export default function ProductPage() {
  const storedUser = localStorage.getItem("hazelUser");
  const userId = storedUser ? JSON.parse(storedUser)?.id : null;
  const navigate = useNavigate();
  const [activeThumb, setActiveThumb] = useState(0);
  const [activeColor, setActiveColor] = useState("rose");
  const [activeSize, setActiveSize] = useState("L");
  const [qty, setQty] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");

  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [relatedWishlisted, setRelatedWishlisted] = useState({});

  const [productDetails, setProductDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [variantMedia, setVariantMedia] = useState([]);
  const [userDeliveryAddress, setUserDeliveryAddress] = useState(null);
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

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAPI, setLoadingAPI] = useState(false);

  /* NEW: size chart popup state */
  const [showSizeChart, setShowSizeChart] = useState(false);

  const { id } = useParams();
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(18, 0, 0, 0);
      if (now >= cutoff) {
        cutoff.setDate(cutoff.getDate() + 1);
      }
      const difference = Math.max(0, Math.floor((cutoff - now) / 1000));
      setCountdown(formatCountdown(difference));
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await getCart();
        const cart = response?.data?.cart || response?.cart;
        const items = cart?.items || [];
        setCartItems(items);
        // Update the navbar counts after fetching the cart
        const cartCount = cart?.totalItems || 0;
        // console.log("Fetched cart items:", items, "Cart count:", cartCount);
        updateNavbarCounts({
          cartCount: cartCount,
        });
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };
    fetchCartItems();
  }, []);

  // useEffect(() => {
  //   getProductById(id)
  //     .then((response) => {
  //       setProductDetails(response?.data?.data);
  //       if (response?.data?.data?.relatedProducts?.length > 0) {
  //         setRelatedProducts(response?.data?.data?.relatedProducts);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching product details:", error);
  //     });
  // }, [id]);


useEffect(() => {
  const fetchProductDetails = async () => {
    setLoading(true);
    setLoadingAPI(true);
    try {
      const response = await getProductById(id);

      setProductDetails(response?.data?.data);

      if (response?.data?.data?.relatedProducts?.length > 0) {
        setRelatedProducts(response.data.data.relatedProducts);
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
    } finally {
      setLoading(false);
      setLoadingAPI(false);
    }
  };

  fetchProductDetails();
}, [id]);

  useEffect(() => {
    if (!id) return;
    const checkProductWishlist = async () => {
      try {
        const response = await checkWishlist(id);
        // console.log("CHECK WISHLIST RESPONSE:", response);
        setWishlisted(
          response?.data?.isWishlisted ??
            response?.data?.wishlisted ??
            response?.data?.data?.isWishlisted ??
            false
        );
        // Update the navbar counts after checking the wishlist
        const wishlistCount = response?.data?.wishlistCount || 0;
        // console.log("CHECK WISHLIST COUNT:", wishlistCount);
        updateNavbarCounts({
          wishlistCount: wishlistCount
        });
      } catch (error) {
        console.error("CHECK WISHLIST ERROR:", error);
      }
    };
    checkProductWishlist();
  }, [id]);

  const handleRelatedWishlist = async (e, productId) => {
    e.stopPropagation();
    // if (!isLoggedIn()) {
    //   toast.error("Please log in to use wishlist.");
    //   return;
    // }
    // if (!productId) return;
    try {
      setWishlistLoading(true);
      const isCurrentlyWishlisted = relatedWishlisted[productId];
      if (isCurrentlyWishlisted) {
        const res = await removeWishlistItem(productId);
          // console.log("Remove wishlist response:", res);
          const wishlistCount = res?.data?.wishlistCount || 0;
          updateNavbarCounts({
            wishlistCount: wishlistCount,
          });
      
        setRelatedWishlisted((prev) => ({ ...prev, [productId]: false }));
        toast.success("Removed from wishlist");
      } else {
        const res = await addToWishlist({ productId });
          // console.log("Add to wishlist response:", res);
          const wishlistCount = res?.data?.wishlistCount || 0;
          updateNavbarCounts({
            wishlistCount: wishlistCount,
          });
          setRelatedWishlisted((prev) => ({ ...prev, [productId]: true }));
          toast.success("Added to wishlist");
        
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update wishlist");
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
      return variant.media.map((mediaItem) => mediaItem.imageURL);
    });
    const uniqueImages = [...new Set(images)];
    //get media index use thumbnailId
     const thumbnailMediaIndex = productDetails.variants.flatMap((variant) => variant.media?.map((mediaItem, index) => ({ mediaItem, index }))).find(({ mediaItem }) => mediaItem._id === productDetails.variants.find(v => v.thumbnailId)?.thumbnailId)?.index;
     console.log("Thumbnail media for product", productDetails._id, ":", thumbnailMediaIndex);
     setActiveThumb(thumbnailMediaIndex ?? 0);
    setVariantMedia(uniqueImages);
  }, [productDetails]);

  // ✅ Fixed: Replaced unauthorized getAllReviews() with public getProductReviews(id)
  useEffect(() => {
    if (!id) return;
    getProductReviews(id)
      .then((response) => {
        const productReviews = response?.data?.data || response?.data || [];
        setReviews(productReviews);
      })
      .catch((error) => {
        console.error("Error fetching product reviews:", error);
      });
  }, [id]);

  useEffect(() => {
    if (userId) {
      getAddresses()
        .then((response) => {
          const addresses = response?.data?.addresses || [];
          const userDefaultAddress = addresses.find((addr) => addr.isDefault);
          setUserDeliveryAddress(userDefaultAddress || null);
        })
        .catch((error) => {
          console.error("Error fetching user addresses:", error);
        });
    }
  }, [userId]);

  const COLOR_KEYWORDS = [
    { keywords: ["NAVY", "BLUE"], hex: "#1F3A5F" },
    { keywords: ["BLUE"], hex: "#4A90E2" },
    { keywords: ["MAROON"], hex: "#800000" },
    { keywords: ["RED"], hex: "#D32F2F" },
    { keywords: ["GREEN"], hex: "#6B8E23" },
    { keywords: ["SAGE"], hex: "#9CAF88" },
    { keywords: ["YELLOW"], hex: "#E6C229" },
    { keywords: ["MUSTARD"], hex: "#D4A017" },
    { keywords: ["ORANGE"], hex: "#E67E22" },
    { keywords: ["PINK"], hex: "#E8A0B8" },
    { keywords: ["PURPLE"], hex: "#7E57C2" },
    { keywords: ["VIOLET"], hex: "#7F5AA2" },
    { keywords: ["BROWN"], hex: "#795548" },
    { keywords: ["COFFEE"], hex: "#6F4E37" },
    { keywords: ["GREY", "GRAY"], hex: "#808080" },
    { keywords: ["BLACK"], hex: "#222222" },
    { keywords: ["WHITE"], hex: "#F8F8F8" },
    { keywords: ["CREAM"], hex: "#FFFDD0" },
    { keywords: ["BEIGE"], hex: "#D8C3A5" },
  ];

  const getColorHex = (colorName, index = 0) => {
    const name = colorName?.trim().toUpperCase();
    if (!name) return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    if (COLOR_MAP[name]) return COLOR_MAP[name].hex;
    const matchedColor = COLOR_KEYWORDS.find((color) =>
      color.keywords.some((keyword) => name.includes(keyword))
    );
    if (matchedColor) return matchedColor.hex;
    return FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  };

  const colors = [
    ...new Map(
      (productDetails?.variants || [])
        .map((variant, index) => {
          const colorName = variant.color?.trim().toUpperCase();
          if (!colorName) return null;
          return [
            colorName,
            {
              id: createColorId(colorName),
              hex: getColorHex(colorName, index),
              name: colorName,
              selected: index === 0,
            },
          ];
        })
        .filter(Boolean)
    ).values(),
  ];

  const SIZES =
    productDetails?.variants?.[0]?.sizes?.map((item) => {
      const inStock = item.isActive && item.stockQuantity > 0;
      return {
        id: item.size,
        label: inStock ? "In Stock" : "Out of Stock",
        disabled: !inStock,
        stockQuantity: item.stockQuantity,
      };
    }) || [];

  const selectedSize = SIZES.find((size) => size.id === activeSize);
  const maxQty = selectedSize?.stockQuantity || 0;

  useEffect(() => {
    const firstAvailableSize = SIZES.find((size) => !size.disabled);
    if (firstAvailableSize) {
      setActiveSize(firstAvailableSize.id);
      setQty(1);
    } else {
      setActiveSize(null);
      setQty(1);
    }
  }, [productDetails]);

  const selectedVariant =
    productDetails?.variants?.find((variant) => variant.isActive) ||
    productDetails?.variants?.[0];

  const DETAILS =
    selectedVariant?.details
      ?.filter(
        (item) =>
          item?.key &&
          item?.value &&
          item.value.trim() !== "" &&
          item.value !== "N/A" &&
          item.value !== "-"
      )
      .map((item) => [item.key, item.value]) || [];

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!id) return;
    try {
      setWishlistLoading(true);
      if (wishlisted) {
        const response = await removeWishlistItem(id).then((res) => {
          // console.log("Remove wishlist response:", res);
          const wishlistCount = res?.data?.wishlistCount || 0;
          updateNavbarCounts({ wishlistCount: wishlistCount });
          return res;
        });

        setWishlisted(false);

        if (response?.data) {
          toast.success(response?.data?.message || "Removed from wishlist");
        }
      } else {
        const response = await addToWishlist({ productId: id }).then((res) => {
          // console.log("Add to wishlist response:", res);
          const wishlistCount = res?.data?.wishlistCount || 0;
          updateNavbarCounts({ wishlistCount: wishlistCount });
          return res;
        });
        setWishlisted(true);
        if (response?.data) {
          toast.success(response?.data?.message || "Added to wishlist");
          const checkResponse = await checkWishlist(id);
          setWishlisted(
            checkResponse?.data?.isWishlisted ??
              checkResponse?.data?.wishlisted ??
              checkResponse?.data?.data?.isWishlisted ??
              true
          );
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update wishlist");
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const cartItem = {
      productId: productDetails._id,
      variantId: selectedVariant._id,
      color: selectedVariant.color,
      size: activeSize,
      quantity: qty,
    };
    const response = await addToCart(cartItem);
    if (response.success) {
      const updatedCartResponse = await getCart();
      const updatedCart = updatedCartResponse?.data?.cart || updatedCartResponse?.cart;
      setCartItems(updatedCart?.items || []);
      toast.success("Product added");
      // Update the navbar counts after adding to cart
      const cartCount = updatedCart?.items?.length || 0;
      updateNavbarCounts({
        cartCount: cartCount,
      });
    } else {
      toast.error(response?.message || "Failed to add item to cart.");
    }
  };

  const handleBuyNow = (productId, variantId) => {
    const itemExistsInCart = cartItems.some(
      (item) => String(item?.product?._id || item?.productId) === String(productId)
    );
    if (!itemExistsInCart) {
      handleAddToCart().then(() => {
        navigate("/checkout");
      });
    } else {
      navigate("/checkout");
    }
  };

  const handleOpenReviewModal = () => {
    if (!isLoggedIn()) {
      toast.error("Please log in to write a review.");
      return;
    }
    let savedName = "";
    try {
      savedName = storedUser ? JSON.parse(storedUser)?.name || "" : "";
    } catch (error) {
      savedName = "";
    }
    setReviewName(savedName);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    reviewImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setReviewImages([]);
    setReviewRating(0);
    setReviewHover(0);
    setReviewName("");
    setReviewComment("");
    setReviewSubmitting(false);
    setShowReviewModal(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) {
      toast.error("Please select a star rating");
      return;
    }
    if (!reviewName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (reviewComment.trim().length < 10) {
      toast.error("Please write at least 10 characters in your review");
      return;
    }

    try {
      setReviewSubmitting(true);
      const payload = {
        productId: id,
        rating: reviewRating,
        title: reviewComment.slice(0, 50),
        comment: reviewComment.trim(),
      };

      const response = await createReview(payload);
      if (response?.data?.success || response?.success) {
        toast.success("Thank you! Your review has been submitted");
        const newReview = response?.data?.data || response?.data;
        setReviews((prev) => [newReview, ...prev]);
        closeReviewModal();
      } else {
        toast.error(response?.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("SUBMIT REVIEW ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    if (!showReviewModal) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeReviewModal();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showReviewModal]);

  /* NEW: size chart popup – Esc to close + lock page scroll */
  useEffect(() => {
    if (!showSizeChart) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowSizeChart(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showSizeChart]);

  const RELATED = relatedProducts.map((product) => {
    const variant = product.variants?.[0];
    return {
      id: product._id,
      name: product.name,
      subtitle: `${variant?.fabric || ""} · ${variant?.color || ""}`,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      price: formatCurrency(variant?.discountPrice || variant?.price || 0),
      image: import.meta.env.VITE_UPLOAD_URL + (variant?.media?.[0]?.imageURL || ""),
    };
  });

  const existingCartItem = cartItems?.find(
    (item) =>
      String(item.product?._id) === String(productDetails?._id) &&
      item.size?.toUpperCase() === activeSize?.toUpperCase()
  );

  const addedToCart = !!existingCartItem;

  const selectUserDeliveryAddress = (address) => {
    if (!isLoggedIn()) {
      toast.error("Please log in to select a delivery address.");
      return;
    }
    navigate("/account", {
      state: {
        selectedAddress: address,
        productId: productDetails?._id,
        variantId: selectedVariant?._id,
      },
    });
  };

  /* NEW: chart to display for this product */
  const sizeChart = SIZE_CHARTS[getSizeChartType(productDetails)];

// console.log("variantMedia Details:", variantMedia);
// console.log('activeThumb:', activeThumb);
  return (
    <div className="pp">
      <Loader show={loadingAPI} />
      <section className="pp-product">
        <div className="pp-breadcrumb">
          <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {productDetails?.name || "Product Name"}
        </div>

        <div className="pp-grid">
          <div className="pp-gallery-panel">
            <div className="pp-main-image">
              <img
                className="pp-main-image-ph"
                src={import.meta.env.VITE_UPLOAD_URL + (variantMedia[activeThumb] || mainPhoto)}
                alt={productDetails?.name || "Admire Maxi"}
                onError={(e) => {
                  e.target.src = mainPhoto;
                }}
              />
            </div>
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
                    alt={`View ${i + 1}`}
                    onError={(e) => {
                      e.target.src = mainPhoto;
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="pp-info">
            <div className="pp-eyebrow">
              {productDetails?.variants?.[0]?.fabric || null}
            </div>

            <div className="pp-title-row">
              <h1 className="pp-title">{productDetails?.name || null}</h1>
              <button
                className={`pp-wish ${wishlisted ? "is-active" : ""}`}
                onClick={handleWishlist}
                disabled={wishlistLoading}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
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
                ({productDetails?.reviewCount || reviews.length} Reviews)
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

            {/* ================= NEW: SIZE CHART (between color & size) ================= */}
            <div className="pp-block pp-sc-block">
              <button
                type="button"
                className="pp-sc-trigger"
                onClick={() => setShowSizeChart(true)}
              >
                <RulerIcon />
                <span>Size Chart</span>
              </button>
            </div>

            <div className="pp-block">
              <div className="pp-label-row">
                <span className="pp-label">Select Size</span>
              </div>
              <div className="pp-sizes">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    disabled={s.disabled}
                    className={`pp-size ${activeSize === s.id ? "is-active" : ""} ${
                      s.disabled ? "is-disabled" : ""
                    }`}
                    onClick={() => {
                      if (!s.disabled) {
                        setActiveSize(s.id);
                        setQty(1);
                      }
                    }}
                  >
                    <span className="pp-size-id">{s.id}</span>
                    <span className="pp-size-note">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pp-block pp-qty-row">
              {selectedSize && (
                <div>
                  <span className="pp-label">Quantity</span>
                  <div className="pp-qty">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="pp-qty-num">{qty}</span>
                    <button
                      onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                      disabled={qty >= maxQty}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  {maxQty > 1 && <small>{maxQty} available</small>}
                </div>
              )}
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
                onClick={() => {
                  if (addedToCart) {
                    navigate("/cartpage");
                  } else {
                    handleAddToCart();
                  }
                }}
              >
                {addedToCart ? "Go to Cart" : "Add To Cart"}
              </button>
              <button
                className="btn--outline"
                onClick={() => handleBuyNow(productDetails?._id, selectedVariant?._id)}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="pp-lower">
          <div className="pp-details">
            <h2 className="pp-h2">Product Details</h2>
            <dl className="pp-details-table">
              {DETAILS.filter(([k, v]) => {
                if (k === "Lining") {
                  return v?.trim() && v !== "N/A" && v !== "-";
                }
                return true;
              }).map(([k, v]) => (
                <div className="pp-details-row" key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="pp-delivery">
            <h2 className="pp-h2">Delivery Details</h2>
            <div className="pp-delivery-card">
              <div className="pp-delivery-row">
                <span className="pp-delivery-icon">
                  <PinIcon />
                </span>
                <div className="pp-delivery-content">
                  {userDeliveryAddress ? (
                    <>
                      <span className="pp-delivery-text">
                        Deliver to{" "}
                        <strong>
                          {userDeliveryAddress.city} - {userDeliveryAddress.pincode}
                        </strong>
                      </span>
                      <button
                        type="button"
                        className="pp-change-location"
                        onClick={() => selectUserDeliveryAddress()}
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
                        onClick={() => selectUserDeliveryAddress()}
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
                  Delivery by {getDeliveryDate(7)}
                  <br />
                  <em>Order in {countdown}</em>
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
            </div>
          </div>
        </div>
      </section>

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
                <span>Based On {reviews.length} Reviews</span>
              </div>
            </div>
          </div>
          <button
            className="btn btn--primary btn--pill"
            onClick={handleOpenReviewModal}
          >
            Write A Review
          </button>
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
          {reviews.length === 0 ? (
            <p className="pp-no-reviews">No reviews yet for this product. Be the first to review!</p>
          ) : (
            reviews.map((r) => (
              <article className="pp-review-card" key={r?._id}>
                <div className="pp-review-top">
                  <Stars count={r.rating} />
                  <span className="pp-review-time">
                    {formatTimeAgo(r?.createdAt)}
                  </span>
                </div>

                {r.images && r.images.length > 0 && (
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

                <h3 className="pp-review-title">&ldquo;{r.title || "Great product"}&rdquo;</h3>
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
            ))
          )}
        </div>

        <div className="pp-related-head">
          <h2 className="pp-h1-serif pp-h1-serif--black">You May Also Like</h2>
          <a onClick={() => navigate("/shop")} className="pp-explore">
            Explore All Shop
          </a>
        </div>

        <div className="pp-related-grid">
          {RELATED?.slice(0, 4).map((p) => (
            <article className="pp-related-card" key={p.id} onClick={() => navigate(`/product/${p.id}`)}>
              <div className="pp-related-image">
                <button
                  className={`pp-wish ${relatedWishlisted[p.id] ? "is-active" : ""}`}
                  onClick={(e) => handleRelatedWishlist(e, p.id)}
                  disabled={wishlistLoading}
                  aria-label={relatedWishlisted[p.id] ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart active={!!relatedWishlisted[p.id]} />
                </button>
                <img
                  className="pp-related-image-ph"
                  src={p.image}
                  alt={p.name}
                  onError={(e) => {
                    e.target.src = mainPhoto;
                  }}
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

      {showReviewModal && (
        <div className="pp-rvm-overlay" onClick={closeReviewModal}>
          <div
            className="pp-rvm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pp-rvm-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pp-rvm-header">
              <h3 id="pp-rvm-title">Write A Review</h3>
              <button
                type="button"
                className="pp-rvm-close"
                onClick={closeReviewModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="pp-rvm-form" onSubmit={handleSubmitReview}>
              <div className="pp-rvm-body">
                {productDetails?.name && (
                  <div className="pp-rvm-product">
                    Reviewing <strong>{productDetails.name}</strong>
                  </div>
                )}

                <div className="pp-rvm-field">
                  <span className="pp-rvm-label">
                    Your Rating <em>*</em>
                  </span>
                  <div
                    className="pp-rvm-stars"
                    onMouseLeave={() => setReviewHover(0)}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        className="pp-rvm-star"
                        onClick={() => setReviewRating(n)}
                        onMouseEnter={() => setReviewHover(n)}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      >
                        <Star filled={n <= (reviewHover || reviewRating)} />
                      </button>
                    ))}
                    <span className="pp-rvm-rating-text">
                      {RATING_LABELS[reviewHover || reviewRating]}
                    </span>
                  </div>
                </div>

                <div className="pp-rvm-field">
                  <label className="pp-rvm-label" htmlFor="pp-rvm-name">
                    Your Name <em>*</em>
                  </label>
                  <div className="pp-rvm-profile">
                    <div className="pp-rvm-avatar" aria-hidden="true">
                      {(reviewName.trim().charAt(0) || "?").toUpperCase()}
                    </div>
                    <input
                      id="pp-rvm-name"
                      className="pp-rvm-input"
                      type="text"
                      placeholder="Enter your name"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      maxLength={60}
                    />
                  </div>
                </div>

                <div className="pp-rvm-field">
                  <label className="pp-rvm-label" htmlFor="pp-rvm-comment">
                    Your Review <em>*</em>
                  </label>
                  <textarea
                    id="pp-rvm-comment"
                    className="pp-rvm-input pp-rvm-textarea"
                    rows="4"
                    placeholder="Tell us about the fabric, fit and comfort..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    maxLength={REVIEW_MAX_CHARS}
                  />
                  <span className="pp-rvm-count">
                    {reviewComment.length}/{REVIEW_MAX_CHARS}
                  </span>
                </div>
              </div>

              <div className="pp-rvm-footer">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={closeReviewModal}
                  disabled={reviewSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={reviewSubmitting}
                >
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= NEW: SIZE CHART POPUP ================= */}
      {showSizeChart && sizeChart && (
        <div className="pp-sc-overlay" onClick={() => setShowSizeChart(false)}>
          <div
            className="pp-sc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pp-sc-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pp-sc-header">
              <h3 id="pp-sc-title">{sizeChart.title}</h3>
              <button
                type="button"
                className="pp-sc-close"
                onClick={() => setShowSizeChart(false)}
                aria-label="Close size chart"
              >
                ×
              </button>
            </div>

            <div className="pp-sc-body">
              {sizeChart.tables.map((t) => (
                <div className="pp-sc-section" key={t.name}>
                  <p className="pp-sc-note">
                    All measurements are in <span>inches</span>
                  </p>
                  <div className="pp-sc-row">
                    <div className="pp-sc-table-wrap">
                      <table className="pp-sc-table">
                        <thead>
                          <tr>
                            <th className="pp-sc-title-cell" colSpan={t.sizes.length + 1}>
                              {t.name}
                            </th>
                          </tr>
                          <tr>
                            <th className="pp-sc-head">SIZE</th>
                            {t.sizes.map((s) => (
                              <th className="pp-sc-size" key={s}>
                                {s}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {t.rows.map(([label, ...values]) => (
                            <tr key={label}>
                              <th className="pp-sc-head">{label}</th>
                              {values.map((v, i) => (
                                <td key={i}>{v}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pp-sc-diagram">
                      <ChartDiagram type={t.diagram} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
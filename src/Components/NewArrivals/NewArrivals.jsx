import { useState, useEffect } from "react";
import "./NewArrivals.css";

// import API from "../../Services/api";
import axiosInstance from "../../api/axiosInstance";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }
    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/")) {
      return `http://localhost:5004${image}`;
    }

    return `http://localhost:5004/${image}`;
  };

  const getVariantImage = (product) => {
    if (!product || !Array.isArray(product.variants)) {
      return "";
    }

    const variant = product.variants.find(
      (item) =>
        item &&
        item.isActive !== false &&
        Array.isArray(item.media) &&
        item.media.length > 0,
    );

    if (!variant) {
      return "";
    }

    const imageMedia = variant.media.find(
      (media) => media && media.type === "image" && media.imageURL,
    );

    if (!imageMedia) {
      return "";
    }

    return getImageUrl(imageMedia.imageURL);
  };

  const getActiveVariant = (product) => {
    if (
      !product ||
      !Array.isArray(product.variants) ||
      product.variants.length === 0
    ) {
      return null;
    }

    return (
      product.variants.find(
        (variant) => variant && variant.isActive !== false,
      ) || product.variants[0]
    );
  };

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await axiosInstance.get("/newArrivals/all");

        if (!response.data?.success) {
          return;
        }

        const arrivals = response.data.data || [];

        const formattedProducts = [];

        arrivals.forEach((arrival) => {
          if (
            !Array.isArray(arrival.products) ||
            arrival.products.length === 0
          ) {
            return;
          }

          arrival.products.forEach((item, index) => {
            const product = item?.product;

            if (!product) {
              return;
            }

            const variant = getActiveVariant(product);
            const descriptionAbout = product.description?.about || "";

            // const descriptionItemDetails =
            //   product.description?.itemDetails || "";

            const description =
              descriptionAbout || descriptionItemDetails || "";

            const price =
              variant?.discountPrice !== null &&
              variant?.discountPrice !== undefined
                ? variant.discountPrice
                : (variant?.price ?? 0);

            const sizes = Array.isArray(variant?.sizes)
              ? variant.sizes
                  .filter(
                    (sizeItem) =>
                      sizeItem && sizeItem.isActive !== false && sizeItem.size,
                  )
                  .map((sizeItem) => sizeItem.size)
                  .join(" | ")
              : "";

            const backendImage = item?.image || getVariantImage(product);

            const rating = product.rating ?? product.averageRating ?? null;

            const prints = variant?.prints ?? product?.prints ?? null;

            formattedProducts.push({
              id:
                item?._id ||
                product?._id ||
                `${arrival?._id || "arrival"}-${index}`,

              name: product.name || "New Arrival",

              tagline: arrival.subtitle || "LATEST COLLECTION",

              description,

              rating,

              prints,

              sizes,

              price,

              image: getImageUrl(backendImage),
            });
          });
        });

        setProducts(formattedProducts);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Failed to fetch New Arrivals:", error);
      }
    };

    fetchNewArrivals();
  }, []);

  useEffect(() => {
    if (products.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % products.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [products.length]);

  if (products.length === 0) {
    return null;
  }

  const activeProduct = products[selectedIndex];

  const thumbnailProducts = products
    .map((product, index) => ({
      ...product,
      originalIndex: index,
    }))
    .filter((_, index) => index !== selectedIndex)
    .slice(0, 3);

  const metaItems = [];

  if (
    activeProduct.rating !== null &&
    activeProduct.rating !== undefined &&
    activeProduct.rating !== ""
  ) {
    metaItems.push(`${activeProduct.rating} ★`);
  }

  if (activeProduct.prints) {
    metaItems.push(activeProduct.prints);
  }

  if (activeProduct.sizes) {
    metaItems.push(activeProduct.sizes);
  }

  return (
    <section className="new-arrivals-section">
      <h2 className="new-arrivals-heading">Our New Arrivals</h2>

      <div className="new-arrivals-container">
        <div className="main-feature-card">
          <div className="main-img-wrapper">
            {activeProduct.image ? (
              <img
                src={activeProduct.image}
                alt={activeProduct.name}
                className="main-feature-img"
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#5A1827",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="feature-details-pane">
          <span className="product-tagline">{activeProduct.tagline}</span>

          <h3 className="product-title">{activeProduct.name}</h3>

          <p className="product-desc">{activeProduct.description}</p>

          {metaItems.length > 0 && (
            <div className="product-meta">
              {metaItems.map((item, index) => (
                <span key={`${item}-${index}`}>
                  {index > 0 && <span className="meta-dot"> • </span>}

                  {item}
                </span>
              ))}
            </div>
          )}

          <div className="product-price">
            ₹{Number(activeProduct.price || 0).toLocaleString("en-IN")}
          </div>

          <button className="shop-now-btn" type="button">
            SHOP NOW
          </button>
        </div>
      </div>

      <div className="thumbnail-slots-row">
        {thumbnailProducts.map((item) => (
          <div
            key={item.id}
            className="thumbnail-slot-card"
            onClick={() => setSelectedIndex(item.originalIndex)}
          >
            <div className="thumb-img-box">
              {item.image ? (
                <img src={item.image} alt={item.name} className="thumb-img" />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#5A1827",
                    fontSize: "12px",
                  }}
                >
                  No Image
                </div>
              )}
            </div>

            <div className="thumb-info">
              <h4 className="thumb-title">{item.name}</h4>

              <span className="thumb-price">
                ₹{Number(item.price || 0).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;

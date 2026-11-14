import { useState, useEffect, useRef } from "react";
import { createProduct, updateProduct } from "../../../../services/productService";
import { getCategories } from "../../../../services/categoryService";
import { getBrands } from "../../../../services/brandService";
import { compressProductImage } from "../../../../utils/compressImage";
import toast from "react-hot-toast";
import {
  getSizeCharts,
  getSizeChartById,
  createSizeChart,
  updateSizeChart,
} from "../../../../Services/sizeChartService";
import { Plus, Trash2, Upload, RefreshCw, X } from "lucide-react";
import "./productForm.css";
import "../sizechart/sizeChart.css";
import defaultImage from "../../../../../public/defaultimage.png"; // Import the default image

const IMAGE_BASE_URL =
  import.meta.env.VITE_UPLOAD_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5004";

const DEFAULT_SC_PARAMETERS = [
  "SHOULDER",
  "BUST",
  "WAIST",
  "HIPS",
  "FRONT LENGTH",
];

const DEFAULT_SC_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const createDefaultScTable = (name = "TOP", sizes = DEFAULT_SC_SIZES) => ({
  tableName: name,
  image: "",
  images: [],
  sizes: [...sizes],
  rows: DEFAULT_SC_PARAMETERS.map((param) => ({
    parameter: param,
    values: {},
  })),
});

// Helper function to resolve cleaned image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_UPLOAD_URL || import.meta.env.VITE_API_URL || "http://localhost:5004";

  let cleanPath = imagePath;
  if (cleanPath.includes("uploads")) {
    cleanPath = "/uploads/" + cleanPath.split("uploads").pop().replace(/\\/g, "/").replace(/^\//, "");
  } else if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }

  const normalizedBase = baseUrl.replace(/\/+$/, "");
  return `${normalizedBase}${cleanPath}`;
};

const ALLOWED_SIZES = ["S", "M", "L", "XL", "2XL", "3XL"];

let localIdCounter = 0;
const nextLocalId = () => `local-${Date.now()}-${localIdCounter++}`;

const emptySize = () => ({
  localId: nextLocalId(),
  size: "",
  stockQuantity: "",
  isActive: true,
});

const emptyVariant = () => ({
  localId: nextLocalId(),
  color: "",
  fabric: "",
  feel: "",
  lining: "",
  sleeves: "",
  finishing: "",
  pocket: "",
  price: "",
  discountPrice: "",
  offerType: "none",
  offerValue: "",
  offerStartDate: "",
  offerEndDate: "",
  isActive: true,
  sizes: [emptySize()],
  existingMedia: [],
  // NEW: Thumbnail and deletion fields
  thumbnailId: null,
  thumbnailPendingIndex: null,
  removedMediaIds: [],

  pendingFiles: [],
  pendingPreviews: [],
  details: []
});

// const variantsFromProduct = (product) => {
//   if (!product?.variants?.length) return [emptyVariant()];

//   return product.variants.map((v) => ({
//     localId: nextLocalId(),
//     color: v.color || "",
//     fabric: v.fabric || "",
//     feel: v.feel || "",
//     lining: v.lining || "",
//     sleeves: v.sleeves || "",
//     finishing: v.finishing || "",
//     pocket: v.pocket || "",
//     price: v.price ?? "",
//     discountPrice: v.discountPrice ?? "",
//     offerType: v.offer?.type || "none",
//     offerValue: v.offer?.value ?? "",
//     offerStartDate: v.offer?.startDate ? v.offer.startDate.substring(0, 10) : "",
//     offerEndDate: v.offer?.endDate ? v.offer.endDate.substring(0, 10) : "",
//     isActive: v.isActive !== undefined ? v.isActive : true,
//     sizes:
//       v.sizes?.length > 0
//         ? v.sizes.map((s) => ({
//             localId: nextLocalId(),
//             size: s.size || "",
//             stockQuantity: s.stockQuantity ?? "",
//             isActive: s.isActive !== undefined ? s.isActive : true,
//           }))
//         : [emptySize()],
//     existingMedia: v.media || [],
//      // NEW: Thumbnail and deletion fields
//       thumbnailId: v.thumbnailId || media[0]?._id || null,
//       thumbnailPendingIndex: null,
//       removedMediaIds: [],
      
//     pendingFiles: [],
//     pendingPreviews: [],
//     details: v.details?.length > 0
//       ? v.details.map((d) => ({
//           localId: nextLocalId(),
//           key: d.key || "",
//           value: d.value || "",
//         }))
//       : [],
//   }));
// };


const variantsFromProduct = (product) => {
  if (!product?.variants?.length) return [emptyVariant()];

  return product.variants.map((v) => {
    const media = v.media || [];

    return {
      localId: nextLocalId(),
      color: v.color || "",
      fabric: v.fabric || "",
      feel: v.feel || "",
      lining: v.lining || "",
      sleeves: v.sleeves || "",
      finishing: v.finishing || "",
      pocket: v.pocket || "",
      price: v.price ?? "",
      discountPrice: v.discountPrice ?? "",

      offerType: v.offer?.type || "none",
      offerValue: v.offer?.value ?? "",
      offerStartDate: v.offer?.startDate
        ? v.offer.startDate.substring(0, 10)
        : "",
      offerEndDate: v.offer?.endDate
        ? v.offer.endDate.substring(0, 10)
        : "",

      isActive: v.isActive !== undefined ? v.isActive : true,

      sizes:
        v.sizes?.length > 0
          ? v.sizes.map((s) => ({
              localId: nextLocalId(),
              size: s.size || "",
              stockQuantity: s.stockQuantity ?? "",
              isActive:
                s.isActive !== undefined ? s.isActive : true,
            }))
          : [emptySize()],

      // Existing media from backend
      existingMedia: media,

      // NEW: Thumbnail and deletion fields
      thumbnailId: v.thumbnailId || media[0]?._id || null,
      thumbnailPendingIndex: null,
      removedMediaIds: [],

      // Newly selected media
      pendingFiles: [],
      pendingPreviews: [],

      details:
        v.details?.length > 0
          ? v.details.map((d) => ({
              localId: nextLocalId(),
              key: d.key || "",
              value: d.value || "",
            }))
          : [],
    };
  });
};


const ProductForm = ({ product, onClose, onSuccess }) => {
  const [categoryId, setCategoryId] = useState(product?.categoryId?._id || product?.categoryId || "");
  const [brandId, setBrandId] = useState(product?.brandId?._id || product?.brandId || "");
  const [sizeChartId, setSizeChartId] = useState(product?.sizeChartId?._id || product?.sizeChartId || "");
  const [name, setName] = useState(product?.name || "");
  const [about, setAbout] = useState(product?.description?.about || "");
  const [itemDetails, setItemDetails] = useState(product?.description?.itemDetails || "");
  const [isActive, setIsActive] = useState(product?.isActive !== undefined ? product.isActive : true);
console.log("ProductForm initialized with product:", product);
  const [variants, setVariants] = useState(variantsFromProduct(product));

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizeCharts, setSizeCharts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Dedicated Product Size Chart state (each product has its own separate size chart)
  const [scMode, setScMode] = useState("create_separate");
  const [selectedExistingScId, setSelectedExistingScId] = useState(
    product?.sizeChartId?._id || product?.sizeChartId || ""
  );
  const [scUnit, setScUnit] = useState("inches");
  const [scTables, setScTables] = useState(() => [createDefaultScTable("TOP", DEFAULT_SC_SIZES)]);
  const [scExistingImages, setScExistingImages] = useState([]);
  const [scNewImageFiles, setScNewImageFiles] = useState([]);
  const [scTableImageFiles, setScTableImageFiles] = useState({});
  const [scNewSizeInputs, setScNewSizeInputs] = useState({});
  const [scNewParamInputs, setScNewParamInputs] = useState({});
  const [isSizeChartLoaded, setIsSizeChartLoaded] = useState(false);
  const scDragRef = useRef(null);

  // Populate size chart data when editing an existing product
  useEffect(() => {
    if (!product?.sizeChartId) return;

    // const populateChart = (sc) => {
    //   if (!sc) return;
    //   if (sc.unit) setScUnit(sc.unit);
    //   if (Array.isArray(sc.tables) && sc.tables.length > 0) {
    //     setScTables(
          
    //       sc.tables.map((t) => (
    //         console.log("Populating size chart tables from existing size chart:", t.sizes),
    //         {

    //         tableName: t.tableName || "STANDARD",
    //         image: t.image || "",
    //         images: Array.isArray(t.images) ? [...t.images] : (t.image ? [t.image] : []),
    //         sizes: Array.isArray(t.sizes) ? [...t.sizes] : [...DEFAULT_SC_SIZES],
    //         rows:
    //           Array.isArray(t.rows) && t.rows.length > 0
    //             ? t.rows.map((r) => ({
    //                 parameter: r.parameter || "",
    //                 values: { ...(r.values || {}) },
    //               }))
    //             : DEFAULT_SC_PARAMETERS.map((p) => ({ parameter: p, values: {} })),
    //       }))
    //     );
    //   }
    //   const imgs =
    //     Array.isArray(sc.images) && sc.images.length > 0
    //       ? [...sc.images]
    //       : sc.image
    //       ? [sc.image]
    //       : [];
    //   setScExistingImages(imgs);
    //   setSelectedExistingScId(sc._id);
    //   setScMode("create_separate");
    // };

    const populateChart = (sc) => {
      if (!sc) return;

      if (sc.unit) setScUnit(sc.unit);

      if (Array.isArray(sc.tables) && sc.tables.length > 0) {
        setScTables(
          sc.tables.map((t) => ({
            tableName: t.tableName || "STANDARD",
            image: t.image || "",
            images: Array.isArray(t.images)
              ? [...t.images]
              : t.image
                ? [t.image]
                : [],
            sizes: Array.isArray(t.sizes)
              ? [...t.sizes]
              : [...DEFAULT_SC_SIZES],
            rows: Array.isArray(t.rows) && t.rows.length > 0
              ? t.rows.map((r) => ({
                parameter: r.parameter || "",
                values: { ...(r.values || {}) },
              }))
              : DEFAULT_SC_PARAMETERS.map((p) => ({
                parameter: p,
                values: {},
              })),
          }))
        );
      }

      const imgs = Array.isArray(sc.images) && sc.images.length > 0
        ? [...sc.images]
        : sc.image
          ? [sc.image]
          : [];

      setScExistingImages(imgs);
      setSelectedExistingScId(sc._id);
      setScMode("create_separate");
      setIsSizeChartLoaded(true);

      // Keep your remaining existing code here
    };

    if (typeof product.sizeChartId === "object" && product.sizeChartId._id) {
      populateChart(product.sizeChartId);
    } else if (typeof product.sizeChartId === "string") {
      getSizeChartById(product.sizeChartId)
        .then((res) => populateChart(res.data?.data))
        .catch((err) => console.error("Failed to load product size chart:", err));
    }
  }, [product]);

  // const tableSizeChartId =
  //   typeof product?.sizeChartId === "object"
  //     ? product?.sizeChartId?._id
  //     : product?.sizeChartId;

  // useEffect(() => {
  //   if (!tableSizeChartId) return;

  //   const populateChart = (sc) => {
  //     if (!sc) return;

  //     if (sc.unit) {
  //       setScUnit(sc.unit);
  //     }

  //     if (Array.isArray(sc.tables) && sc.tables.length > 0) {
  //       setScTables(
  //         sc.tables.map((t) => ({
  //           tableName: t.tableName || "STANDARD",
  //           image: t.image || "",
  //           images: Array.isArray(t.images)
  //             ? [...t.images]
  //             : t.image
  //               ? [t.image]
  //               : [],

  //           // Preserve saved size order
  //           sizes: Array.isArray(t.sizes)
  //             ? [...t.sizes]
  //             : [...DEFAULT_SC_SIZES],

  //           rows:
  //             Array.isArray(t.rows) && t.rows.length > 0
  //               ? t.rows.map((r) => ({
  //                 parameter: r.parameter || "",
  //                 values: { ...(r.values || {}) },
  //               }))
  //               : DEFAULT_SC_PARAMETERS.map((p) => ({
  //                 parameter: p,
  //                 values: {},
  //               })),
  //         }))
  //       );
  //     }

  //     const imgs =
  //       Array.isArray(sc.images) && sc.images.length > 0
  //         ? [...sc.images]
  //         : sc.image
  //           ? [sc.image]
  //           : [];

  //     setScExistingImages(imgs);
  //     setSelectedExistingScId(sc._id);
  //     setScMode("create_separate");
  //   };

  //   if (
  //     typeof product.sizeChartId === "object" &&
  //     product.sizeChartId?._id
  //   ) {
  //     populateChart(product.sizeChartId);
  //   } else {
  //     getSizeChartById(tableSizeChartId)
  //       .then((res) => populateChart(res.data?.data))
  //       .catch((err) =>
  //         console.error("Failed to load product size chart:", err)
  //       );
  //   }
  // }, [tableSizeChartId]);
  // Collect all unique sizes currently entered in Color Variants
  // const getProductVariantSizes = () => {
  //   const collected = [];
  //   variants.forEach((v) => {
  //     (v.sizes || []).forEach((s) => {
  //       if (s?.size && String(s.size).trim()) {
  //         collected.push(String(s.size).trim().toUpperCase());
  //       }
  //     });
  //   });
  //   return Array.from(new Set(collected));
  // };

  const getProductVariantSizes = () => {
  const collected = [];

  variants.forEach((v) => {
    (v.sizes || []).forEach((s) => {
      const size = String(s?.size || "").trim().toUpperCase();

      if (size && !collected.includes(size)) {
        collected.push(size);
      }
    });
  });

  return collected;
};
  

  // Sync variant sizes into size chart table columns
  const handleSyncSizesFromVariants = (tableIndex = null) => {
    const variantSizes = getProductVariantSizes();
    if (variantSizes.length === 0) {
      alert("No sizes found in Color Variants above. Please add sizes under Color Variants first.");
      return;
    }

    setScTables((prev) =>
      prev.map((t, idx) => {
        if (tableIndex === null || idx === tableIndex) {
          return {
            ...t,
            sizes: [...variantSizes],
          };
        }
        return t;
      })
    );
  };

  // Automatically sync variant sizes into size chart table columns whenever variants are edited
  // useEffect(() => {
  //   const variantSizes = getProductVariantSizes();
  //   if (variantSizes.length > 0) {
  //     setScTables((prev) =>
  //       prev.map((t) => {
  //         const isSame =
  //           t.sizes?.length === variantSizes.length &&
  //           t.sizes.every((s, i) => s === variantSizes[i]);
  //         if (isSame) return t;

  //         return {
  //           ...t,
  //           sizes: [...variantSizes],
  //         };
  //       })
  //     );
  //     setTimeout(() => {
  //       console.log("Auto-synced size chart tables with variant sizes:", scTables);
  //     }, 0);
  //   }
  // }, [variants]);

//   useEffect(() => {
//   const variantSizes = getProductVariantSizes();

//   if (!variantSizes.length) return;

//   setScTables((prev) =>
//     prev.map((t) => {
//       // Preserve existing size chart order
//       const existingSizes = t.sizes || [];

//       const isSame =
//         existingSizes.length === variantSizes.length &&
//         existingSizes.every(
//           (size, index) => size === variantSizes[index]
//         );

//       if (isSame) return t;

//       return {
//         ...t,
//         sizes: [...variantSizes],
//       };
//     })
//   );
//       setTimeout(() => {
//         console.log("Auto-synced size chart tables with variant sizes:", scTables);
//       }, 0);
// }, [variants]);

  // useEffect(() => {
  //   if (!isSizeChartLoaded) return;
  //   const variantSizes = getProductVariantSizes();

  //   console.log("Before sync:", scTables);
  //   console.log("New variant sizes:", variantSizes);

  //   if (!variantSizes.length) return;

  //   setScTables((prev) => {
  //     const updated = prev.map((table) => ({
  //       ...table,
  //       sizes: [...variantSizes],
  //     }));

  //     console.log("Updated size chart:", updated);

  //     return updated;
  //   });
  // }, [variants, isSizeChartLoaded]);

  useEffect(() => {
  if (!isSizeChartLoaded) return;

  const variantSizes = getProductVariantSizes();

  if (!variantSizes.length) return;

  setScTables((prev) =>
    prev.map((table) => {
      if (table.sizes?.length) {
        return table;
      }

      return {
        ...table,
        sizes: [...variantSizes],
      };
    })
  );
}, [variants, isSizeChartLoaded]);

  // Handlers for embedded size chart builder
  const handleScTableNameChange = (index, val) => {
    setScTables((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], tableName: val.toUpperCase() };
      return copy;
    });
  };

  const handleScAddSize = (tableIndex) => {
    const sizeVal = (scNewSizeInputs[tableIndex] || "").trim().toUpperCase();
    if (!sizeVal) return;

    setScTables((prev) => {
      const copy = [...prev];
      const table = copy[tableIndex];
      if (!table.sizes.includes(sizeVal)) {
        table.sizes = [...table.sizes, sizeVal];
      }
      return copy;
    });

    setScNewSizeInputs((prev) => ({ ...prev, [tableIndex]: "" }));
  };

  const handleScRemoveSize = (tableIndex, sizeToRemove) => {
    setScTables((prev) => {
      const copy = [...prev];
      const table = copy[tableIndex];
      table.sizes = table.sizes.filter((s) => s !== sizeToRemove);
      return copy;
    });
  };

  const handleScCellValueChange = (tableIndex, rowIndex, size, val) => {
    setScTables((prev) => {
      const copy = [...prev];
      const table = copy[tableIndex];
      const row = { ...table.rows[rowIndex] };
      row.values = {
        ...(row.values || {}),
        [size]: val,
      };
      table.rows[rowIndex] = row;
      return copy;
    });
  };

  // const handleScAddParameter = (tableIndex) => {
  //   const paramVal = (scNewParamInputs[tableIndex] || "").trim().toUpperCase();
  //   if (!paramVal) return;

  //   setScTables((prev) => {
  //     const copy = [...prev];
  //     const table = copy[tableIndex];
  //     table.rows = [
  //       ...table.rows,
  //       {
  //         parameter: paramVal,
  //         values: {},
  //       },
  //     ];
  //     return copy;
  //   });

  //   setScNewParamInputs((prev) => ({ ...prev, [tableIndex]: "" }));
  // };

  const handleScAddParameter = (tableIndex) => {
  const paramVal = (
    scNewParamInputs[tableIndex] || ""
  )
    .trim()
    .toUpperCase();

  if (!paramVal) return;

  setScTables((prev) =>
    prev.map((table, index) =>
      index === tableIndex
        ? {
            ...table,
            rows: [
              ...table.rows,
              {
                parameter: paramVal,
                values: {},
              },
            ],
          }
        : table
    )
  );

  setScNewParamInputs((prev) => ({
    ...prev,
    [tableIndex]: "",
  }));
};

  // const handleScRemoveRow = (tableIndex, rowIndex) => {
  //   console.log('setScTables called with previous state:', scTables);
  //   console.log(`Removing row ${rowIndex} from table ${tableIndex}`);
  //   setScTables((prev) => {
  //     const copy = [...prev];
  //     copy[tableIndex].rows = copy[tableIndex].rows.filter((_, idx) => idx !== rowIndex);
  //     return copy;
  //   });
  // };

  const handleScRemoveRow = (tableIndex, rowIndex) => {
  setScTables((prev) =>
    prev.map((table, index) =>
      index === tableIndex
        ? {
            ...table,
            rows: table.rows.filter(
              (_, idx) => idx !== rowIndex
            ),
          }
        : table
    )
  );
};

  const handleScAddTable = () => {
    setScTables((prev) => [
      ...prev,
      createDefaultScTable(
        prev.length === 1 ? "BOTTOM" : `SECTION ${prev.length + 1}`,
        prev[0]?.sizes || DEFAULT_SC_SIZES
      ),
    ]);
  };

  const handleScRemoveTable = (index) => {
    if (scTables.length <= 1) return;
    setScTables((prev) => prev.filter((_, idx) => idx !== index));
    setScTableImageFiles((prev) => {
      const updated = {};
      let newIdx = 0;
      for (let i = 0; i < scTables.length; i++) {
        if (i !== index) {
          if (prev[i]) updated[newIdx] = prev[i];
          newIdx++;
        }
      }
      return updated;
    });
  };

  // Multi-image diagram guide upload handlers (up to 5 images)
  const handleScGuideImagesAdd = (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const remainingSlots = 5 - (scExistingImages.length + scNewImageFiles.length);
    if (remainingSlots <= 0) {
      alert("You can upload a maximum of 5 diagram images.");
      return;
    }
    const filesToAdd = Array.from(fileList).slice(0, remainingSlots);
    setScNewImageFiles((prev) => [...prev, ...filesToAdd]);
  };

  const handleScRemoveExistingImage = (idx) => {
    setScExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleScRemoveNewImage = (idx) => {
    setScNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Section-specific images handlers
  const handleScSectionImagesAdd = (tIndex, fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newFiles = Array.from(fileList);
    setScTableImageFiles((prev) => ({
      ...prev,
      [tIndex]: [...(prev[tIndex] || []), ...newFiles],
    }));
  };

  const handleScRemoveExistingSectionImage = (tIndex, imgIdx) => {
    setScTables((prev) => {
      const copy = [...prev];
      const table = { ...copy[tIndex] };
      const curImages = Array.isArray(table.images) ? [...table.images] : [];
      curImages.splice(imgIdx, 1);
      table.images = curImages;
      table.image = curImages[0] || "";
      copy[tIndex] = table;
      return copy;
    });
  };

  const handleScRemoveNewSectionImage = (tIndex, fileIdx) => {
    setScTableImageFiles((prev) => {
      const list = [...(prev[tIndex] || [])];
      list.splice(fileIdx, 1);
      return { ...prev, [tIndex]: list };
    });
  };

  useEffect(() => {
    let ignore = false;

    const fetchOptions = async () => {
      try {
        const [catRes, brandRes, scRes] = await Promise.all([
          getCategories({ limit: 100, status: "active" }),
          getBrands({ limit: 100, status: "active" }),
          getSizeCharts({ limit: 100, status: "true" }),
        ]);

        if (!ignore) {
          setCategories(catRes?.data?.data || []);
          setBrands(brandRes?.data?.data || []);
          setSizeCharts(scRes?.data?.data || []);
        }
      } catch (err) {
        console.error("Failed to load dropdown options:", err);
      } finally {
        if (!ignore) setLoadingOptions(false);
      }
    };

    fetchOptions();

    return () => {
      ignore = true;
    };
  }, []);

  const updateVariantField = (index, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, emptyVariant()]);
  };

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSizeField = (variantIndex, sizeIndex, field, value) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        const sizes = v.sizes.map((s, si) =>
          si === sizeIndex ? { ...s, [field]: value } : s
        );
        return { ...v, sizes };
      })
    );
  };

  const addSize = (variantIndex) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, sizes: [...v.sizes, emptySize()] } : v
      )
    );
  };

  const removeSize = (variantIndex, sizeIndex) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex
          ? { ...v, sizes: v.sizes.filter((_, si) => si !== sizeIndex) }
          : v
      )
    );
  };

  // const handleVariantMediaChange = (variantIndex, e) => {
  //   const files = Array.from(e.target.files);
  //   if (files.length === 0) return;

  //   setVariants((prev) =>
  //     prev.map((v, i) =>
  //       i === variantIndex
  //         ? {
  //             ...v,
  //             pendingFiles: files,
  //             pendingPreviews: files.map((file) => URL.createObjectURL(file)),
  //           }
  //         : v
  //     )
  //   );
  // };

  
// const handleVariantMediaChange = (variantIndex, e) => {
//   const files = Array.from(e.target.files || []);
//   if (!files.length) return;

//   setVariants((prev) =>
//     prev.map((v, i) => {
//       if (i !== variantIndex) return v;

//       return {
//         ...v,
//         pendingFiles: [...(v.pendingFiles || []), ...files],
//         pendingPreviews: [
//           ...(v.pendingPreviews || []),
//           ...files.map((file) => URL.createObjectURL(file)),
//         ],
//       };
//     })
//   );

//   // Allow selecting the same file again
//   e.target.value = "";
// };



// import { compressProductImage } from "../utils/compressImage";

const handleVariantMediaChange = async (variantIndex, e) => {
  const files = Array.from(e.target.files || []);

  if (!files.length) return;

  const compressedFiles = [];

  try {
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      // Validate file type
      if (!isImage && !isVideo) {
        toast.error("Only images and videos are allowed.");
        continue;
      }

      // Compress images only
      const processedFile = isImage
        ? await compressProductImage(file)
        : file;

      // Validate image size after compression
      if (
        isImage &&
        processedFile.size > 600 * 1024
      ) {
        toast.error(
          `${file.name} is larger than 600 KB after compression.`
        );

        continue;
      }

      compressedFiles.push(processedFile);
    }

    if (compressedFiles.length === 0) {
      return;
    }

    // Create preview URLs from compressed files
    const previews = compressedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    // IMPORTANT: Update both pendingFiles and pendingPreviews
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        return {
          ...variant,

          // Store compressed files for API upload
          pendingFiles: [
            ...(variant.pendingFiles || []),
            ...compressedFiles,
          ],

          // Store preview URLs for displaying images
          pendingPreviews: [
            ...(variant.pendingPreviews || []),
            ...previews,
          ],
        };
      })
    );
  } catch (error) {
    console.error("Media upload preparation failed:", error);

    toast.error("Failed to process selected images.");
  } finally {
    // Allow selecting the same file again
    e.target.value = "";
  }
};


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setSubmitting(true);

  //   const variantsPayload = variants.map((v) => ({
  //     color: v.color,
  //     fabric: v.fabric,
  //     feel: v.feel,
  //     lining: v.lining,
  //     sleeves: v.sleeves,
  //     finishing: v.finishing,
  //     pocket: v.pocket,
  //     price: v.price === "" ? 0 : Number(v.price),
  //     discountPrice: v.discountPrice === "" ? null : Number(v.discountPrice),
  //     offer: {
  //       type: v.offerType,
  //       value: v.offerValue === "" ? 0 : Number(v.offerValue),
  //       startDate: v.offerStartDate || null,
  //       endDate: v.offerEndDate || null,
  //     },
  //     isActive: v.isActive,
  //     sizes: v.sizes
  //       .filter((s) => s.size)
  //       .map((s) => ({
  //         size: s.size,
  //         stockQuantity: s.stockQuantity === "" ? 0 : Number(s.stockQuantity),
  //         isActive: s.isActive,
  //       })),
  //     media: v.existingMedia,
  //     details: (v.details || []).filter((d) => d.key && d.value).map((d) => ({
  //       key: d.key,
  //       value: d.value,
  //     })),
  //   }));

  //   const formData = new FormData();
  //   if (categoryId) formData.append("categoryId", categoryId);
  //   if (brandId) formData.append("brandId", brandId);
  //   formData.append("name", name);
  //   formData.append("description", JSON.stringify({ about, itemDetails }));
  //   formData.append("variants", JSON.stringify(variantsPayload));
  //   formData.append("isActive", isActive);

  //   // Append pending files directly to Multipart Form under 'media'
  //   variants.forEach((v) => {
  //     if (v.pendingFiles && v.pendingFiles.length > 0) {
  //       v.pendingFiles.forEach((file) => {
  //         formData.append("media", file);
  //       });
  //     }
  //   });

  //   try {
  //     if (product?._id) {
  //       await updateProduct(product._id, formData);
  //     } else {
  //       await createProduct(formData);
  //     }
  //     onSuccess();
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Failed to save product.");
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    let resolvedSizeChartId = null;

    // 1. If in "create_separate" mode, automatically sync sizes from variants and save the size chart!
    if (scMode === "create_separate") {
      const variantSizes = getProductVariantSizes();

      const scFormData = new FormData();
      const scName = name.trim() ? `${name.trim()} Size Chart` : "Product Size Chart";
      scFormData.append("name", scName);
      scFormData.append("unit", scUnit);
      scFormData.append("description", `All measurements are in ${scUnit}`);
      scFormData.append("isActive", "true");
      if (categoryId) scFormData.append("categoryId", categoryId);
      if (product?._id) scFormData.append("productId", product._id);
// console.log("Preparing to submit size chart with tables:", scTables, "and variant sizes:", variantSizes);
      // Automatically ensure table sizes match the variant sizes if variants have sizes
      // const sanitizedTables = scTables.map((t) => ({
      //   tableName: t.tableName || "TOP",
      //   sizes: variantSizes.length > 0 ? variantSizes : (t.sizes?.length > 0 ? t.sizes : DEFAULT_SC_SIZES),
      //   rows: t.rows,
      //   image: t.image || (Array.isArray(t.images) ? t.images[0] : "") || "",
      //   images: Array.isArray(t.images) ? t.images : [],
      // }));

      // const sanitizedTables = scTables.map((t) => ({
      //   tableName: t.tableName || "TOP",

      //   // Preserve the admin's custom drag-and-drop order
      //   sizes:
      //     t.sizes?.length > 0
      //       ? [...t.sizes]
      //       : variantSizes.length > 0
      //         ? [...variantSizes]
      //         : [...DEFAULT_SC_SIZES],

      //   rows: t.rows.map((row) => ({
      //     ...row,
      //     values: { ...row.values },
      //   })),

      //   image:
      //     t.image ||
      //     (Array.isArray(t.images) ? t.images[0] : "") ||
      //     "",

      //   images: Array.isArray(t.images) ? [...t.images] : [],
      // }));
      const sanitizedTables = scTables.map((t) => ({
        tableName: t.tableName || "TOP",

        // Do not replace manually reordered sizes with variantSizes
        sizes:
          Array.isArray(t.sizes) && t.sizes.length > 0
            ? [...t.sizes]
            : [...variantSizes],

        rows: (t.rows || []).map((row) => ({
          parameter: row.parameter,
          values: { ...(row.values || {}) },
        })),

        image:
          t.image ||
          (Array.isArray(t.images) ? t.images[0] : "") ||
          "",

        images: Array.isArray(t.images) ? [...t.images] : [],
      }));

// scFormData.append("tables", JSON.stringify(sanitizedTables));
      // console.log("Sanitized Size Chart Tables for submission:", sanitizedTables);
      scFormData.append("tables", JSON.stringify(sanitizedTables));

      // Append kept existing guide images
      scFormData.append("existingImages", JSON.stringify(scExistingImages));
      if (scExistingImages[0]) {
        scFormData.append("image", scExistingImages[0]);
      }

      // Append new guide images (up to 5 images)
      scNewImageFiles.forEach((file) => {
        scFormData.append("images", file);
      });

      // Append section-level images (TOP, BOTTOM, etc.)
      scTables.forEach((_, tIndex) => {
        const files = scTableImageFiles[tIndex] || [];
        files.forEach((file) => {
          scFormData.append(`table_${tIndex}_images`, file);
        });
      });

      const existingScId =
        product?.sizeChartId?._id ||
        (typeof product?.sizeChartId === "string" ? product?.sizeChartId : null);

      if (existingScId) {
        await updateSizeChart(existingScId, scFormData);
        resolvedSizeChartId = existingScId;
      } else {
        const createRes = await createSizeChart(scFormData);
        resolvedSizeChartId = createRes?.data?.data?._id;
      }
    } else if (scMode === "select_existing") {
      resolvedSizeChartId = selectedExistingScId || null;
    } else {
      resolvedSizeChartId = null;
    }

    // 2. Prepare variants payload
    const variantsPayload = variants.map((v) => ({
      color: v.color,
      fabric: v.fabric,
      feel: v.feel,
      lining: v.lining,
      sleeves: v.sleeves,
      finishing: v.finishing,
      pocket: v.pocket,

      price: v.price === "" ? 0 : Number(v.price),
      discountPrice:
        v.discountPrice === "" ? null : Number(v.discountPrice),

      offer: {
        type: v.offerType,
        value: v.offerValue === "" ? 0 : Number(v.offerValue),
        startDate: v.offerStartDate || null,
        endDate: v.offerEndDate || null,
      },
      isActive: v.isActive,
      sizes: v.sizes
        .filter((s) => s.size)
        .map((s) => ({
          size: s.size,
          stockQuantity:
            s.stockQuantity === "" ? 0 : Number(s.stockQuantity),
          isActive: s.isActive,
        })),

      media: v.existingMedia,
      thumbnailId: v.thumbnailId || null,
      thumbnailPendingIndex: v.thumbnailPendingIndex ?? null,
      removedMediaIds: v.removedMediaIds || [],

      details: (v.details || [])
        .filter((d) => d.key && d.value)
        .map((d) => ({
          key: d.key,
          value: d.value,
        })),
    }));

    // 3. Build product FormData
    const formData = new FormData();
    if (categoryId) formData.append("categoryId", categoryId);
    if (brandId) formData.append("brandId", brandId);
    if (resolvedSizeChartId) {
      formData.append("sizeChartId", resolvedSizeChartId);
    } else {
      formData.append("sizeChartId", "");
    }
    formData.append("name", name);
    formData.append(
      "description",
      JSON.stringify({ about, itemDetails })
    );
    formData.append("variants", JSON.stringify(variantsPayload));
    formData.append("isActive", String(isActive));

    variants.forEach((v, variantIndex) => {
      (v.pendingFiles || []).forEach((file) => {
        formData.append("media", file);
        formData.append("mediaVariantIndex", String(variantIndex));
      });
    });

    // 4. Save Product
    let savedProduct;
    if (product?._id) {
      savedProduct = await updateProduct(product._id, formData);
    } else {
      savedProduct = await createProduct(formData);
    }

    // 5. Ensure bidirectional link between sizeChart and new product
    const newProdId = savedProduct?.data?.data?._id || savedProduct?.data?._id;
    if (newProdId && resolvedSizeChartId && !product?._id) {
      try {
        const linkFormData = new FormData();
        linkFormData.append("productId", newProdId);
        await updateSizeChart(resolvedSizeChartId, linkFormData);
      } catch (linkErr) {
        console.error("Link size chart to product error:", linkErr);
      }
    }

    onSuccess();
  } catch (err) {
    console.error("Product save failed:", err);
    alert(err.response?.data?.message || "Failed to save product.");
  } finally {
    setSubmitting(false);
  }
};


  const addDetail = (vIndex) => {
  setVariants((prev) =>
    prev.map((variant, index) =>
      index === vIndex
        ? {
            ...variant,
            details: [
              ...(variant.details || []),
              {
                localId: `detail-${Date.now()}-${Math.random()}`,
                key: "",
                value: "",
              },
            ],
          }
        : variant
    )
  );
};

const updateDetailField = (vIndex, dIndex, field, value) => {
  setVariants((prev) =>
    prev.map((variant, index) =>
      index === vIndex
        ? {
            ...variant,
            details: (variant.details || []).map((detail, index2) =>
              index2 === dIndex
                ? {
                    ...detail,
                    [field]: value,
                  }
                : detail
            ),
          }
        : variant
    )
  );
};

const removeDetail = (vIndex, dIndex) => {
  setVariants((prev) =>
    prev.map((variant, index) =>
      index === vIndex
        ? {
            ...variant,
            details: (variant.details || []).filter(
              (_, index2) => index2 !== dIndex
            ),
          }
        : variant
    )
  );
};

const removeExistingMedia = (variantIndex, mediaIndex) => {
  setVariants((prev) =>
    prev.map((variant, index) => {
      if (index !== variantIndex) return variant;

      const media = variant.existingMedia[mediaIndex];
      if (!media) return variant;

      const existingMedia = variant.existingMedia.filter(
        (_, i) => i !== mediaIndex
      );

      const removedMediaIds = media._id
        ? [...(variant.removedMediaIds || []), media._id]
        : variant.removedMediaIds || [];

      let thumbnailId = variant.thumbnailId;
      let thumbnailPendingIndex = variant.thumbnailPendingIndex;

      if (thumbnailId === media._id) {
        thumbnailId = existingMedia[0]?._id || null;
        thumbnailPendingIndex = null;
      }

      return {
        ...variant,
        existingMedia,
        removedMediaIds,
        thumbnailId,
        thumbnailPendingIndex,
      };
    })
  );
};

const removePendingMedia = (variantIndex, mediaIndex) => {
  setVariants((prev) =>
    prev.map((variant, index) => {
      if (index !== variantIndex) return variant;

      const pendingMedia = [...(variant.pendingMedia || [])];
      const pendingPreviews = [...(variant.pendingPreviews || [])];

      pendingMedia.splice(mediaIndex, 1);
      pendingPreviews.splice(mediaIndex, 1);

      let thumbnailPendingIndex = variant.thumbnailPendingIndex;

      if (thumbnailPendingIndex === mediaIndex) {
        thumbnailPendingIndex = null;
      } else if (
        thumbnailPendingIndex !== null &&
        thumbnailPendingIndex > mediaIndex
      ) {
        thumbnailPendingIndex -= 1;
      }

      return {
        ...variant,
        pendingMedia,
        pendingPreviews,
        thumbnailPendingIndex,
      };
    })
  );
};

const reorderArray = (array, fromIndex, toIndex) => {
  const updated = [...array];

  const [movedItem] = updated.splice(fromIndex, 1);

  updated.splice(toIndex, 0, movedItem);

  return updated;
};

const handleScSizeDragStart = (tableIndex, sizeIndex, e) => {
  scDragRef.current = {
    type: "size",
    tableIndex,
    fromIndex: sizeIndex,
  };

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", String(sizeIndex));
};

const handleScSizeDrop = (tableIndex, targetIndex, e) => {
  e.preventDefault();

  const drag = scDragRef.current;

  if (
    !drag ||
    drag.type !== "size" ||
    drag.tableIndex !== tableIndex ||
    drag.fromIndex === targetIndex
  ) {
    scDragRef.current = null;
    return;
  }

  setScTables((prev) =>
    prev.map((table, index) =>
      index === tableIndex
        ? {
            ...table,
            sizes: reorderArray(
              table.sizes,
              drag.fromIndex,
              targetIndex
            ),
          }
        : table
    )
  );

  scDragRef.current = null;
};

const handleScRowDragStart = (tableIndex, rowIndex, e) => {
  scDragRef.current = {
    type: "row",
    tableIndex,
    fromIndex: rowIndex,
  };

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", String(rowIndex));
};

const handleScRowDrop = (tableIndex, targetIndex, e) => {
  e.preventDefault();

  const drag = scDragRef.current;

  if (
    !drag ||
    drag.type !== "row" ||
    drag.tableIndex !== tableIndex ||
    drag.fromIndex === targetIndex
  ) {
    scDragRef.current = null;
    return;
  }

  setScTables((prev) =>
    prev.map((table, index) =>
      index === tableIndex
        ? {
            ...table,
            rows: reorderArray(
              table.rows,
              drag.fromIndex,
              targetIndex
            ),
          }
        : table
    )
  );

  scDragRef.current = null;
};

// console.log("scTables_data:", scTables);
// console.log('scExistingImages:', scExistingImages);

  return (
    <div className="prod-form-overlay">
      <div className="prod-form-card">
        <div className="prod-form-header">
          <h3>{product ? "Edit Product" : "Add Product"}</h3>
          <button type="button" className="prod-form-close" onClick={onClose}>
            &times;
          </button>
        </div>

        {loadingOptions ? (
          <p className="prod-form-loading">Loading options...</p>
        ) : (
          <form onSubmit={handleSubmit} className="prod-form-body">
            <div className="prod-form-group">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Floral Maxi Dress"
                required
              />
            </div>

            <div className="prod-form-group">
              <label>About</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Short product description"
                rows={2}
              />
            </div>

            <div className="prod-form-group">
              <label>Item Details</label>
              <textarea
                value={itemDetails}
                onChange={(e) => setItemDetails(e.target.value)}
                placeholder="Fit, care instructions, etc."
                rows={2}
              />
            </div>

            <div className="prod-form-group">
              <label>Category (optional)</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>



            <div className="prod-form-group">
              <label>Brand</label>
              <select value={brandId} onChange={(e) => setBrandId(e.target.value)} required>
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="prod-checkbox-label">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>

            {/* COLOR VARIANTS */}
            <div className="prod-form-group">
              <label>Color Variants</label>
              <div className="prod-variant-section">
                {variants.map((variant, vIndex) => (
                  <div className="prod-variant-card" key={variant.localId}>
                    <div className="prod-variant-card-header">
                      <h4>Color Variant {vIndex + 1}</h4>
                      {variants.length > 1 && (
                        <button
                          type="button"
                          className="prod-variant-remove-btn"
                          onClick={() => removeVariant(vIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Color</label>
                        <input
                          value={variant.color}
                          onChange={(e) => updateVariantField(vIndex, "color", e.target.value)}
                          placeholder="e.g. Maroon"
                          required
                        />
                      </div>

                      <div className="prod-form-group">
                        <label>Price</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariantField(vIndex, "price", e.target.value)}
                          placeholder="0"
                          min="0"
                        />
                      </div>

                      <div className="prod-form-group">
                        <label>Discount Price</label>
                        <input
                          type="number"
                          value={variant.discountPrice}
                          onChange={(e) =>
                            updateVariantField(vIndex, "discountPrice", e.target.value)
                          }
                          placeholder="Optional"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Fabric</label>
                        <input
                          value={variant.fabric}
                          onChange={(e) => updateVariantField(vIndex, "fabric", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Feel</label>
                        <input
                          value={variant.feel}
                          onChange={(e) => updateVariantField(vIndex, "feel", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Lining</label>
                        <input
                          value={variant.lining}
                          onChange={(e) => updateVariantField(vIndex, "lining", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Sleeves</label>
                        <input
                          value={variant.sleeves}
                          onChange={(e) => updateVariantField(vIndex, "sleeves", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Finishing</label>
                        <input
                          value={variant.finishing}
                          onChange={(e) => updateVariantField(vIndex, "finishing", e.target.value)}
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Pocket</label>
                        <input
                          value={variant.pocket}
                          onChange={(e) => updateVariantField(vIndex, "pocket", e.target.value)}
                        />
                      </div>
                    </div> */}

                    {/* PRODUCT DETAILS */}
                    <div className="prod-form-group">
                      <label>Product Details</label>

                      <div className="prod-details-section">

                        {(variant.details || []).map((detail, dIndex) => (
                          <div
                            className="prod-detail-row"
                            key={detail.localId || `detail-${dIndex}`}
                          >

                            {/* KEY */}
                            <input
                              type="text"
                              value={detail.key}
                              onChange={(e) =>
                                updateDetailField(
                                  vIndex,
                                  dIndex,
                                  "key",
                                  e.target.value
                                )
                              }
                              placeholder="Key e.g. Fabric"
                            />

                            {/* VALUE */}
                            <input
                              type="text"
                              value={detail.value}
                              onChange={(e) =>
                                updateDetailField(
                                  vIndex,
                                  dIndex,
                                  "value",
                                  e.target.value
                                )
                              }
                              placeholder="Value e.g. Pure Cambric Cotton"
                            />

                            {/* REMOVE */}
                            <button
                              type="button"
                              className="prod-detail-remove-btn"
                              onClick={() => removeDetail(vIndex, dIndex)}
                            >
                              &times;
                            </button>

                          </div>
                        ))}

                        <button
                          type="button"
                          className="prod-add-detail-btn"
                          onClick={() => addDetail(vIndex)}
                        >
                          + Add Product Detail
                        </button>

                      </div>
                    </div>

                    <div className="prod-form-row">
                      <div className="prod-form-group">
                        <label>Offer Type</label>
                        <select
                          value={variant.offerType}
                          onChange={(e) => updateVariantField(vIndex, "offerType", e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="percentage">Percentage</option>
                          <option value="flat">Flat</option>
                        </select>
                      </div>
                      <div className="prod-form-group">
                        <label>Offer Value</label>
                        <input
                          type="number"
                          value={variant.offerValue}
                          onChange={(e) => updateVariantField(vIndex, "offerValue", e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Offer Start</label>
                        <input
                          type="date"
                          value={variant.offerStartDate}
                          onChange={(e) =>
                            updateVariantField(vIndex, "offerStartDate", e.target.value)
                          }
                        />
                      </div>
                      <div className="prod-form-group">
                        <label>Offer End</label>
                        <input
                          type="date"
                          value={variant.offerEndDate}
                          onChange={(e) =>
                            updateVariantField(vIndex, "offerEndDate", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <label className="prod-inline-checkbox">
                      <input
                        type="checkbox"
                        checked={variant.isActive}
                        onChange={(e) => updateVariantField(vIndex, "isActive", e.target.checked)}
                      />
                      Color is active
                    </label>

                    {/* SIZES */}
                    <div className="prod-form-group">
                      <label>Sizes</label>
                      <div className="prod-size-list">
                        {variant.sizes.map((size, sIndex) => (
                          <div className="prod-size-row" key={size.localId}>
                            <select
                              value={size.size}
                              onChange={(e) =>
                                updateSizeField(vIndex, sIndex, "size", e.target.value)
                              }
                              required
                            >
                              <option value="">Size</option>
                              {ALLOWED_SIZES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={size.stockQuantity}
                              onChange={(e) =>
                                updateSizeField(vIndex, sIndex, "stockQuantity", e.target.value)
                              }
                              placeholder="Stock qty"
                              min="0"
                            />
                            <label className="prod-inline-checkbox">
                              <input
                                type="checkbox"
                                checked={size.isActive}
                                onChange={(e) =>
                                  updateSizeField(vIndex, sIndex, "isActive", e.target.checked)
                                }
                              />
                              Active
                            </label>
                            {variant.sizes.length > 1 && (
                              <button
                                type="button"
                                className="prod-size-remove-btn"
                                onClick={() => removeSize(vIndex, sIndex)}
                              >
                                &times;
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="prod-add-size-btn"
                        onClick={() => addSize(vIndex)}
                      >
                        + Add Size
                      </button>
                    </div>

                    {/* MEDIA */}
                    {/* <div className="prod-form-group">
                      <label>
                        Media for {variant.color || `Color ${vIndex + 1}`}{" "}
                        {product && "(adds to this color's existing media)"}
                      </label>
                      <div className="prod-form-image-upload">
                        {(variant.existingMedia.length > 0 || variant.pendingPreviews.length > 0) && (
                          <div className="prod-form-image-preview-list">
                            {variant.existingMedia.map((m, mi) => (
                              <img
                                key={m._id || `existing-${mi}`}
                                src={getImageUrl(m.imageURL)}
                                alt={`${variant.color} media ${mi + 1}`}
                                className="prod-form-image-preview"
                              />
                            ))}
                            {variant.pendingPreviews.map((src, pi) => (
                              <img
                                key={`pending-${pi}`}
                                src={src}
                                alt={`New ${variant.color} media ${pi + 1}`}
                                className="prod-form-image-preview"
                              />
                            ))}
                          </div>
                        )}
                        <label className="prod-form-file-label">
                          Choose Images / Videos
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleVariantMediaChange(vIndex, e)}
                            hidden
                          />
                        </label>
                      </div>
                    </div> */}
                    
                    {/* MEDIA */}
                    <div className="prod-form-group">
                      <label>
                        Media for {variant.color || `Color ${vIndex + 1}`}
                      </label>

                      <div className="prod-form-image-upload">
                        {(variant.existingMedia.length > 0 ||
                          variant.pendingPreviews.length > 0) && (
                          <div className="prod-form-image-preview-list">
                            {/* EXISTING MEDIA */}
                            {variant.existingMedia.map((media, mi) => {
                              const isThumbnail =
                                variant.thumbnailId === media._id ||
                                (!variant.thumbnailId && mi === 0);

                              return (
                                <div
                                  className={`prod-media-item ${
                                    isThumbnail ? "is-thumbnail" : ""
                                  }`}
                                  key={media._id || `existing-${mi}`}
                                >
                                  {media.type === "video" ? (
                                    <video
                                      src={getImageUrl(media.imageURL)}
                                      className="prod-form-image-preview"
                                      controls
                                    />
                                  ) : (
                                    <img
                                      src={getImageUrl(media.imageURL)}
                                      alt={`${variant.color} media ${mi + 1}`}
                                      className="prod-form-image-preview"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                      }}
                                    />
                                  )}

                                  {isThumbnail && (
                                    <span className="prod-thumbnail-badge">
                                      Thumbnail
                                    </span>
                                  )}
                                  
                                  <button
                                    type="button"
                                    className="prod-media-thumbnail-btn"
                                    onClick={() => {
                                      updateVariantField(
                                        vIndex,
                                        "thumbnailId",
                                        media._id
                                      );

                                      updateVariantField(
                                        vIndex,
                                        "thumbnailPendingIndex",
                                        null
                                      );
                                    }}
                                    title="Set as main thumbnail"
                                  >
                                    {isThumbnail ? "Main Thumbnail ✓" : "Set thumbnail"}
                                  </button>


                                  <button
                                    type="button"
                                    className="prod-media-delete-btn"
                                    onClick={() => removeExistingMedia(vIndex, mi)}
                                    aria-label="Delete media"
                                    title="Delete media"
                                  >
                                    &times;
                                  </button>
                                </div>
                              );
                            })}

                            {/* NEWLY SELECTED MEDIA */}
                            {variant.pendingPreviews.map((src, pi) => {
                              const isThumbnail =
                                variant.thumbnailPendingIndex === pi &&
                                variant.thumbnailId === null;

                              return (
                                <div
                                  className={`prod-media-item ${
                                    isThumbnail ? "is-thumbnail" : ""
                                  }`}
                                  key={`pending-${pi}`}
                                >
                                  {src.startsWith("blob:") || src.startsWith("data:") ? (
                                    <img
                                      src={src}
                                      alt={`New media ${pi + 1}`}
                                      className="prod-form-image-preview"
                                    />
                                  ) : (
                                    <img
                                      src={src}
                                      alt={`New media ${pi + 1}`}
                                      className="prod-form-image-preview"
                                    />
                                  )}

                                  {isThumbnail && (
                                    <span className="prod-thumbnail-badge">
                                      Thumbnail
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    className="prod-media-thumbnail-btn"
                                    onClick={() => {
                                      updateVariantField(vIndex, "thumbnailId", null);
                                      updateVariantField(
                                        vIndex,
                                        "thumbnailPendingIndex",
                                        pi
                                      );
                                    }}
                                  >
                                    Set thumbnail
                                  </button>

                                  <button
                                    type="button"
                                    className="prod-media-delete-btn"
                                    onClick={() => removePendingMedia(vIndex, pi)}
                                    aria-label="Remove selected media"
                                    title="Remove selected media"
                                  >
                                    &times;
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <label className="prod-form-file-label">
                          Choose Images / Videos
                          <input
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={(e) => handleVariantMediaChange(vIndex, e)}
                            hidden
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}

                <button type="button" className="prod-add-variant-btn" onClick={addVariant}>
                  + Add Color Variant
                </button>
              </div>
            </div>

            {/* DEDICATED PRODUCT SIZE CHART SECTION */}
            <div className="prod-form-group prod-sizechart-section">
              <div className="prod-sc-header-row">
                <div>
                  <h4 className="prod-sc-section-title">Product Size Chart</h4>
                  <p className="prod-sc-section-desc">
                    Each product has its own separate size chart with differing measurements and diagram images.
                  </p>
                </div>
                {scMode === "create_separate" && (
                  <button
                    type="button"
                    className="prod-sc-sync-sizes-btn"
                    onClick={() => handleSyncSizesFromVariants()}
                    title="Automatically sync size columns with the sizes configured in Color Variants above"
                  >
                    <RefreshCw size={13} /> Sync Sizes From Variants
                  </button>
                )}
              </div>

              {/* Mode Selector Tabs */}
              <div className="prod-sc-mode-tabs">
                <button
                  type="button"
                  className={`prod-sc-mode-btn ${scMode === "create_separate" ? "active" : ""}`}
                  onClick={() => setScMode("create_separate")}
                >
                  ✨ Create Separate Size Chart For This Product
                </button>
                <button
                  type="button"
                  className={`prod-sc-mode-btn ${scMode === "select_existing" ? "active" : ""}`}
                  onClick={() => setScMode("select_existing")}
                >
                  📋 Select Existing Template
                </button>
                <button
                  type="button"
                  className={`prod-sc-mode-btn ${scMode === "none" ? "active" : ""}`}
                  onClick={() => setScMode("none")}
                >
                  ❌ No Size Chart
                </button>
              </div>

              {/* Tab 1: Embedded Custom Size Chart Builder for this Product */}
              {scMode === "create_separate" && (
                <div className="prod-sc-embedded-builder">
                  <div className="prod-sc-settings-row">
                    <div className="prod-sc-setting-item">
                      <label>Measurement Unit:</label>
                      <select value={scUnit} onChange={(e) => setScUnit(e.target.value)}>
                        <option value="inches">Inches (in)</option>
                        <option value="cm">Centimeters (cm)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="sc-add-table-btn"
                      onClick={handleScAddTable}
                    >
                      <Plus size={15} /> Add Another Section (e.g. BOTTOM)
                    </button>
                  </div>

                  {/* Multi-image Guide Upload (Up to 5 images) */}
                  <div className="sc-image-upload-zone" style={{ marginBottom: "16px" }}>
                    <div className="sc-image-zone-header">
                      <label className="sc-section-label">
                        Dynamic Diagram / Guide Images (Up to 5 images)
                      </label>
                      <span className="sc-image-counter-pill">
                        {scExistingImages.length + scNewImageFiles.length} / 5 uploaded
                      </span>
                    </div>

                    <div className="sc-multi-upload-container">
                      <div className="sc-guide-thumbs-grid">
                        {scExistingImages.map((imgSrc, idx) => {
                          const fullUrl = imgSrc.startsWith("http")
                            ? imgSrc
                            : `${IMAGE_BASE_URL.replace(/\/+$/, "")}${imgSrc.startsWith("/") ? "" : "/"}${imgSrc}`;
                          return (
                            <div key={`existing-sc-${idx}`} className="sc-guide-thumb-card">
                              <img
                                src={fullUrl}
                                alt={`Guide ${idx + 1}`}
                                className="sc-guide-thumb-img"
                                onError={(e) => {
                                  e.target.src = defaultImage;
                                }}
                              />
                              <span className="sc-thumb-order-badge">#{idx + 1}</span>
                              <button
                                type="button"
                                className="sc-guide-del-btn"
                                onClick={() => handleScRemoveExistingImage(idx)}
                                title="Delete image"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          );
                        })}

                        {scNewImageFiles.map((fileObj, idx) => {
                          const previewUrl = URL.createObjectURL(fileObj);
                          const displayIdx = scExistingImages.length + idx + 1;
                          return (
                            <div key={`new-sc-${idx}`} className="sc-guide-thumb-card sc-guide-thumb-staged">
                              <img src={previewUrl} alt={`New ${idx + 1}`} className="sc-guide-thumb-img" />
                              <span className="sc-thumb-order-badge sc-badge-new">#{displayIdx} New</span>
                              <button
                                type="button"
                                className="sc-guide-del-btn"
                                onClick={() => handleScRemoveNewImage(idx)}
                                title="Remove pending image"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          );
                        })}

                        {scExistingImages.length + scNewImageFiles.length < 5 && (
                          <label className="sc-guide-add-box">
                            <Upload size={22} className="sc-upload-icon" />
                            <span className="sc-add-main-text">
                              {scExistingImages.length + scNewImageFiles.length === 0
                                ? "Click to upload diagram images (Up to 5)"
                                : `+ Add More (${5 - (scExistingImages.length + scNewImageFiles.length)} left)`}
                            </span>
                            <span className="sc-add-sub-text">JPG, PNG, WEBP</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={(e) => {
                                handleScGuideImagesAdd(e.target.files);
                                e.target.value = "";
                              }}
                              hidden
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Table Sections (e.g. TOP, BOTTOM or MAXI DRESS) */}
                  <div className="sc-tables-builder">
                    {scTables.map((table, tIndex) => (
                      <div key={tIndex} className="sc-table-builder-card">
                        <div className="sc-builder-top-bar">
                          <div className="sc-table-title-edit">
                            <label>Section Title:</label>
                            <input
                              type="text"
                              value={table.tableName}
                              onChange={(e) => handleScTableNameChange(tIndex, e.target.value)}
                              placeholder="e.g. TOP, BOTTOM, or MAXI DRESS"
                            />
                          </div>

                          <div className="sc-builder-actions">
                            <button
                              type="button"
                              className="sc-autofill-btn"
                              onClick={() => handleSyncSizesFromVariants(tIndex)}
                              title="Sync sizes from variants"
                            >
                              <RefreshCw size={13} /> Sync Variant Sizes
                            </button>

                            {scTables.length > 1 && (
                              <button
                                type="button"
                                className="sc-remove-section-btn"
                                onClick={() => handleScRemoveTable(tIndex)}
                              >
                                <Trash2 size={15} /> Remove Section
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Size Columns Tags */}
                        <div className="sc-sizes-config">
                          <span className="sc-config-label">Columns (Sizes):</span>
                          {/*<div className="sc-tags-list">
                            {table.sizes.map((s) => (
                              <span key={s} className="sc-size-tag">
                                {s}
                                <button
                                  type="button"
                                  onClick={() => handleScRemoveSize(tIndex, s)}
                                  aria-label={`Remove size ${s}`}
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>*/}

                          <div className="sc-tags-list">
                            {table.sizes.map((s, sIndex) => (
                              <span
                                key={s}
                                className="sc-size-tag"
                                draggable
                                onDragStart={(e) =>
                                  handleScSizeDragStart(tIndex, sIndex, e)
                                }
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) =>
                                  handleScSizeDrop(tIndex, sIndex, e)
                                }
                                onDragEnd={() => {
                                  scDragRef.current = null;
                                }}
                                title="Drag to reorder size"
                              >
                                <span className="sc-drag-handle">⠿</span>

                                {s}

                                <button
                                  type="button"
                                  draggable={false}
                                  onClick={() => handleScRemoveSize(tIndex, s)}
                                  aria-label={`Remove size ${s}`}
                                >
                                  &times;
                                </button>
                              </span>
                            ))}
                          </div>

                          <div className="sc-add-size-inline">
                            <input
                              type="text"
                              placeholder="Add size (e.g. 4XL)"
                              value={scNewSizeInputs[tIndex] || ""}
                              onChange={(e) =>
                                setScNewSizeInputs((prev) => ({
                                  ...prev,
                                  [tIndex]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleScAddSize(tIndex);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="sc-inline-btn"
                              onClick={() => handleScAddSize(tIndex)}
                            >
                              + Add
                            </button>
                          </div>
                        </div>

                        {/* Editable Data Matrix */}
                        <div className="sc-matrix-wrap">
                          <table className="sc-matrix-table">
                            <thead>
                              <tr>
                                <th className="sc-m-corner">PARAMETER</th>
                                {table.sizes.map((s) => (
                                  <th key={s} className="sc-m-col">
                                    {s}
                                  </th>
                                ))}
                                <th className="sc-m-action"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.rows.map((row, rIndex) => (
                                // <tr key={rIndex}>
                                // <tr
                                //   key={row._id || `${row.parameter}-${rIndex}`}
                                //   draggable
                                //   onDragStart={(e) =>
                                //     handleScRowDragStart(tIndex, rIndex, e)
                                //   }
                                //   onDragOver={(e) => e.preventDefault()}
                                //   onDrop={(e) =>
                                //     handleScRowDrop(tIndex, rIndex, e)
                                //   }
                                //   onDragEnd={() => {
                                //     scDragRef.current = null;
                                //   }}
                                //   className="sc-draggable-row"
                                // >
                                  <tr
                                    key={row._id || `${row.parameter}-${rIndex}`}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => handleScRowDrop(tIndex, rIndex, e)}
                                    className="sc-draggable-row"
                                  >
                                  {/* <td className="sc-m-param-name">{row.parameter}</td> */}
                                  {/* <td className="sc-m-param-name">
                                    <span className="sc-drag-handle">⠿</span>
                                    {row.parameter}
                                  </td> */}
                                  <td className="sc-m-param-name">
                                    <span
                                      className="sc-drag-handle"
                                      draggable
                                      onDragStart={(e) =>
                                        handleScRowDragStart(tIndex, rIndex, e)
                                      }
                                      onDragEnd={() => {
                                        scDragRef.current = null;
                                      }}
                                      title="Drag to reorder parameter"
                                    >
                                      ⠿
                                    </span>

                                    {row.parameter}
                                  </td>
                                  {table.sizes.map((s) => (
                                    <td key={s} className="sc-m-cell">
                                      <input
                                        type="text"
                                        value={row.values?.[s] ?? ""}
                                        onChange={(e) =>
                                          handleScCellValueChange(
                                            tIndex,
                                            rIndex,
                                            s,
                                            e.target.value
                                          )
                                        }
                                        placeholder="--"
                                      />
                                    </td>
                                  ))}
                                  <td className="sc-m-delete-cell">
                                    <button
                                      type="button"
                                      className="sc-del-row-btn"
                                      onClick={() => handleScRemoveRow(tIndex, rIndex)}
                                      title="Delete row"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Add Row Parameter */}
                        <div className="sc-add-param-bar">
                          <input
                            type="text"
                            placeholder="New parameter (e.g. OUTSEAM LENGTH)"
                            value={scNewParamInputs[tIndex] || ""}
                            onChange={(e) =>
                              setScNewParamInputs((prev) => ({
                                ...prev,
                                [tIndex]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleScAddParameter(tIndex);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="sc-inline-btn"
                            onClick={() => handleScAddParameter(tIndex)}
                          >
                            + Add Parameter Row
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Select Existing Template */}
              {scMode === "select_existing" && (
                <div className="prod-sc-template-selector">
                  <label className="prod-sc-template-label">Select from existing size charts:</label>
                  <select
                    value={selectedExistingScId}
                    onChange={(e) => setSelectedExistingScId(e.target.value)}
                  >
                    <option value="">-- Choose a size chart template --</option>
                    {sizeCharts.map((sc) => (
                      <option key={sc._id} value={sc._id}>
                        {sc.name} ({sc.tables?.map((t) => t.tableName).join(" + ") || "STANDARD"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tab 3: No Size Chart */}
              {scMode === "none" && (
                <div className="prod-sc-none-note">
                  No size chart will be linked to this product.
                </div>
              )}
            </div>

            <div className="prod-form-actions">
              <button type="button" className="prod-btn prod-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="prod-btn prod-btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ProductForm;
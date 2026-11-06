
import imageCompression from "browser-image-compression";

export const compressProductImage = async (file) => {
  // Don't compress videos
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const options = {
    maxSizeMB: 0.6,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.8,
    fileType: "image/webp",
  };

  try {
    const compressedFile = await imageCompression(
      file,
      options
    );

    // Ensure the compressed file has a WEBP extension
    const originalName = file.name || "product";

    const baseName = originalName.replace(
      /\.[^/.]+$/,
      ""
    );

    const webpFile = new File(
      [compressedFile],
      `${baseName}.webp`,
      {
        type: "image/webp",
        lastModified: Date.now(),
      }
    );

    console.log("Original image:", {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
    });

    console.log("Compressed image:", {
      name: webpFile.name,
      type: webpFile.type,
      size: `${(webpFile.size / 1024).toFixed(2)} KB`,
    });

    return webpFile;
  } catch (error) {
    console.error("Image compression failed:", error);

    // Return original file if compression fails
    return file;
  }
};

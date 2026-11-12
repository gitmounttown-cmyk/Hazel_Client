let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5004/api";

// Prevent www vs non-www cross-origin stream mismatch in production (prevents net::ERR_HTTP2_PROTOCOL_ERROR)
if (typeof window !== "undefined" && window.location && window.location.hostname.includes("hazelcart.com")) {
  API_URL = `${window.location.origin}/api`;
}

export default API_URL;
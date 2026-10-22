import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import API from "../../utils/api";

const VisitorTracker = () => {
  const location = useLocation();
  const sessionStartTime = useRef(Date.now());
  const pageViewCount = useRef(1);

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        let guestId = localStorage.getItem("hazelGuestId");
        if (!guestId) {
          guestId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
          localStorage.setItem("hazelGuestId", guestId);
        }

        let sessionId = sessionStorage.getItem("hazelSessionId");
        if (!sessionId) {
          sessionId = "SES_" + Math.random().toString(36).substring(2, 10).toUpperCase();
          sessionStorage.setItem("hazelSessionId", sessionId);
        }

        // Calculate session duration in MM:SS format
        const elapsedSecs = Math.floor((Date.now() - sessionStartTime.current) / 1000);
        const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, "0");
        const secs = String(elapsedSecs % 60).padStart(2, "0");
        const sessionDuration = `${mins}:${secs}`;

        const queryParams = new URLSearchParams(location.search);
        const utmSource = queryParams.get("utm_source") || "";
        const utmMedium = queryParams.get("utm_medium") || "";
        const utmCampaign = queryParams.get("utm_campaign") || "";
        const searchQuery = queryParams.get("search") || queryParams.get("q") || "";

        const ua = navigator.userAgent;
        let device = "Desktop";
        if (/mobile/i.test(ua)) device = "Mobile";
        else if (/tablet|ipad/i.test(ua)) device = "Tablet";

        let browser = "Chrome";
        if (/chrome|crios/i.test(ua)) browser = "Chrome";
        else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";

        await API.post("/visitors/track", {
          sessionId,
          guestId,
          path: location.pathname + location.search,
          trafficSource: utmSource || (document.referrer ? new URL(document.referrer).hostname : "Direct"),
          trafficMedium: utmMedium || "None",
          campaignName: utmCampaign || "",
          device,
          browser,
          searchQuery,
          pagesViewed: pageViewCount.current++,
          sessionDuration,
        });
      } catch (error) {
        console.error("Visitor tracking error:", error);
      }
    };

    trackVisitor();
  }, [location]);

  return null;
};

export default VisitorTracker;
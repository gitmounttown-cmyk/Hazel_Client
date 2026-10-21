import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../../utils/api";

const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // 1. Persistent Guest ID (Visitor ID)
        let guestId = localStorage.getItem("hazelGuestId");
        if (!guestId) {
          guestId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
          localStorage.setItem("hazelGuestId", guestId);
        }

        // 2. Session ID (persists during browser tab session)
        let sessionId = sessionStorage.getItem("hazelSessionId");
        if (!sessionId) {
          sessionId = "SES_" + Math.random().toString(36).substring(2, 10).toUpperCase();
          sessionStorage.setItem("hazelSessionId", sessionId);
        }

        // 3. Extract UTM Parameters & Campaign Data from URL
        const queryParams = new URLSearchParams(location.search);
        const utmSource = queryParams.get("utm_source") || "";
        const utmMedium = queryParams.get("utm_medium") || "";
        const utmCampaign = queryParams.get("utm_campaign") || "";

        // 4. Client-side Device & Browser Detection
        const ua = navigator.userAgent;
        let device = "Desktop";
        if (/mobile/i.test(ua)) device = "Mobile";
        else if (/tablet|ipad/i.test(ua)) device = "Tablet";

        let os = "Windows";
        if (/android/i.test(ua)) os = "Android";
        else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
        else if (/mac/i.test(ua)) os = "MacOS";
        else if (/linux/i.test(ua)) os = "Linux";

        let browser = "Chrome";
        if (/chrome|crios/i.test(ua)) browser = "Chrome";
        else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
        else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
        else if (/edg/i.test(ua)) browser = "Edge";

        // 5. Send analytics log payload matching visitorModel.js schema
        await API.post("/visitors/track", {
          sessionId,
          guestId,
          path: location.pathname + location.search,
          trafficSource: utmSource || (document.referrer ? new URL(document.referrer).hostname : "Direct"),
          trafficMedium: utmMedium || "None",
          campaignName: utmCampaign || "",
          utmSource,
          utmMedium,
          utmCampaign,
          device,
          os,
          browser,
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
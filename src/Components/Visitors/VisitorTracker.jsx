import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../../../src/utils/api";
import "./visitorTracker.css";

const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // Retrieve or generate a persistent UUID guest ID matching database cart structures
        let guestId = localStorage.getItem("hazelGuestId");
        if (!guestId) {
          guestId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
          localStorage.setItem("hazelGuestId", guestId);
        }

        // Retrieve user token if logged in (for userId tracking)
        const token = localStorage.getItem("hazelToken");

        // Send tracking data to backend for every route change (home, shop, cart, account, etc.)
        await API.post(
          "/visitors/track",
          {
            path: location.pathname + location.search,
            guestId: guestId,
          },
          {
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
      } catch (error) {
        console.error("Visitor tracking error:", error);
      }
    };

    trackVisitor();
  }, [location]); 

  return null; 
};

export default VisitorTracker;
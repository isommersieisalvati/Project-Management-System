import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { checkSessionExpiry, extendSession } from "../store/slices/authSlice";

// Session warning time: 5 minutes before expiry
const SESSION_WARNING_TIME = 5 * 60 * 1000;

export const useSessionManager = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, sessionExpiry } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if session is close to expiring
  const isSessionNearExpiry = useCallback(() => {
    if (!sessionExpiry) return false;
    const timeUntilExpiry = sessionExpiry - Date.now();
    return timeUntilExpiry <= SESSION_WARNING_TIME && timeUntilExpiry > 0;
  }, [sessionExpiry]);

  // Extend session on user activity
  const handleUserActivity = useCallback(() => {
    if (user && token && sessionExpiry) {
      const timeUntilExpiry = sessionExpiry - Date.now();
      // Extend session if it's more than halfway through
      if (timeUntilExpiry < (30 * 60 * 1000) / 2) {
        dispatch(extendSession());
      }
    }
  }, [dispatch, user, token, sessionExpiry]);

  // Set up session monitoring
  useEffect(() => {
    if (!user || !token) return;

    // Check session expiry every minute
    const sessionCheckInterval = setInterval(() => {
      dispatch(checkSessionExpiry());
    }, 60 * 1000);

    // Set up activity listeners to extend session
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    let lastActivityTime = Date.now();
    const throttledActivityHandler = () => {
      const now = Date.now();
      // Throttle activity checks to once every 5 minutes
      if (now - lastActivityTime > 5 * 60 * 1000) {
        lastActivityTime = now;
        handleUserActivity();
      }
    };

    activityEvents.forEach((eventName) => {
      document.addEventListener(eventName, throttledActivityHandler, true);
    });

    return () => {
      clearInterval(sessionCheckInterval);
      activityEvents.forEach((eventName) => {
        document.removeEventListener(eventName, throttledActivityHandler, true);
      });
    };
  }, [dispatch, user, token, handleUserActivity]);

  return {
    isSessionNearExpiry: isSessionNearExpiry(),
    extendSession: () => dispatch(extendSession()),
    checkSession: () => dispatch(checkSessionExpiry()),
  };
};

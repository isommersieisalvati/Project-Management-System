import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { extendSession, logout } from "../../store/slices/authSlice";

const SessionWarning: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sessionExpiry } = useSelector((state: RootState) => state.auth);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!sessionExpiry) return;

    const updateTimer = () => {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiry - now;
      const warningThreshold = 5 * 60 * 1000; // 5 minutes

      if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeLeft(Math.floor(timeUntilExpiry / 1000));
      } else {
        setShowWarning(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiry]);

  const handleExtendSession = () => {
    dispatch(extendSession());
    setShowWarning(false);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showWarning) return null;

  return (
    <div>
      <div>
        <div>
          <div>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3>Session Expiring Soon</h3>
            <div>
              <p>
                Your session will expire in{" "}
                <span>{formatTimeLeft(timeLeft)}</span>
              </p>
            </div>
            <div>
              <button type="button" onClick={handleExtendSession}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Extend Session
              </button>
              <button type="button" onClick={handleLogout}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;

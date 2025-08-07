import React from "react";
import { useSessionManager } from "../../hooks/useSessionManager";
import SessionWarning from "./SessionWarning";

interface SessionProviderProps {
  children: React.ReactNode;
}

const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  // Initialize session management
  useSessionManager();

  return (
    <>
      {children}
      <SessionWarning />
    </>
  );
};

export default SessionProvider;

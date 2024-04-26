import React from "react";
// pages
import MapPage from "./pages/MapPage";
// context
import { SocketProvider } from "./context/SocketContext";

// ----------------------------------------------------------------------

const MapsApp = () => {
  return (
    <SocketProvider>
      <MapPage />;
    </SocketProvider>
  );
};

export default MapsApp;

import React, { useContext, useEffect } from "react";
// hooks
import { useMapbox } from "../hooks/useMapbox";
// context
import { SocketContext } from "../context/SocketContext";

// ----------------------------------------------------------------------

const initialPoint = {
  lng: -122.4725,
  lat: 37.801,
  zoom: 13.5,
};

// ----------------------------------------------------------------------

const MapPage = () => {
  const {
    coords,
    setRef,
    newMarker$,
    markerMovement$,
    addMarker,
    updateMarkerPosition,
  } = useMapbox(initialPoint);

  const { socket } = useContext(SocketContext);

  // active markers
  useEffect(() => {
    socket.on("active-markers", (markers) => {
      for (const key of Object.keys(markers)) {
        addMarker(markers[key], key);
      }
    });
  }, [socket, addMarker]);

  // new marker
  useEffect(() => {
    newMarker$.subscribe((marker) => {
      socket.emit("new-marker", marker);
    });
  }, [newMarker$, socket]);

  // marker movement
  useEffect(() => {
    markerMovement$.subscribe((marker) => {
      socket.emit("update-marker", marker);
    });
  }, [socket, markerMovement$]);

  // move marker listening to socket
  useEffect(() => {
    socket.on("update-marker", (marker) => {
      updateMarkerPosition(marker);
    });
  }, [socket]);

  // listen new marker event
  useEffect(() => {
    socket.on("new-marker", (marker) => {
      addMarker(marker, marker.id);
    });
  }, [socket, addMarker]);

  return (
    <>
      <div className="info">
        Lng: {coords.lng} | Lat: {coords.lat} | Zoom: {coords.zoom}
      </div>
      <div ref={setRef} className="mapContainer" id="map" />
    </>
  );
};

export default MapPage;

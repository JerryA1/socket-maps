import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { v4 as uuidv4 } from "uuid";
import { Subject } from "rxjs";
//
mapboxgl.accessToken =
  "pk.eyJ1IjoiamVycnlhMSIsImEiOiJjbHZjd3JsNW4wbnFsMmlwZmJqejU1ejBtIn0.mkdj7NxOCNyHtlgYIv_5TA";

// ----------------------------------------------------------------------

export const useMapbox = (initialPoint) => {
  // reference to the map div
  const mapDiv = useRef();
  const mapRef = useRef();
  const setRef = useCallback((node) => {
    mapDiv.current = node;
  }, []);

  // reference to the markers
  const [markers, setMarkers] = useState({});

  // rxjs observables
  const markerMovement = useRef(new Subject());
  const newMarker = useRef(new Subject());

  // map and coordinates
  const [coords, setCoords] = useState(initialPoint);

  // function to add markers
  const addMarker = useCallback((event, id) => {
    const { lng, lat } = event.lngLat || event;
    const marker = new mapboxgl.Marker();
    marker.id = id ?? uuidv4();

    marker.setLngLat([lng, lat]).addTo(mapRef.current).setDraggable(true);

    // update markers
    setMarkers((prevMarkers) => ({
      ...prevMarkers,
      [marker.id]: marker,
    }));

    if (!id) {
      newMarker.current.next({ id: marker.id, lng, lat });
    }

    // listen for marker drag events
    marker.on("drag", ({ target }) => {
      const { id } = target;
      const { lng, lat } = target.getLngLat();

      markerMovement.current.next({ id, lng, lat });
    });
  }, []);

  // function to update marker position
  const updateMarkerPosition = useCallback(({ id, lng, lat }) => {
    setMarkers((prevMarkers) => ({
      ...prevMarkers,
      [id]: prevMarkers[id].setLngLat([lng, lat]),
    }));
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapDiv.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialPoint.lng, initialPoint.lat],
      zoom: initialPoint.zoom,
    });
    mapRef.current = map;

    // when the map is moved
    map.on("move", () => {
      const { lng, lat } = map.getCenter();
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: map.getZoom().toFixed(2),
      });
    });

    // add markers to the map when they are clicked
    map.on("click", addMarker);

    return () => {
      map.remove();
    };
  }, [initialPoint]);

  return {
    addMarker,
    coords,
    markers,
    newMarker$: newMarker.current,
    markerMovement$: markerMovement.current,
    setRef,
    updateMarkerPosition,
  };
};

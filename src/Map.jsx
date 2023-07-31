import React, { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { addressPoints } from "./addressPoints";

export default function Map() {
  useEffect(() => {
    var map = L.map("map", { attributionControl:false }).setView([55.796391, 49.108891], 12);

    L.tileLayer('http://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}').addTo(map);

    const points = addressPoints
      ? addressPoints.map((p) => {
          return [p[0], p[1]];
        }) 
      : [];

    //L.heatLayer(points).addTo(map);
  }, []);

  return <div  id="map" style={{ height: "100vh", filter: "grayscale(90%)"}}></div>;
}
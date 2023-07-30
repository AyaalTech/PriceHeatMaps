import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import './Map.css';

class MapComponent extends React.Component {
  state = {
    lat: 55.796391,
    lng: 49.108891,
    zoom: 12
  };

  render() {
    var center = [this.state.lat, this.state.lng];

    return (
      <MapContainer zoom={this.state.zoom} center={center}>
        <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    );
  }
}

export default MapComponent;
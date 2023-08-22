<template>
  <ol-map
    ref="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 100vh"
  >
    <fullscreen-control :fullscreencontrol="fullscreencontrol" />

    <ol-view
      ref="view"
      :center="center"
      :rotation="rotation"
      :zoom="zoom"
      :minZoom="minZoom"
      :maxZoom="maxZoom"
      :projection="projection"
    />

    <ol-tile-layer>
      <ol-source-xyz
        url="https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
      />
    </ol-tile-layer>

    <ol-heatmap-layer
      title="heatmap"
      :blur="1"
      :radius="20"
      :weight="heatmapWeight"
      :zIndex="10"
    >
      <ol-source-vector
        ref="priceheatmap"
        url="https://raw.githubusercontent.com/SawMassacre/PriceHeatMaps/446d57e44f9c9a357d329f624cdede1b3ad6dc80/src/averageprices.geojson"
        :format="geojson"
      >
      </ol-source-vector>
    </ol-heatmap-layer>
  </ol-map>
</template>

<script setup>
import FullscreenControl from "./components/FullscreenControl.vue";
import { ref, inject } from "vue";
import { fromLonLat } from "ol/proj";

const center = ref(fromLonLat([49.12, 55.78]));
const projection = ref("EPSG:3857");
const zoom = ref(13);
const minZoom = ref(13);
const maxZoom = ref(16);
const rotation = ref(0);

const format = inject("ol-format");
const geojson = new format.GeoJSON({ extractStyles: false });

const heatmapWeight = function (feature) {
  const properties = feature.getProperties();
  const price = parseFloat(properties.averagePrice);

  const scaleFactor = 0.00000001;

  return price * scaleFactor;
};
</script>

<style>
.overlay-content {
  background: red !important;
  color: white;
  box-shadow: 0 5px 10px rgb(2 2 2 / 20%);
  padding: 10px 20px;
  font-size: 16px;
}

html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>

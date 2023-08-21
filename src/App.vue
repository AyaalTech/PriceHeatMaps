<template>
  <ol-map
    ref="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 100vh"
  >
    <ol-view
      ref="view"
      :center="center"
      :rotation="rotation"
      :zoom="zoom"
      :projection="projection"
    />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-heatmap-layer
      title="heatmap"
      :blur="20"
      :radius="20"
      :weight="heatmapWeight"
      :zIndex="1"
    >
      <ol-source-vector
        ref="earthquakes"
        url="https://raw.githubusercontent.com/openlayers/openlayers/main/examples/data/kml/2012_Earthquakes_Mag5.kml"
        :format="kml"
      >
      </ol-source-vector>
    </ol-heatmap-layer>
  </ol-map>
</template>

<script setup>
import { ref, inject } from "vue";
import { fromLonLat } from "ol/proj";

const center = ref(fromLonLat([49.12, 55.78]));
const projection = ref("EPSG:3857");
const zoom = ref(13);
const rotation = ref(0);
const format = inject("ol-format");
const kml = new format.KML({ extractStyles: false });
const heatmapWeight = function (feature) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it from
  // the Placemark's name instead.
  const name = feature.get("name");
  const magnitude = parseFloat(name.substr(2));
  return magnitude - 5;
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

<template>
  <div>
    <svg
      id="heatmap-svg"
      :width="width"
      :height="height"
      viewBox="0 0 1000 1000"
      style="
        position: absolute;
        top: 0px;
        left: 0px;
        height: 1000px;
        width: 1000px;
      "
      ref="svg"
    ></svg>
    <button @click="saveSvgAsImage" style="z-index: 100; position: absolute">
      Save Map as Image
    </button>
  </div>
</template>

<script>
import TemperatureMap from "./temperatureMap.js";

export default {
  data() {
    return {
      height: 1000,
      width: 1000,
      arr: [],
    };
  },
  mounted() {
    this.generateRandomData();
    this.run();
  },
  methods: {
    generateRandomData() {
      for (let counter = 0; counter < 13; counter = counter + 1) {
        const x = parseInt((Math.random() * 100000) % this.width, 10);
        const y = parseInt((Math.random() * 100000) % this.height, 10);
        let v = (Math.random() * 100) / 2;

        if (Math.random() > 0.5) {
          v = -v;
        }
        if (Math.random() > 0.5) {
          v = v + 30;
        }

        this.arr.push({ x: x, y: y, value: v });
      }
    },
    run() {
      const svg = this.$refs.svg;
      const drw0 = new TemperatureMap(svg);

      drw0.setPoints(this.arr, this.width, this.height);
      drw0.drawFull(true, function () {
        /* Do nothing when done */
      });
    },
    saveSvgAsImage() {
      // Get the SVG element
      console.log("Saving SVG as image...");
      const svgElement = this.$refs.svg;

      // Serialize the SVG to a string
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);

      // Construct a data URL from the SVG string
      const svgDataUrl =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

      // Create a link element
      const downloadLink = document.createElement("a");
      downloadLink.href = svgDataUrl;
      downloadLink.download = "map.svg";

      // Append the link to the body
      document.body.appendChild(downloadLink);

      // Trigger a click event on the link
      downloadLink.click();

      // Remove the link from the body
      document.body.removeChild(downloadLink);
    },
  },
};
</script>

<style scoped>
body {
  margin: 0;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>

import { createApp } from "vue";
import App from "./App.vue";

import OpenLayersMap from "vue3-openlayers";
import "vue3-openlayers/styles.css"; // vue3-openlayers version < 1.0.0-*

const app = createApp(App);
app.use(OpenLayersMap /* options */);

app.mount("#app");

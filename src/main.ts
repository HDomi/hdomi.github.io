import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Toast, { POSITION, TYPE } from "vue-toastification";

//css
import "vue-toastification/dist/index.css";

// import "@/assets/styles/reset.scss";
import "@/assets/styles/base.scss";
import "@/assets/styles/stars.scss";
import "@/assets/styles/global.scss";

import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faGithub, faInstagram } from "@fortawesome/free-brands-svg-icons";

library.add(faGithub, faInstagram);
const options = {
  toastDefaults: {
    [TYPE.SUCCESS]: {
      hideProgressBar: true,
    },
    [TYPE.ERROR]: {
      hideProgressBar: true,
    },
    [TYPE.WARNING]: {
      hideProgressBar: true,
    },
    [TYPE.INFO]: {
      hideProgressBar: true,
    },
    [TYPE.DEFAULT]: {
      hideProgressBar: true,
    },
  },
  position: POSITION.TOP_CENTER,
};
createApp(App)
  .use(store)
  .use(router)
  .use(Toast, options)
  .component("font-awesome-icon", FontAwesomeIcon)
  .mount("#app");

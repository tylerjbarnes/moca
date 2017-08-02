import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import tinycolor2 from 'tinycolor2';
import moment from 'moment';
import lodash from 'lodash';

window.tinycolor = tinycolor2;
window.moment = moment;
window.lodash = lodash;
window.bus = new Vue();

import Period from './period.js';
window.currentPeriod = new Period();

window.customElements.define("ceri-icon", require("ceri-icon"));
require('./filters.js');

import router from './router.js';
import Store from './store.js';
import App from './App.vue';

new Vue({
  el: '#app',
  render: h => h(App),
  router
})

import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import router from './router.js';
import Store from './store.js';
import App from './App.vue';
import lodash from 'lodash';

window.lodash = lodash;

window.bus = new Vue();

require('./filters.js');

new Vue({
  el: '#app',
  render: h => h(App),
  router
})

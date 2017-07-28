import Vue from 'vue';
import Store from './store.js';
import App from './App.vue';
import lodash from 'lodash';

window.lodash = lodash;

new Vue({
  el: '#app',
  render: h => h(App)
})

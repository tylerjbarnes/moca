require('./helpers.js');

import Vue from 'vue';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

import tinycolor2 from 'tinycolor2';
import moment from 'moment';
import lodash from 'lodash';
import fuzzy from 'fuzzy';
import cuid from 'cuid';

window.tinycolor = tinycolor2;
window.moment = moment;
window.lodash = lodash;
window.fuzzy = fuzzy;
window.cuid = cuid;

window.bus = new Vue();

import Period from './period.js';
window.currentPeriod = new Period();

window.customElements.define("ceri-icon", require("ceri-icon"));
require('./filters.js');

import router from './router.js';
import Store from './store.js';
import App from './App.vue';


import axios from 'axios';
import qs from 'qs';

import store from './store.js';
window.store = store;
import MocaPusher from './pusher.js';

axios.post(ajaxurl, qs.stringify({
    action: 'hpm_api',
    function: 'download_data'
}))
.then(({data}) => {
    window.pusher = new MocaPusher();
    store.dispatch('importObjects', data);
    store.dispatch('ready');
    store.dispatch('setUser', currentUserWpId);
    bus.$emit('storeLoaded');

    axios.post(ajaxurl, qs.stringify({
        action: 'hpm_api',
        function: 'mutations',
        last_activity_id: store.state.last_activity_id
    }))
    .then(({data}) => {
        store.dispatch('importMutations', data);
    });

});

window.bus = new Vue();

window.moca = new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store
})

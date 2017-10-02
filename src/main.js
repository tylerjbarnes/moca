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

import store from './store.js';
window.store = store;
import MocaPusher from './pusher.js';

import forager from './forager.js';


let forceRemoteLoad = false;
function getMocaObjects() {
    return new Promise(function(resolve, reject) {
        forager.exists().then(exists => {
            if (exists && !forceRemoteLoad) {
                console.log('Loading from Local Storage');
                forager.getState().then(state => { resolve(state); });
            } else {
                console.log('Loading from Database');
                forager.reset();
                hpmAPI('objects').then(data => { resolve(data); });
            }
        });
    });
}

function getMocaMutations() {
    return hpmAPI('mutations', { last_mutation_id: store.state.lastMutationId });
}

getMocaObjects().then(data => {
    store.dispatch('importObjects', data);
    store.dispatch('setUser', currentUserWpId);
    store.dispatch('setLastMutationId', data.last_mutation_id);
    window.pusher = new MocaPusher();

    getMocaMutations().then((mutationData) => {
        store.dispatch('importMutations', mutationData);
        bus.$emit('storeLoaded');
    });
});

window.bus = new Vue();

window.moca = new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store
})

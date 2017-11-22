// JS Requires
require('./helpers.js');
require('./filters.js');

// JS Libraries as Globals
import tinycolor2 from 'tinycolor2'; window.tinycolor = tinycolor2;
import moment from 'moment'; window.moment = moment;
import lodash from 'lodash'; window.lodash = lodash;
import fuzzy from 'fuzzy'; window.fuzzy = fuzzy;
import cuid from 'cuid'; window.cuid = cuid;
import Period from './period.js'; window.currentPeriod = new Period();
import CeriIcon from 'ceri-icon'; window.customElements.define("ceri-icon", CeriIcon);

// Vue & Plugins
import Vue from 'vue'; window.Vue = Vue;
import VueRouter from 'vue-router';
Vue.use(VueRouter);

// App Parts
import App from './App.vue';
import ClientApp from './ClientApp.vue';
import router from './router.js';
import store from './store.js'; window.store = store;
import MocaPusher from './pusher.js';
import forager from './forager.js';
window.bus = new Vue();

// Define App
window.moca = new Vue({
  el: '#app',
  render: mocaUserRole == "client" ? h => h(ClientApp) : h => h(App),
  router,
  store
});

if (mocaUserRole == 'client') {

    mocaClientAPI('objects').then(data => {
        store.replaceState(data);
        bus.$emit('storeLoaded');
    });

} else {

    // Fetch Objects & Mutations...
    let forceRemoteLoad = true;
    function getMocaObjects() {
        return new Promise(function(resolve, reject) {
            forager.exists().then(exists => {
                if (exists && !forceRemoteLoad) {
                    console.log('Loading from Local Storage');
                    forager.getState().then(data => { resolve(data); });
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

    // ... Then Set Up Store & Emit Ready Signal
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

}

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
window.customElements.define("ceri-icon", require('ceri-icon'));

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
import Dexie from 'dexie';
window.bus = new Vue();

// Global Mixin
Vue.mixin({
    data () { return {
        ready: false
    }},
    computed: {
        route () {
            return this.$store.getters.route;
        },
        user () {
            return this.$store.getters.user;
        }
    },
    created () {
        if (this.fetch) {
            let fetchPromises = this.fetch.map(x => store.dispatch('fetch', x));
            Promise.all(fetchPromises).then(() => {
                this.ready = true;
                this.onReady && this.onReady();
            });
        } else {
            this.ready = true;
            this.onReady && this.onReady();
        }
    }
});

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
    let forceRemoteLoad = false;
    // function getMocaObjects() {
    //     return new Promise(function(resolve, reject) {
    //         Dexie.exists('mocadex').then(exists => {
    //             if (exists && !forceRemoteLoad) {
    //                 console.log('Local DB Already Exists');
    //             } else {
    //                 console.log('Importing from Remote DB');
    //                 hpmAPI('objects').then(data => { resolve(data); });
    //             }
    //         });
    //     });
    // }

    function initLocalDb() {
        return new Promise(function(resolve, reject) {
            Dexie.exists('mocadex').then(exists => {
                let remoteLoad = forceRemoteLoad || !exists;
                console.log(remoteLoad ? 'Importing from remote DB' : 'Local DB already exists');
                remoteLoad ?
                    hpmAPI('objects').then(data => { store.dispatch('importObjects', data); resolve(); }) :
                    resolve();
            });
        });
    }
    function getMocaMutations() {
        return hpmAPI('mutations', { last_mutation_id: store.state.lastMutationId });
    }

    // ... Then Set Up Store & Emit Ready Signal
    initLocalDb().then(() => {
        store.dispatch('initialize', currentUserWpId);
        // store.dispatch('setLastMutationId', data.last_mutation_id);
        // window.pusher = new MocaPusher();
        // getMocaMutations().then((mutationData) => {
        //     store.dispatch('importMutations', mutationData);
        //     bus.$emit('storeLoaded');
        // });
    });









}

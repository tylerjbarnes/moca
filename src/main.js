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

// Vue & Plugins
import Vue from 'vue'; window.Vue = Vue;
import VueRouter from 'vue-router';
Vue.use(VueRouter);
import Icon from 'vue-awesome'; Vue.component('icon', Icon)

// App Parts
import App from './App.vue';
import ClientApp from './ClientApp.vue';
import router from './router.js';
import store from './store.js'; window.store = store;
import MocaPusher from './pusher.js';
import Barista from './barista.js';
import Dexie from 'dexie';
window.bus = new Vue();
window.mocaError = null;

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
    let forceRemoteLoad = false;

    async function pourMoca() {
        let installed = await Dexie.exists('mocadex');
        if (forceRemoteLoad || !installed) {
            let initialData = await hpmAPI('objects');
            console.log('Downloaded initial Moca data.', initialData);
            await store.dispatch('installMocadex', {
                objects: initialData.objects,
                lastSync: initialData.last_sync,
                appliedMutations: initialData.applied_mutations
            });
            console.log('Finished installing Mocadex.');
        }
        await store.dispatch('initialize', currentUserWpId);
        console.log('Finished initializing Store.');
        window.pusher = new MocaPusher();
        console.log('Created MocaPusher.');
        await Barista.sync();
        console.log('Finished initial Barista sync.');
    }

    pourMoca();
}

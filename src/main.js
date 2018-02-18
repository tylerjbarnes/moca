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
    let forceRemoteLoad = false;

    // Install Mocadex
    async function initLocalDb() {
        if (!forceRemoteLoad && (await Dexie.exists('mocadex'))) return;
        let initialData = await hpmAPI('objects');
        console.log(initialData);
        await store.dispatch('installMocadex', {objects: initialData.objects, lastSync: initialData.last_sync});
    }

    // Then Initialize Store & Create Pusher
    initLocalDb().then(async () => {
        await store.dispatch('initialize', currentUserWpId);
        window.pusher = new MocaPusher();
    });

}

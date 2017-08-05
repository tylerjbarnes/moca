<template>
    <div id="app">
        <header>
            <div class="logo"></div>
            <nav>
                <router-link :to="{name:'team'}" class="navbar-item">Team</router-link>
                <router-link :to="{name:'clients'}" class="navbar-item">Clients</router-link>
                <router-link :to="{name:'time'}" class="navbar-item">Time</router-link>
            </nav>
        </header>
        <div class="main" :style="{position: $store.state.route.itemId ? 'fixed' : 'static'}">
            <toolbar></toolbar>
            <router-view></router-view>
        </div>
        <transition name="modal-fade">
            <div class="modal is-active" v-if="$store.state.route.itemId">
                <router-link tag="div" class="modal-background" :to="{name: $store.state.route.view}"></router-link>
                <div class="modal-card">
                    <router-view name="modal"></router-view>
                </div>
            </div>
        </transition>
    </div>
</template>


<script>
    import axios from 'axios';
    import qs from 'qs';

    import store from './store.js';
    window.store = store;

    import MocaPusher from './pusher.js';

    import Toolbar from './components/Toolbar.vue';
    import TeamView from './components/TeamView.vue';
    import ClientsView from './components/ClientsView.vue';

    export default {
        name: 'app',
        store,
        components: {Toolbar, TeamView, ClientsView},
        data() {
            return {
                activeView: 'team',
                modalActive: false
            }
        },
        computed: {
            projects() {
                return this.$store.state.projects;
            },
            members() {
                return this.$store.getters.members;
            }
        },
        mounted() {
            axios.post(ajaxurl, qs.stringify({
                action: 'hpm_api',
                function: 'load'
            }))
            .then(({data}) => {
                window.pusher = new MocaPusher();
                for (let type of [
                    'person',
                    'message',
                    'package',
                    'project',
                    'resource',
                    'time'
                ]) {
                    this.$store.dispatch('addObjects', {type, primitives: data[type + 's']});
                }
                // this.$store.dispatch('addPersons', data.persons);
                // this.$store.dispatch('addMessages', data.messages);
                // this.$store.dispatch('addPackages', data.packages);
                // this.$store.dispatch('addProjects', data.projects);
                // this.$store.dispatch('addResources', data.resources);
                // this.$store.dispatch('addTimes', data.times);
                this.$store.dispatch('setUser', currentUserWpId);
            });
        }
    }
</script>


<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Lato:400,700,900');
    @import './node_modules/bulma/bulma.sass';
    @import './theme.scss';

    #app {
        background-color: $white-ter;
        display: flex;
        font-size: 14px;
        min-height: 100vh;

        > header {
            background-color: white;
            border-right: 1px solid $shadow;
            position: fixed;
            width: $headerWidth; height: 100vh;
            z-index: 2;

            nav {
                padding-top: $headerWidth;

                .navbar-item {
                    text-align: center;

                    &:hover {
                        background: $white-ter;
                    }

                    &.is-active {
                        background: white;
                        color: $green;
                        font-weight: 900;
                    }

                }

            }

        }

        > .main {
            flex-grow: 1;
            margin-left: $headerWidth;
            margin-bottom: 20px;
            padding-top: $headerWidth;

        }

        .modal {
            overflow: visible;
            position: absolute;

            .modal-background {
                background: rgba(black, 0.25);
                position: fixed;

            }
            .modal-card {
                align-self: flex-start;
                box-shadow: 0px 5px 50px 0px rgba(black, 0.25);
                margin: 40px auto;
                max-height: none;

            }
        }
        .modal-fade-enter-active, .modal-fade-leave-active {
            transition: all 0.2s ease;
            .modal-background, .modal-card {
                transition: all 0.2s ease;
            }
        }
        .modal-fade-enter, .modal-fade-leave-to {
            .modal-background {
                opacity: 0;
            }
            .modal-card {
                opacity: 0;
                transform: scale(0.9);
            }
        }

    }
</style>

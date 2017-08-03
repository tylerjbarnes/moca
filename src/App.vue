<template>
    <div id="app">
        <header>
            <div class="logo"></div>
            <nav>
                <router-link to="/team" class="navbar-item">Team</router-link>
                <router-link to="/clients" class="navbar-item">Clients</router-link>
                <router-link to="/time" class="navbar-item">Time</router-link>
            </nav>
        </header>
        <div class="main">
            <toolbar></toolbar>
            <router-view></router-view>
        </div>
        <router-view name="modal"></router-view>
    </div>
</template>


<script>
    import axios from 'axios';
    import qs from 'qs';
    import store from './store.js';
    window.store = store;

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
                return this.$store.state.members;
            }
        },
        mounted() {
            axios.post(ajaxurl, qs.stringify({
                action: 'hpm_api',
                function: 'load'
            }))
            .then(({data}) => {
                this.$store.dispatch('addPersons', data.persons);
                this.$store.dispatch('addMessages', data.messages);
                this.$store.dispatch('addPackages', data.packages);
                this.$store.dispatch('addProjects', data.projects);
                this.$store.dispatch('addResources', data.resources);
                this.$store.dispatch('addTimes', data.times);
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
            // box-shadow: 0px 0px 15px 0px $shadow;
            position: fixed;
            width: $headerWidth; height: 100vh;

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
        }

    }
</style>

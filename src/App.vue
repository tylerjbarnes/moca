<template>
    <div id="app">
        <nav class="navbar">
            <div class="navbar-brand">
                <a class="navbar-item is-active">Team</a>
                <a class="navbar-item">Clients</a>
                <a class="navbar-item">Time</a>
            </div>
        </nav>
        <member-glance v-for="member in members" :person="member" :key="member.id"></member-glance>
        <!-- <li v-for="project in projects">{{ project.name }}</li> -->
    </div>
</template>


<script>
    import axios from 'axios';
    import qs from 'qs';
    import store from './store.js';

    import MemberGlance from './components/MemberGlance.vue';

    export default {
        name: 'app',
        store,
        components: {
            MemberGlance
        },
        data() {
            return {
                name: 'Someone',
                status: 'something'
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
                .then(({
                    data
                }) => {
                    this.$store.dispatch('addPersons', data.persons);
                    this.$store.dispatch('addProjects', data.projects);
                });
        }
    }
</script>


<style lang="scss">
    @import './node_modules/bulma/bulma.sass';

    #app {
        background-color: $white-ter;
    }
</style>

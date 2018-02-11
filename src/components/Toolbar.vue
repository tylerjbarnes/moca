<template>
    <div id="toolbar">
        <template v-if="!route.view">
            <div class="blurbs">
                <div class="blurb">
                    <span>Conversations</span>
                    <span class="count">{{ countInboxItemsOfType('project') }}</span>
                </div>
                <div class="blurb">
                    <span>Expirations</span>
                    <span class="count">{{ countInboxItemsOfType('client') }}</span>
                </div>
                <div class="blurb" v-if="$store.getters.user.canManage">
                    <span>Pending Times</span>
                    <span class="count">{{ countInboxItemsOfType('time') }}</span>
                </div>
            </div>
        </template>
        <template v-if="route.view == 'archive'">
            <person-input class="archive-client" v-model="archiveClientFilter" :roles="['client']"></person-input>
        </template>
        <template v-if="['team','clients','archive','projects'].includes($store.state.route.view)">
            <icon name="search"></icon>
            <input v-model="searchTerm" type="text" id="search" placeholder="Filter by name...">
            <div v-if="searchTerm.length" @click="searchTerm = '';" class="clear">
                <icon name="times"></icon>
            </div>
        </template>
        <template v-if="['team','clients'].includes($store.state.route.view)">
            <div class="filter" @click="toggleStartedFilter">
                <icon v-if="filters.started" name="eye-slash"></icon>
                <icon v-else                 name="eye"></icon>
                <span>Future</span>
            </div>
            <div class="actions">
                <router-link tag="button" class="big primary button" :to="{name: this.$store.state.route.view + '-new-project'}">Create Project</router-link>
            </div>
        </template>
        <template v-if="$store.state.route.view == 'time'">
            <div class="blurbs">
                <div class="blurb">
                    <span>Pay Period</span>
                    <period-input v-model="periodFilter"></period-input>
                </div>
                <div class="blurb">
                    <span>Client</span>
                    <person-input v-model="timeClientFilter" roles="['client']"></person-input>
                </div>
                <div class="blurb" v-if="$store.getters.user.canManage">
                    <span>Worker</span>
                    <person-input v-model="timeWorkerFilter" roles="['contractor','administrator','manager']"></person-input>
                </div>
            </div>
            <!-- <div class="actions">
                <button class="big primary button" @click="logTime">Log Time</button>
            </div> -->
        </template>
        <template v-if="$store.state.route.view == 'profile'">
            <div class="actions only">
                <button class="big dangerous button" @click="resetApp">Reset App</button>
                <button class="big primary button" @click="signout">Sign Out</button>
            </div>
        </template>
    </div>
</template>


<script>
    import DateInput from './inputs/DateInput.vue';
    import PersonInput from './inputs/PersonInput.vue';
    import PeriodInput from './inputs/PeriodInput.vue';
    import Mocadex from '../mocadex.js';

    export default {
        name: 'toolbar',
        props: ['person'],
        components: {DateInput,PersonInput,PeriodInput},
        data () { return {
            inboxItems: []
        }},
        computed: {
            filters () {
                return this.$store.state.uiFilters.projects;
            },
            periodFilter: {
                get () { return this.$store.state.uiFilters.times.period; },
                set (value) { this.$store.dispatch('setUiFilter', {type: 'times', name: 'period', value: value}); }
            },
            archiveClientFilter: {
                get () { return this.$store.state.uiFilters.archive.clientId; },
                set (value) { this.$store.dispatch('setUiFilter', {type: 'archive', name: 'clientId', value: value }); }
            },
            timeClientFilter: {
                get () { return this.$store.state.uiFilters.times.clientId; },
                set (value) { this.$store.dispatch('setUiFilter', {type: 'times', name: 'clientId', value: value}); }
            },
            timeWorkerFilter: {
                get () { return this.$store.state.uiFilters.times.workerId; },
                set (value) { this.$store.dispatch('setUiFilter', {type: 'times', name: 'workerId', value: value}); }
            },
            searchTerm: {
                get () { return this.$store.state.searchTerm; },
                set (value) { this.$store.commit('setSearchTerm', value); }
            }
        },
        methods: {
            logTime() {
                bus.$emit('logTime');
            },
            toggleStartedFilter() {
                this.$store.dispatch('setUiFilter', {type: 'projects', name: 'started', value: !this.filters.started})
            },
            signout () {
                window.location.replace('/wp-login.php?action=logout');
            },
            resetApp () {
                Mocadex.uninstall();
                window.location.replace('/dashboard/profile');
            },
            countInboxItemsOfType(type) {
                return this.inboxItems.filter(x => x.type == type).length;
            }
        },
        mounted () {
            bus.$on('updateInboxItems', (items) => { this.inboxItems = items; } );
        }
    }
</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #toolbar {
        align-items: center;
        background: white;
        border-bottom: 1px solid $gray;
        display: flex;
        height: $header-size;
        justify-content: space-between;
        padding: 0 40px;
        position: fixed;
            top: 0; right: 0; left: $header-size;
        z-index: 3;

        > .fa-icon, .filter .fa-icon {
            opacity: 0.25;
            margin-right: 10px;

        }

        .clear {
            width: $header-size; height: $header-size;
            display: flex;
            justify-content: center;
            // margin-right: $header-size * -0.5;

            .fa-icon {
                align-self: center;
                opacity: 0.25;
            }

            &:hover {

                .fa-icon {
                    opacity: 0.5;

                }

            }

        }

        .archive-client {
            margin-right: 20px;
            width: 300px;
        }

        input#search {
            border: none;
            font-size: 1em;
            flex: 1 1;
            outline: none;
            opacity: 0.5;

            &:focus {
                opacity: 1;
                &::placeholder {
                    opacity: 0;
                }
            }

        }

        .filter {
            align-items: center;
            cursor: pointer;
            display: flex;
            margin: 0 40px;
            @include unselectable;

            span {
                color: black;
                opacity: 0.25;

            }

        }

        .actions {
            align-content: center;
            display: flex;
            flex: 0 1;
            flex-flow: row;
            justify-content: flex-end;
            padding-left: 10px;

            &.only {
                flex-grow: 1;

                .button:not(:first-of-type) {
                    margin-left: 10px;
                }
            }

        }

        .blurbs {
            display: flex;
            flex-grow: 1;
            justify-content: center;

            .blurb {
                align-items: center;
                display: flex;
                flex-flow: column;
                padding: 0 10px;

                &:not(:first-of-type) {
                    margin-left: 10px;
                }

                span {
                    color: $medium;
                    font-size: 0.75em;
                    font-weight: 700;
                    padding-bottom: 4px;
                    text-transform: uppercase;

                }

                span.count {
                    color: $dark;
                    font-size: 1.2em;
                    font-weight: 300;

                }

            }

        }

    }

</style>

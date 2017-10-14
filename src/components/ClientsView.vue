<template>

    <div id="clients-view">
        <person-panel v-for="person in clients" :person="person" :key="person.id"></person-panel>
        <h1 class="missing" v-if="!persons.length">No Clients Found</h1>
    </div>

</template>


<script>
    import PersonPanel from './PersonPanel.vue';
    import CanSearchPersons from '../mixins/CanSearchPersons.js';

    export default {
        name: 'clients-view',
        computed: {
            allPersons () {
                return this.$store.getters.clients;
            }
        },
        components: {
            PersonPanel
        },
        mixins: [CanSearchPersons],
        mounted () {
            let savedScroll = localStorage['clientsScroll'];
            document.body.scrollTop = savedScroll;
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #clients-view {
        align-items: center;
        display: flex;
        flex-flow: column;
        padding: 0 40px 20px 40px;

        h1 {
            align-self: flex-start;
            font-weight: 700;
            margin: 0;
            padding: 40px 0 0 0;

            &.missing {
                font-size: 2em;
                text-align: center;
                opacity: 0.5;
            }

        }

    }

</style>

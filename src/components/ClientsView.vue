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
        mixins: [CanSearchPersons]
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    #clients-view {
        overflow-y: auto;

        h1 {
            font-weight: 700;
            padding: 40px 40px 0 40px;

            &.missing {
                font-size: 2em;
                text-align: center;
                opacity: 0.5;
            }

        }

    }

</style>

<template>
    <div id="team-view">
        <h1 class="title" v-if="managers.length">Managers</h1>
        <person-panel v-for="person in managers" :person="person" :key="person.id"></person-panel>
        <h1 class="title" v-if="contractors.length">Contractors</h1>
        <person-panel v-for="person in contractors" :person="person" :key="person.id"></person-panel>
        <h1 class="missing" v-if="!persons.length">No Team Members Found</h1>
    </div>
</template>


<script>
    import PersonPanel from './PersonPanel.vue';
    import CanSearchPersons from '../mixins/CanSearchPersons.js';

    export default {
        name: 'team-view',
        computed: {
            allPersons () {
                return this.$store.state.members;
            }
        },
        components: {
            PersonPanel
        },
        mixins: [CanSearchPersons]
    }
</script>


<style lang="scss">

    #team-view {
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

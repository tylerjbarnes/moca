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
                return this.$store.getters.activeMembers;
            }
        },
        components: {
            PersonPanel
        },
        mixins: [CanSearchPersons],
        mounted () {
            let savedScroll = localStorage['teamScroll'];
            document.body.scrollTop = savedScroll;
        }
    }
</script>


<style lang="scss">

    #team-view {
        align-items: center;
        display: flex;
        flex-flow: column;
        padding: 0 40px 20px 40px;

        > h1 {
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

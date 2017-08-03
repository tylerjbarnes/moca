<template>
    <div id="team-view">
        <h1 class="title">Managers</h1>
        <person-panel v-for="person in managers" :person="person" :key="person.id"></person-panel>
        <h1 class="title">Contractors</h1>
        <person-panel v-for="person in contractors" :person="person" :key="person.id"></person-panel>
    </div>
</template>


<script>
    import PersonPanel from './PersonPanel.vue';

    export default {
        name: 'team-view',
        components: {
            PersonPanel
        },
        computed: {
            managers() {
                return this.$store.state.members.filter( member => member.canManage);
            },
            contractors() {
                return this.$store.state.members.filter( member => !member.canManage);
            }
        }
    }
</script>


<style lang="scss">

    #team-view {
        overflow-y: auto;

        h1 {
            font-weight: 700;
            padding: 30px 20px 0 20px;

        }

    }

</style>

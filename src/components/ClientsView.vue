<template>

    <div id="clients-view">
        <person-panel v-for="person in clients" :person="person" :key="person.id"></person-panel>
    </div>

</template>


<script>
    import PersonPanel from './PersonPanel.vue';

    export default {
        name: 'clients-view',
        components: {
            PersonPanel
        },
        computed: {
            clients() {
                return this.$store.state.clients;
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    #clients-view {
        overflow-y: auto;

        h1 {
            font-weight: 700;
            padding: 30px 20px 0 20px;

        }

    }

</style>

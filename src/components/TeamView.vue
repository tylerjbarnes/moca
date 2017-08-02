<template>
    <div id="team-view">
        <h1 class="title">Managers</h1>
        <member-glance v-for="member in managers" :member="member" :key="member.id"></member-glance>
        <h1 class="title">Contractors</h1>
        <member-glance v-for="member in contractors" :member="member" :key="member.id"></member-glance>
    </div>
</template>


<script>
    import MemberGlance from './MemberGlance.vue';

    export default {
        name: 'team-view',
        components: {
            MemberGlance
        },
        data() {
            return {

            }
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

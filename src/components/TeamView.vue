<template>
    <div id="team-view">
        <h1 class="title">Team</h1>
        <member-glance v-for="member in members" :member="member" :key="member.id"></member-glance>
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
            members() {
                return this.$store.state.members;
            }
        }
    }
</script>


<style lang="scss">

    #team-view {
        overflow-y: auto;

        h1 {
            font-weight: 500;
            padding: 40px 20px 0 20px;

        }

    }

</style>

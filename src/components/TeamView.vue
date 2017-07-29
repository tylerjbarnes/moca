<template>
    <div id="team-view">
        <section class="title-section section">
            <div class="container">
                <h1 class="title">Team</h1>
            </div>
        </section>
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

        .title-section {
            background-color: transparent;
            padding-bottom: 0;

            h1 {
                font-weight: 700;

            }

        }

    }

</style>

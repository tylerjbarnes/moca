<template>

    <div class="projects-view">
        <h1 class="title">Active</h1>
        <project-collection :projects="$store.state.user.projectsAssigned"></project-collection>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';

    export default {
        name: 'projects-view',
        components: {ProjectCollection}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .projects-view {

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

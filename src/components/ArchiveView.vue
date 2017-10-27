<template>

    <div class="archive-view">
        <project-collection :projects="projects"></project-collection>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';
    import CanSearchProjects from '../mixins/CanSearchProjects.js';

    export default {
        name: 'archive-view',
        components: {ProjectCollection},
        data () {return {
        }},
        mixins: [CanSearchProjects],
        computed: {
            allProjects () {
                return store.state.projects.filter(project => project.archived);
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .archive-view {

        h1 {
            font-weight: 700;
            padding: 40px 40px 0 40px;

            &.missing {
                font-size: 2em;
                text-align: center;
                opacity: 0.5;
            }

        }

        .project-collection {
            margin: 40px 40px 0 40px;

            .project-card {

                .flag, .unresolved {

                }
            }
        }

    }

</style>

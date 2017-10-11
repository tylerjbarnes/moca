<template>

    <div class="projects-view">
        <h1 class="title">Active</h1>
        <project-collection :projects="activeProjects"></project-collection>
        <h1 class="title">Pending Approval</h1>
        <project-collection :projects="pendingProjects"></project-collection>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';

    export default {
        name: 'projects-view',
        components: {ProjectCollection},
        computed: {
            activeProjects () {
                return store.state.user.projectsAssigned.filter(project => project.status == 'do');
            },
            pendingProjects () {
                return store.state.user.projectsAssigned.filter(project => project.status == 'approve');
            }
        }
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

        .project-collection {
            margin: 0 40px;

            .project-card {

                .flag, .unresolved {
                    
                }
            }
        }

    }

</style>

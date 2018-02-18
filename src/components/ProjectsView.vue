<template>

    <div class="projects-view">
        <template v-if="$store.getters.user.canManage">
            <h1 class="title">Undelegated</h1>
            <project-collection :fluid="true" :projects="undelegatedProjects"></project-collection>
        </template>
        <template v-else>
            <h1 class="title" v-if="activeProjects.length">Active</h1>
            <project-collection :fluid="true" :projects="activeProjects"></project-collection>
            <h1 class="title" v-if="pendingProjects.length">Pending Approval</h1>
            <project-collection :fluid="true" :projects="pendingProjects"></project-collection>
        </template>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';
    import CanSearchProjects from '../mixins/CanSearchProjects.js';
    import DragDropController from '../mixins/DragDropController.js';

    export default {
        name: 'projects-view',
        components: {ProjectCollection},
        data () {return {
            statuses: ['delegate','do','approve','send']
        }},
        computed: {
            allProjects () {
                return this.user.canManage ?
                    store.getters.activeProjects :
                    store.getters.user.projectsAssigned;
            },
            activeProjects () {
                return this.projects.filter(project => project.status == 'do');
            },
            pendingProjects () {
                return this.projects.filter(project => project.status == 'approve');
            },
            undelegatedProjects () {
                return this.projects.filter(x => x.status == 'delegate');
            }
        },
        mixins: [CanSearchProjects,DragDropController]
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

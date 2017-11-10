<template>

    <div class="archive-view">
        <project-collection :projects="projects" :fluid="true" :show="projectsShow"></project-collection>
        <div class="persons" v-if="$store.state.user.canManage">
            <person-row v-for="person in persons" :key="person.id" :person="person"></person-row>
        </div>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';
    import PersonRow from './PersonRow.vue';
    import CanSearchProjects from '../mixins/CanSearchProjects.js';
    import CanSearchPersons from '../mixins/CanSearchPersons.js';

    export default {
        name: 'archive-view',
        components: {ProjectCollection,PersonRow},
        data () {return {
            projectsShow: { contractor: true, manager: true }
        }},
        mixins: [CanSearchProjects,CanSearchPersons],
        computed: {
            allProjects () {
                return store.state.user.canManage ?
                store.state.projects.filter(project => project.archived) :
                store.state.projects.filter(project => project.archived && project.contractor_id == store.state.user.id);
            },
            allPersons () {
                return store.state.persons.filter(person => person.archived);
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .archive-view {
        display: flex;

        .project-collection {
            border-right: 1px solid $medium;
            flex: 1 1 100%;
            margin: 40px 20px 0 40px;
            padding-right: 20px;

            .project-card {

                .flag, .unresolved {

                }
            }
        }

        .persons {
            align-self: flex-start;
            border-radius: 5px;
            flex: 0 0 200px;
            margin: 40px 40px 0 0;
            overflow: hidden;

        }

    }

</style>

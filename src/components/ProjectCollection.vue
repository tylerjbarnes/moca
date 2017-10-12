<template>

    <div class="project-collection">
        <kanban :projects="projects" v-if="kanban" :person="person"></kanban>
        <div class="items" v-else>
            <div class="item" v-for="project in sortedProjects">
                <project-card :project="project" :key="project.id"></project-card>
            </div>
        </div>
    </div>

</template>


<script>
    import Kanban from './Kanban.vue';
    import ProjectCard from './ProjectCard.vue';

    export default {
        name: 'project-collection',
        props: ['projects','kanban','person'],
        components: {Kanban,ProjectCard},
        computed: {
            sortedProjects () {
                return this.projects.sort((a,b) => {
                    let dateA = a.earliestDue ? a.earliestDue : null;
                    let dateB = b.earliestDue ? b.earliestDue : null;
                    return dateA == dateB ? a.name > b.name : dateA > dateB || dateA == null;
                });
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-collection {

        > .items {
            display: flex;
            flex-wrap: wrap;
            margin: -10px;

            .item {
                flex: 0 0 25%;
                padding: 0 10px;

                .project-card {

                }

            }

        }

    }

</style>

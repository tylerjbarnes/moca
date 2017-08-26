<template>

    <div class="project-collection">
        <kanban :projects="projects" v-if="kanban"></kanban>
        <div class="items" v-else>
            <project-card v-for="project in projects" :project="project" :key="project.id"></project-card>
        </div>
    </div>

</template>


<script>
    import Kanban from './Kanban.vue';
    import ProjectCard from './ProjectCard.vue';

    export default {
        name: 'project-collection',
        props: ['projects','kanban'],
        components: {Kanban,ProjectCard}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-collection {

        > .items {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin-bottom: 10px;

            .project-card {
                flex: 0 0 calc(25% - 20px);
                margin-top: 10px; margin-bottom: 10px;
            }

        }

    }

</style>

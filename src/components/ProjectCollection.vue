<template>

    <div class="project-collection" :class="{fluid}">
        <kanban :projects="projects" v-if="kanban" :person="person" :show="show"></kanban>
        <div class="items" v-else>
            <div class="item" v-for="project in sortedProjects">
                <project-card :project="project" :key="project.id" :show="show"></project-card>
            </div>
        </div>
    </div>

</template>


<script>
    import Kanban from './Kanban.vue';
    import ProjectCard from './ProjectCard.vue';

    export default {
        name: 'project-collection',
        props: ['projects','kanban','person','fluid','show','orderBy','order'],
        components: {Kanban,ProjectCard},
        computed: {
            sortedProjects () {
                let order = this.order ? this.order : ['asc','asc'];
                let orderBy = this.orderBy ? this.orderBy : ['target','due'];
                return _.orderBy(this.projects, orderBy, order);
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

        &.fluid .items {

            .item {
                flex: 0 0 200px;

            }

        }

    }

</style>

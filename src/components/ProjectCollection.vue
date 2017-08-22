<template>

    <div class="project-collection">
        <!-- <project-card v-for="project in projects" :project="project" :key="project.id"></project-card> -->
        <kanban :projects="projects"></kanban>
    </div>

</template>


<script>
    import Kanban from './Kanban.vue';

    export default {
        name: 'project-collection',
        props: ['projects'],
        components: {Kanban}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';



</style>

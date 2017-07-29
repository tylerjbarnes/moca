<template>

    <div class="project-collection">
        <project-card v-for="project in projects" :project="project" :key="project.id"></project-card>
    </div>

</template>


<script>
    import ProjectCard from './ProjectCard.vue';

    export default {
        name: 'project-collection',
        props: ['projects'],
        components: {ProjectCard}
    }

</script>


<style lang="scss">
    @import '../theme.scss';



</style>

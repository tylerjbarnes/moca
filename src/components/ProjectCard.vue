<template>

    <router-link tag="div" class="project-card" :to="{ name: 'team-project', params: { id: project.id }}">
        <span class="name">{{ project.name }}</span>
    </router-link>

</template>


<script>

    export default {
        name: 'project-card',
        props: ['project']
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .project-card {
        border: 1px solid $shadow;
        border-radius: 5px;
        padding: 10px;
        width: 240px; height: 120px;

        span.name {
            font-weight: 700;

        }

    }

</style>

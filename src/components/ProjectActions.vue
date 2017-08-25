<template>

    <div class="project-actions">
        <quick-log :project="project" :disabled="project.hoursLogged >= project.max"></quick-log>
        <button class="button primary">Submit</button>
    </div>

</template>


<script>
    import QuickLog from './QuickLog.vue';

    export default {
        name: 'project-actions',
        props: ['project'],
        components: {QuickLog}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-actions {
        display: flex;
        height: 30px;
        margin: 0 -5px;

        > * {
            margin: 0 5px;
        }

    }

</style>

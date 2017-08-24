<template>

    <div class="project-actions">
        <template v-if="project.hoursLogged < project.max">
            <quick-log :project="project"></quick-log>
            <button class="button primary">Submit</button>
        </template>
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

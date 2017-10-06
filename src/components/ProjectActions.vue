<template>

    <div class="project-actions">
        <button class="button">Edit Project</button>
        <button class="button">Add Resource</button>
        <button class="button dangerous">Reject</button>
        <button class="button primary">Approve</button>
    </div>

</template>


<script>

    export default {
        name: 'project-actions',
        props: ['project'],
        components: {}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-actions {
        background: white;
        border-top: 1px solid $gray;
        display: flex;
        height: 40px;
        justify-content: center;
        margin: 0 -5px;

        > * {
            margin: 0 5px;
        }

    }

</style>

<template>

    <div class="project-actions">
        <button class="button">Edit Project</button>
        <button class="button">Add Resource</button>
        <button @click="moveProjectBackward" class="button dangerous" v-if="project.canMoveBackward">{{ project.previousStatusActionName }}</button>
        <button @click="moveProjectForward" class="button primary">{{ project.nextStatusActionName }}</button>
    </div>

</template>


<script>

    // import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'project-actions',
        props: ['project'],
        components: {},
        methods: {
            moveProjectForward () { this.project.moveForward(); },
            moveProjectBackward () { this.project.moveBackward(); }
        }
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

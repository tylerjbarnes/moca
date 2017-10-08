<template>

    <div class="project-actions">
        <button class="button" @click="edit" v-if="$store.state.user.canManage" :style="{backgroundColor: project.manager.color}">Edit Project</button>
        <button class="button" :style="{backgroundImage: gradientString()}">Add Resource</button>
        <button v-if="!$store.state.user.canManage" class="button dangerous">Request Time</button>
        <button @click="moveProjectBackward" v-if="$store.state.user.canManage && project.canMoveBackward" class="button dangerous">{{ project.previousStatusActionName }}</button>
        <button v-if="$store.state.user.canManage || project.status == 'do'" @click="moveProjectForward" class="button primary">{{ project.nextStatusActionName }}</button>
    </div>

</template>


<script>

    // import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'project-actions',
        props: ['project'],
        components: {},
        methods: {
            edit () {
                this.$router.push({ name: this.$store.state.route.view + '-project-editor', params: { id: this.project.id }});
            },
            moveProjectForward () { this.project.moveForward(); },
            moveProjectBackward () { this.project.moveBackward(); },
            gradientString () {
                return 'linear-gradient(20deg,' +
                this.project.manager.color + ' 0%,' +
                (this.project.contractor ?
                    this.project.contractor.color :
                    this.project.manager.lightColor)
                    + ' 120%)'
            }
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

<template>

    <div class="project-actions">
        <button class="button" @click="edit(false)" v-if="user.canManage && !project.archived" :style="{backgroundColor: project.manager.color}">Edit Project</button>
        <button class="button" v-if="!project.archived" :style="{backgroundImage: gradientString()}" @click="$emit('addResource')">Add Resource</button>
        <div class="request-time" v-if="!user.canManage && project.status == 'do'">
            <button class="button" :class="{dangerous: !requesting}" @click="toggleRequesting" :disabled="this.project.hasPendingTimeRequest">{{ requesting ? 'Cancel Request' : 'Request Time'}}</button>
            <request-view :project="project" v-if="requesting" @closeRequest="requesting = false"></request-view>
        </div>
        <button @click="moveProjectBackward" v-if="user.canManage && project.canMoveBackward  && !project.archived" class="button dangerous">{{ project.previousStatusActionName }}</button>
        <button v-if="(user.canManage || project.status == 'do')  && !project.archived" @click="moveProjectForward" class="button primary">{{ project.nextStatusActionName }}</button>
        <button v-if="user.canManage && project.archived" @click="unarchive" class="button">Unarchive</button>
        <button v-if="user.canManage && project.archived" @click="recycle" class="button primary">Recycle</button>
    </div>

</template>


<script>

    import RequestView from './RequestView.vue';
    import HasMoca from '../mixins/HasMoca.js';

    export default {
        name: 'project-actions',
        props: ['project'],
        data () {return {
            requesting: false
        }},
        components: {RequestView},
        mixins: [HasMoca],
        methods: {
            toggleRequesting () {
                this.requesting = this.requesting ? false : true;
            },
            edit (focusContractor) {
                this.$router.push({ name: this.$store.state.route.view + '-project-editor', params: { id: this.project.id, focusContractor }});
            },
            moveProjectForward () {
                this.project.status == 'delegate' ?
                    this.edit(true) :
                    this.project.moveForward();
            },
            unarchive () {
                this.project.unarchive();
                router.replace({name: 'team-project', params: { id: this.project.id }});
            },
            recycle () {
                this.project.recycle();
                router.replace({name: 'team-project', params: { id: this.project.id }});
            },
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
        padding: 0 7.5px;

        > * {
            margin: 0 5px;
        }

        .request-time {
            display: flex;
            position: relative;

            > button {
                z-index: 10;
            }

        }

    }

</style>

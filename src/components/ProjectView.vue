<template>

    <div class="project-view">
        <template v-if="project"><div class="project-modal">

            <project-panel :project="project"></project-panel>
            <resource-view v-for="resource in project.resources" :resource="resource" key="resource.id"></resource-view>
            <conversation-view :project="project"></conversation-view>

        </div></template>
    </div>

</template>


<script>
    import ConversationView from './ConversationView.vue';
    import ResourceView from './ResourceView.vue';
    import ProjectPanel from './ProjectPanel.vue';

    export default {
        name: 'project-view',
        props: ['id'],
        components: {ConversationView,ResourceView,ProjectPanel},
        computed: {
            project () {
                return this.$store.getters.project(this.id);
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-view {
        align-self: flex-start;
        margin: 40px;
        max-height: calc(750px - 80px);
        width: 100%; height: calc(100vh - 80px);
        z-index: 2;

        .project-modal {
            background: $light;
            display: flex;
            overflow: hidden;
            margin: 0 auto;
            max-height: 750px; max-width: 1000px;
            width: 100%; height: 100%;
            @include shadow;

            .project-panel {
                flex: 0 1;

            }

        }

    }

</style>

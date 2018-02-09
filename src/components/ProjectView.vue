<template>

    <div class="project-view">
        <template v-if="project && project.resources && project.hoursLogged !== null && project.messages"><div class="project-modal">

            <div class="project-main">
                <project-header :project="project"></project-header>
                <div class="resources" ref="resources">
                    <div class="items">
                        <resource-view v-for="resource in resources" :resource="resource" :key="resource.id"></resource-view>
                        <resource-view v-if="draftResource" :resource="draftResource" :isDraft="true" @closeDraft="closeDraft"></resource-view>
                        <files-view :client="project.client"></files-view>
                    </div>
                </div>
                <project-actions :project="project" @addResource="addResource"></project-actions>
            </div>
            <conversation-view v-if="mode == 'messages'" :project="project"></conversation-view>

        </div></template>
    </div>

</template>


<script>
    import ConversationView from './ConversationView.vue';
    import ResourceView from './ResourceView.vue';
    import ProjectHeader from './ProjectHeader.vue';
    import FilesView from './FilesView.vue';
    import ProjectActions from './ProjectActions.vue';
    import MocaFactory from '../objects/mocaFactory.js';
    import Resource from '../objects/resource.js';

    export default {
        name: 'project-view',
        props: ['id'],
        data () { return {
            fetch: [
                {bufferName: 'messagesByProject', id: this.id},
                {bufferName: 'resourcesByProject', id: this.id},
                {bufferName: 'timesByProject', id: this.id}
            ],
            mode: 'messages',
            draftResource: null
        }},
        components: {ConversationView,ResourceView,ProjectHeader,ProjectActions,FilesView},
        computed: {
            project () {
                return this.$store.getters.project(this.id);
            },
            resources () {
                return this.project.resources.slice().reverse();
            },
            contractorId () {
                return this.project.contractor_id;
            }
        },
        methods: {
            addResource () {
                this.draftResource = new Resource(MocaFactory.constructPrimitive('resource', {
                    client_id: this.project.client.id,
                    project_id: this.project.id,
                    cycle: this.project.cycle
                }));
                let el = this.$refs.resources;
                setTimeout(function () { el.scrollTop = el.scrollHeight; }, 0);
            },
            closeDraft () {
                this.draftResource = null;
                let el = this.$refs.resources;
                setTimeout(function () { el.scrollTop = 0; }, 0);
            }
        },
        watch: {
            contractorId: (newValue) => {
                if (!store.getters.user.canManage && newValue != store.getters.user.id) {
                    router.replace({name: store.state.route.view});
                }
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
        max-width: 1000px;
        width: 100%; height: calc(100vh - 80px);
        z-index: 2;

        .project-modal {
            background: $light;
            border-radius: 5px;
            display: flex;
            overflow: hidden;
            margin: 0 auto;
            max-height: 750px;
            overflow: hidden;
            width: 100%; height: 100%;
            @include shadow;

            .project-main {
                display: flex;
                flex-flow: column;
                flex: 1 1;
                width: 0;

                .resources {
                    background: white;
                    flex: 1 1;
                    overflow: scroll;
                    .items {
                        padding: 0 20px 20px 20px;

                        .files-view {
                            padding-top: 10px;
                        }

                    }
                }

            }

            .conversation-view {
                border-left: 1px solid $gray;
                width: 400px;
            }

        }

    }

</style>

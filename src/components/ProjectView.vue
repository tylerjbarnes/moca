<template>

    <div class="project-view">
        <template v-if="project"><div class="project-modal">

            <div class="project-main">
                <!-- <header>
                    <div class="mode">
                        <input type="radio" id="mode-resources" value="resources" v-model="mode">
                        <label for="mode-resources">Resources</label>
                        <input type="radio" id="mode-messages" value="messages" v-model="mode">
                        <label for="mode-messages">Messages</label>
                    </div>
                </header> -->
                <project-header :project="project"></project-header>
                <div class="resources">
                    <div class="items">
                        <resource-view v-for="resource in project.resources.reverse()" :resource="resource" key="resource.id"></resource-view>
                    </div>
                </div>
            </div>
            <conversation-view v-if="mode == 'messages'" :project="project"></conversation-view>

        </div></template>
    </div>

</template>


<script>
    import ConversationView from './ConversationView.vue';
    import ResourceView from './ResourceView.vue';
    import ProjectHeader from './ProjectHeader.vue';

    export default {
        name: 'project-view',
        props: ['id'],
        data () { return {
            mode: 'messages'
        }},
        components: {ConversationView,ResourceView,ProjectHeader},
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
            border-radius: 5px;
            display: flex;
            overflow: hidden;
            margin: 0 auto;
            max-height: 750px; max-width: 1000px;
            overflow: hidden;
            width: 100%; height: 100%;
            @include shadow;

            .project-main {
                display: flex;
                flex-flow: column;
                flex: 1 1;

                .resources, .conversation-view {
                    flex: 1 0;
                }

                .resources {
                    background: white;
                    overflow: scroll;
                    .items {
                        padding: 0 20px 20px 20px;
                    }
                }

            }

            .conversation-view {
                border-left: 1px solid $light;
                flex: 1 1;
            }

        }

    }

</style>

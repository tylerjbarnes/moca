<template>

    <div class="project-view">
        <template v-if="project"><div class="project-modal">

            <project-panel :project="project"></project-panel>
            <div class="project-main">
                <header>
                    <div class="mode">
                        <input type="radio" id="mode-resources" value="resources" v-model="mode">
                        <label for="mode-resources">Resources</label>
                        <input type="radio" id="mode-messages" value="messages" v-model="mode">
                        <label for="mode-messages">Messages</label>
                    </div>
                </header>
                <resource-view v-if="mode == 'resources'" v-for="resource in project.resources.reverse()" :resource="resource" key="resource.id"></resource-view>
                <conversation-view v-if="mode == 'messages'" :project="project"></conversation-view>
            </div>

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
        data () { return {
            mode: 'messages'
        }},
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

            .project-main {
                display: flex;
                flex-flow: column;
                flex-grow: 1;

                > header {
                    border-bottom: 1px solid darken($light, 5%);
                    display: flex;
                    margin: 20px;
                    padding-bottom: 20px;

                    .mode {
                        background: darken($light, 5%);
                        border-radius: 5px;
                        display: flex;
                        padding: 7.5px;

                        input {
                            position: absolute !important;
                            clip: rect(0, 0, 0, 0);
                            height: 1px;
                            width: 1px;
                            border: 0;
                            overflow: hidden;

                        }

                        label {
                            display: block;
                            flex: 1 1;
                            font-size: 0.9em;
                            font-weight: 900;
                            text-align: center;
                            opacity: 0.37;
                            margin: 0 5px;
                            padding: 5px 25px;
                            transition: 0.3s;
                            // outline: 1px solid blue;

                            &:first-of-type { margin-left: 0; }
                            &:last-of-type { margin-right: 0; }

                        }

                        input:checked + label {
                            background-color: white;
                            border-radius: 3px;
                            opacity: 1;
                            @include shadow;

                        }

                        input:focus + label {
                            @include shadow(rgba(black,0.15));
                        }

                    }

                }

            }

        }

    }

</style>

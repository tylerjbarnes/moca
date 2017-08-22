<template>

    <div class="project-view">
        <div class="project-modal">

            <template v-if="project">

                <div class="middle">

                    <div class="side-panel">
                        <h2 class="client-name">{{ project.client.name }}</h2>
                        <h1 class="project-name">{{ project.name }}</h1>
                        <person-tag :person="project.manager"></person-tag>
                        <person-tag v-if="project.contractor" :person="project.contractor"></person-tag>
                    </div>

                    <div class="project-main">
                        <div class="resources">
                            <resource-view v-for="resource in project.resources" :resource="resource" key="resource.id"></resource-view>
                            <conversation-view :project="project"></conversation-view>
                        </div>
                    </div>

                </div>

            </template>

        </div>
    </div>

</template>


<script>
    import ConversationView from './ConversationView.vue';
    import ResourceView from './ResourceView.vue';
    import PersonTag from './PersonTag.vue';

    export default {
        name: 'project-view',
        props: ['id'],
        components: {ConversationView,ResourceView,PersonTag},
        computed: {
            project () {
                return this.$store.getters.project(this.id);
            },
            resourceTest () {
                return this.project.resources.length ? markdown(this.project.resources[0].content.body) : '';
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
            background: desaturate($light, 100%);
            box-shadow: 0px 5px 50px 0px rgba(black, 0.25);
            display: flex;
            flex-flow: column;
            overflow: hidden;
            margin: 0 auto;
            max-height: 750px;
            max-width: 1000px;
            position: relative;
            width: 100%; height: 100%;

            .middle {
                display: flex;
                flex: 1 1;
                position: relative;

                .side-panel {
                    background: white;
                    // background: darken($primary,0%);
                    // color: white;
                    padding: 20px;
                    width: 300px;

                    h1.project-name {
                        font-size: 1.4em;
                        font-weight: 900;

                    }

                }

                .project-main {
                    flex: 1 1;
                    padding: 20px;

                }



            }

        }

    }

</style>

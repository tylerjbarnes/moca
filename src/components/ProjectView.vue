<template>

    <div class="project-view">
        <div class="project-modal">

            <div class="project-main">
                {{ project.name }}
                <div class="resources">
                    <div class="resource" v-for="resource in project.resources">{{ resource.content.body }}</div>
                </div>
            </div>

            <div class="message-panel">
                <conversation-view :messages="project.messages"></conversation-view>
                <div class="create" ref="dynamicHeight">
                    <div class="textarea-wrapper">
                        <textarea rows="1" placeholder="Ask a question..." @input="resizeTextarea($event.target.value)"></textarea>
                        <div class="clone" ref="clone"></div>
                    </div>
                    <div class="send">
                        <ceri-icon name="fa-paper-plane" size="15" hcenter></ceri-icon>
                    </div>
                </div>
            </div>

        </div>
    </div>

</template>


<script>
    import ConversationView from './ConversationView.vue';

    export default {
        name: 'project-view',
        props: ['id'],
        components: {ConversationView},
        computed: {
            project () {
                let project = this.$store.getters.project(this.id);
                return project ? project : ""; // @todo need an actual async fix
            },
            resourceTest () {
                return this.project.resources.length ? markdown(this.project.resources[0].content.body) : '';
            }
        },
        methods: {
            resizeTextarea (value) {
                this.$refs.clone.innerHTML = value + ' ';
                let newHeight = this.$refs.clone.clientHeight;
                this.$refs.dynamicHeight.style.height = newHeight + 'px';
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .project-view {
        align-self: flex-start;
        margin: 40px;
        z-index: 2;

        .project-modal {
            background: $white-ter;
            box-shadow: 0px 5px 50px 0px rgba(black, 0.25);
            position: relative;
            width: 900px; height: 500px;

            .message-panel {
                background: white;
                border-left: 2px solid darken($white-ter, 5%);
                display: flex;
                    flex-flow: column;
                width: 350px;
                position: absolute;
                    top: 0; right: 0; bottom: 0;

                .conversation-view {
                    flex: 1 1;
                }

                .create {
                    border-top: 1px solid $shadow;
                    position: relative;
                    width: 100%; height: 40px;

                    .textarea-wrapper {
                        height: 100%;
                        padding-right: 40px;
                        position: relative;

                        textarea {
                            border: none;
                            box-sizing: border-box;
                            font: inherit;
                            outline: none;
                            padding: 7.5px 0 7.5px 10px;
                            resize: none;
                            width: 100%; height: 100%;

                        }

                        .clone {
                            background: white;
                            color: black;
                            height: auto;
                            min-height: 40px;
                            padding: 7.5px 0 7.5px 10px;
                            visibility: hidden;
                            white-space: pre-wrap;


                        }

                    }

                    .send {
                        position: absolute;
                            bottom: 0; right: 0;
                        text-align: center;
                        width: 40px; height: 100%;

                        ceri-icon {
                            color: $green;

                        }

                    }

                }

            }

        }

    }

</style>

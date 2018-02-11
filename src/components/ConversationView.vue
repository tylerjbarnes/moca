<template>

    <div class="conversation-view">
        <div class="items" ref="items">
            <message-view v-for="message in messages" :key="message.id" :message="message"></message-view>
        </div>
        <div class="create" ref="dynamicHeight">
            <div class="textarea-wrapper">
                <textarea ref="textarea" rows="1" :placeholder="project.archived ? '' : 'Send a message...'" @input="resizeTextarea($event.target.value)" v-model="messagePrimitive.content" @keydown="handleEnter" :disabled="project.archived"></textarea>
                <div class="clone" ref="clone"></div>
            </div>
            <button class="send" @click="createMessage" :disabled="!messagePrimitive.content.length">
                <icon name="paper-plane" scale="1.5"></icon>
            </button>
        </div>
    </div>

</template>


<script>
    import MessageView from './MessageView.vue';
    import MocaFactory from '../objects/mocaFactory.js';
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'conversation-view',
        props: ['project'],
        data () { return {
            messagePrimitive: this.newMessagePrimitive()
        }},
        components: {MessageView},
        computed: {
            messages () {
                // return this.project.messages.reverse();
                return this.project.messages;
            },
            content () {
                return this.messagePrimitive.content;
            }
        },
        methods: {
            handleEnter (e) {
                if (e.keyCode == 13) {
                    if (!e.altKey) {
                        e.preventDefault();
                        this.createMessage();
                    } else {
                        this.messagePrimitive.content += "\n";
                        this.resizeTextarea(this.messagePrimitive.content);
                    }
                }
            },
            newMessagePrimitive () {
                return MocaFactory.constructPrimitive('message',{
                    type: 'chat',
                    project_id: this.project.id,
                    cycle: this.project.cycle
                });
            },
            resizeTextarea (value) {
                this.$refs.clone.innerHTML = _.escape(value) + ' ';
                let newHeight = this.$refs.clone.clientHeight;
                this.$refs.dynamicHeight.style.height = newHeight + 'px';
            },
            createMessage () {
                if (!this.messagePrimitive.content) { return; }
                this.messagePrimitive.datetime = new moment().utc().format('YYYY-MM-DD HH:mm:ss');
                new MocaMutationSet(
                    'create',
                    'message',
                    this.messagePrimitive.id,
                    this.messagePrimitive
                ).commit();
                this.messagePrimitive = this.newMessagePrimitive();
                this.resizeTextarea('');
            },
            focus () {
                this.$refs.textarea.focus();
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .conversation-view {
        display: flex;
            flex-flow: column;
        width: 100%; height: 100%;

        .items {
            display: flex;
            flex-flow: column-reverse;
            flex: 1 1;
            overflow: scroll;
            padding: 20px;
            width: 100%;

        }

        .create {
            border-top: 1px solid $gray;
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
                    max-height: 200px;
                    min-height: 40px;
                    padding: 7.5px 0 7.5px 10px;
                    // visibility: hidden;
                    white-space: pre-wrap;


                }

            }

            .send {
                background: white;
                border: none;
                color: $primary;
                outline: none;
                padding: 0;
                position: absolute;
                    bottom: 0; right: 0;
                text-align: center;
                width: 40px; height: 100%;

                transition: 0.3s ease;

                &:disabled {
                    color: $light;

                }

            }

        }

    }

</style>

<template>

    <div class="conversation-view">
        <div class="items" ref="items">
            <message-view v-for="message in messages" key="message.id" :message="message" :replying="message.id == messagePrimitive.parent_id" v-on:toggleReplying="toggleReplying(message.id)"></message-view>
        </div>
        <div class="message-tools">
            <template v-if="messagePrimitive.parent_id">
                <span class="replying" v-text="replyingTo"></span>
                <button @click="clearReplying">x</button>
            </template>
        </div>
        <div class="create" ref="dynamicHeight">
            <div class="textarea-wrapper">
                <textarea ref="textarea" rows="1" placeholder="Ask a question..." @input="resizeTextarea($event.target.value)" v-model="messagePrimitive.content"></textarea>
                <div class="clone" ref="clone"></div>
            </div>
            <button class="send" @click="createMessage" :disabled="!messagePrimitive.content.length">
                <ceri-icon name="fa-paper-plane" size="15" hcenter></ceri-icon>
            </button>
        </div>
    </div>

</template>


<script>
    import MessageView from './MessageView.vue';

    export default {
        name: 'conversation-view',
        props: ['project'],
        data () { return {
            messagePrimitive: {
                id: cuid(),
                parent_id: null,
                author_id: this.$store.state.user.id,
                project_id: this.project.id,
                cycle: this.project.cycle,
                content: '',
                meta: null,
                resolved: false
            },
            previousScrollHeight: 0
        }},
        components: {MessageView},
        // mounted () {
        //     this.scrollToBottom();
        // },
        computed: {
            messages () {
                return this.project.messages.filter(message => !message.parent_id).reverse();
            },
            replyingTo () {
                let message = store.getters.message(this.messagePrimitive.parent_id);
                return 'Replying to ' + message.author.firstName;
            }
        },
        methods: {
            resizeTextarea (value) {
                this.$refs.clone.innerHTML = value + ' ';
                let newHeight = this.$refs.clone.clientHeight;
                this.$refs.dynamicHeight.style.height = newHeight + 'px';
            },
            createMessage () {
                this.$store.dispatch('createObject',{
                    type: 'message',
                    primitive: this.messagePrimitive
                });
                let me = this;
                this.messagePrimitive.id = cuid();
                this.messagePrimitive.content = '';
                this.messagePrimitive.parent_id = null;
            },
            // scrollToBottom () {
            //     let me = this;
            //     setTimeout(function () {
            //         me.$refs.items.scrollTop = me.$refs.items.scrollHeight;
            //     }, 0);
            // },
            toggleReplying (messageId) {
                this.messagePrimitive.parent_id == messageId ?
                    this.messagePrimitive.parent_id = null :
                    this.messagePrimitive.parent_id = messageId;
                this.$refs.textarea.focus();
            },
            clearReplying () {
                this.messagePrimitive.parent_id = null;
            }
        },
        // watch: {
        //     messages: function (newVal) {
        //         this.scrollToBottom();
        //     }
        // }
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
            width: 100%;

        }

        .message-tools {
            background: $gray;
            display: flex;
            height: 20px;

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
                    visibility: hidden;
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

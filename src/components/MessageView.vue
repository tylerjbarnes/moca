<template>

    <div class="message-view">
        <header>
            <img :src="message.author.avatar">
            {{ message.author.name }}
            <button class="reply" v-if="!isReply" @click="toggleReplying" :class="{active:replying}">
                <ceri-icon name="ma-reply" size="15" hcenter></ceri-icon>
            </button>
        </header>
        <div class="main">
            <div class="markup" v-html="markup"></div>
        </div>
        <div class="replies">
            <message-view v-for="message in replies" :message="message" :key="message.id" :isReply="true">Hey!</message-view>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'message-view',
        props: ['message','isReply','replying'],
        computed: {
            markup () {
                return markdown(this.message.content);
            },
            replies () {
                return this.$store.getters.messagesByParent(this.message.id);
            }
        },
        methods: {
            toggleReplying () {
                this.$emit('toggleReplying');
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .message-view {
        background: white;
        border-radius: 5px;
        margin: 20px;
        @include shadow;

        header {
            align-items: center;
            border-bottom: 1px solid darken($light, 3%);
            display: flex;
            font-weight: 700;
            padding: 10px;

            img {
                border-radius: 15px;
                margin-right: 10px;
                width: 30px; height: 30px;
            }

            button.reply {
                background: none;
                border: none;
                color: $dark;
                outline: none;

                &.active {
                    color: $primary;
                }
            }

        }

        .main {
            padding: 20px;

        }

    }

</style>

<template>

    <div class="message-view" :class="{self: message.author_id == $store.state.user.id}">
        <header>
            <img :src="message.author.avatar">
            <span class="name">{{ message.author.firstName }}</span>
            <span class="time">{{ message.datetime | time }}</span>
        </header>
        <div class="main">
            <div class="card"  :style="{
                backgroundColor: message.author_id == $store.state.user.id ? message.author.color : ''
            }">
                <div class="markup" v-html="markup"></div>
            </div>
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
        display: block;
        margin-left: -5px;
        margin-right: 20px;

        &.self {
            margin-left: 20px;
            margin-right: 0;
            header {
                justify-content: flex-end;
                margin-top: 0;
                img, span.name {
                    visibility: hidden;
                }
            }
            .main {
                font-weight: 700;
                justify-content: flex-end;
                .card, .card * {
                    color: white !important;
                    strong {
                        font-weight: 900;
                    }
                }
            }
        }

        &:hover {
            span.time {
                opacity: 0.5;
            }
        }

        header {
            align-items: center;
            display: flex;
            font-weight: 700;
            margin-top: 10px;
            padding: 5px 0;

            img {
                border-radius: 15px;
                margin-right: 5px;
                width: 30px; height: 30px;
                z-index: 5;
            }

            span.name {
                font-size: 0.8em;
            }

            span.time {
                font-size: 0.8em;
                opacity: 0;
                padding-left: 5px;
                transition: 0.3s;
            }

        }

        .main {
            display: flex;

            .card {
                background: white;
                border-radius: 5px;
                display: flex;
                margin-top: -10px;
                margin-left: 15px;
                overflow: auto;
                padding: 10px 15px;
                @include shadow;

                ul {
                    margin-left: 20px;
                    li {
                        list-style: disc;
                    }
                }

            }

        }

    }

</style>

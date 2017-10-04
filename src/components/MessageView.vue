<template>

    <div class="message-view" :class="{self: message.author_id == $store.state.user.id}">
        <header>
            <img :src="message.author.avatar">
            <span class="name">{{ message.author.firstName }}</span>
            <div class="extras">
                <span class="time">{{ message.datetime | time }}</span>
                <span class="delete" @click="deleteMessage" v-if="canDelete"></span>
            </div>
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

    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'message-view',
        props: ['message'],
        computed: {
            markup () {
                return markdown(this.message.content);
            },
            canDelete () {
                return store.state.user.canManage;
            }
        },
        methods: {
            deleteMessage () {
                if (confirm("Are you sure you want to delete this message?")) {
                    new MocaMutationSet(
                        'delete',
                        'message',
                        this.message.id
                    ).commit();
                }
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
            .extras {
                opacity: 1;
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

            .extras {
                align-items: center;
                display: flex;
                font-size: 0.8em;
                opacity: 0;
                transition: 0.3s;

                span.time {

                    opacity: 0.5;
                    padding-left: 5px;

                }

                span.delete {
                    margin-left: 2px;
                    opacity: 0.75;
                    transform: scale(0.65);
                }

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

                ul, ol {
                    margin-left: 20px;
                    li {
                        list-style: disc;
                    }
                }

                h1 { font-weight: 900; font-size: 1.5em; }
                h2 { font-weight: 900; font-size: 1.2em; }
                h3 { font-weight: 700; font-size: 1.1em; }

                a {
                    text-decoration: underline;
                }

            }

        }

    }

</style>

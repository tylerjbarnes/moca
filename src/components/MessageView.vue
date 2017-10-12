<template>

    <div class="message-view chat" v-if="message.type == 'chat'" :class="{self: message.author_id == $store.state.user.id}">
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
                <span class="resolve" @click="resolveMessage" :class="{off: !message.userCanResolve}">
                    <ceri-icon name="fa-check" size="12" hcenter></ceri-icon>
                </span>
                <span class="resolved" v-if="message.author.canManage == $store.state.user.canManage && message.resolved">
                    <ceri-icon name="fa-check" size="10" hcenter></ceri-icon>
                </span>
            </div>
        </div>
    </div>
    <div class="message-view request" :class="{unresolved: !message.resolved}" v-else-if="message.type == 'request'">
        <div class="card">
            <div class="description" v-html="message.requestDescription"></div>
            <div class="actions" v-if="message.userCanResolve">
                <button class="button dangerous" @click="message.reject()">Deny</button>
                <button class="button primary" @click="message.approve()">Allow</button>
            </div>
        </div>
    </div>
    <div class="message-view mutation" :class="[message.mutationDescription.style]" v-else>
        <div class="description">{{ message.mutationDescription.string }} <span class="time">{{ message.datetime | time }} ago</span></div>
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
            },
            resolveMessage () {
                new MocaMutationSet(
                    'update',
                    'message',
                    this.message.id,
                    {resolved: true}
                ).commit();
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

        &.mutation {
            margin-left: 20px;
            &.section-heading {
                border-bottom: 1px solid darken($gray,5%);
                margin: 0 10px;
                padding: 5px 10px;

                .time { display: none; }
                .description {
                    color: $dark;
                    font-size: 1em;
                    text-transform: none;
                }
            }

            .description {
                color: $medium-dark;
                font-size: 0.9em;
                font-weight: 700;
                padding-top: 30px;
                text-align: center;

                .time {
                    font-weight: 500;
                }
            }
        }

        &.request {
            margin-left: 20px;
            .card {
                background: none;
                box-shadow: none;
                color: $medium-dark;
                font-size: 0.9em;
                font-weight: 500;
                padding-top: 30px;
                text-align: center;

                strong {
                    color: inherit;
                }
            }

            &.unresolved {
                .card {
                    background: white;
                    border-radius: 5px;
                    color: $dark;
                    margin-top: 20px;
                    padding: 10px 15px;
                    @include shadow;

                    .actions {
                        border-top: 1px solid $gray;
                        display: flex;
                        justify-content: center;
                        padding: 10px 10px 0 10px;
                        margin-top: 10px;

                        button {
                            // font-size: 1em;
                            &:not(:first-of-type) {
                                margin-left: 10px;
                            }
                        }

                    }
                }
            }
        }

        &.self {
            margin-left: 20px;
            margin-right: 0;
            header {
                justify-content: flex-end;
                margin-top: 0;
                img {
                    visibility: hidden;
                    width: 10px;
                }
                span.name {
                    display: none;
                }
            }
            .main {
                font-weight: 700;
                justify-content: flex-end;
                .card, .card * {
                    @include markup(true);
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
                overflow: visible;
                padding: 10px 15px;
                position: relative;
                @include shadow;
                @include markup;

                .resolve {
                    background: $orange;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    height: 25px; width: 25px;
                    position: absolute;
                        bottom: -10px; right: -10px;
                    text-align: center;
                    transition: 0.3s ease;
                    @include shadow;

                    &.off {
                        transform: scale(0);
                    }

                    &:hover {
                        background: $green;
                        transform: scale(1.1);
                        &.off {
                            transform: scale(0);
                        }

                    }
                    &:active {
                        background: darken($green, 10%);
                        transform: scale(1);

                    }

                }

                .resolved {
                    height: 12px;
                    position: absolute;
                        bottom: 4px; right: 3px;
                    opacity: 0.37;
                }

            }

        }

    }

</style>

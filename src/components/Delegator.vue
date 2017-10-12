<template>

    <div class="delegator">
        <div class="card">
            <div ref="generalDropzone" class="contractors dropzone" @dragover="generalDragover" @dragexit="generalDragexit">
                <div class="contractor dropzone" v-for="contractor in sortedContractors" @dragover="dragover($event,contractor)" @dragexit="dragexit($event,contractor)" @drop="drop($event,contractor)">
                    <div class="avatar-wrapper">
                        <div class="avatar">
                            <img :src="contractor.avatar">
                            <transition name="scale">
                                <div class="online-dot" v-if="contractor.online"></div>
                            </transition>
                        </div>
                    </div>
                    <span class="name">{{ contractor.firstName }}</span>
                </div>
            </div>
        </div>
    </div>

</template>


<script>
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'delegator',
        props: ['project'],
        components: {},
        computed: {
            sortedContractors () {
                return store.getters.members.sort((a,b) => a.firstName > b.firstName);
            }
        },
        methods: {
            dragover (e,contractor) {
                e.target.classList.add('selected');
            },
            dragexit (e,contractor) {
                e.target.classList.remove('selected');
            },
            generalDragexit () {
                bus.$emit('delegationUninvite');
            },
            generalDragover () {
                bus.$emit('delegationInvite');
            },
            drop ({detail:project}, contractor) {
                new MocaMutationSet(
                    'update', 'project',
                    project.id, {
                        status: 'do',
                        contractor_id: contractor.id
                    }
                ).commit();
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .delegator {
        align-items: center;
        display: flex;
        justify-content: center;
        position: fixed;
            bottom: 0; left: 0; right: 0;
        z-index: 15;

        .card {
            background: white;
            display: flex;
            flex-flow: column;
            border-radius: 5px;
            justify-content: center;
            margin-bottom: 10px;
            max-width: 80%;
            padding: 0 10px;
            @include shadow(rgba(black,0.2));

            .prompt {
                border-bottom: 1px solid $light;
                display: block;
                font-size: 1.2em;
                margin: 0 20px;
                padding: 10px 0;
                text-align: center;
            }

            .contractors {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;

                .contractor {
                    display: flex;
                    flex-flow: column;
                    margin: 10px;
                    transition: 0.2s ease;
                    &.selected {
                        transform: scale(1.15);
                    }

                    .avatar-wrapper {
                        display: flex;
                        justify-content: center;

                        .avatar {
                            display: flex;
                            flex: 0 0 50px;
                            position: relative;
                            width: 50px;

                            img {
                                border-radius: 25px;
                                height: 50px;

                            }

                            .online-dot {
                                background: $green;
                                border: 3px solid white;
                                border-radius: 10px;
                                position: absolute;
                                    bottom: -1px; right: -4px;
                                width: 20px; height: 20px;
                            }

                        }
                        .scale-enter-active, .scale-leave-active {
                            transition: transform 0.4s ease;
                        }
                        .scale-enter, .scale-leave-to {
                            transform: scale(0);
                        }

                    }

                    .name {
                        line-height: normal;
                        font-weight: 700;
                        padding-top: 3px;
                        text-align: center;

                    }

                }
            }

            footer {
                border-top: 1px solid $light;
                display: flex;
                justify-content: center;
                margin: 0 20px;
                padding: 10px 0

            }

        }

    }

</style>

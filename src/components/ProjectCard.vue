<template>

    <div @click="open" tag="div" class="project-card" :class="{dragging: isDragDelegate, delegating}" :style="{transform:'translate(' + dragDelta.x + 'px,' + dragDelta.y + 'px)'}">
        <!-- <div class="cycles" :class="{ active: project.autocycle }">
            <ceri-icon name="fa-recycle" size="12" offset-y="-5" hcenter></ceri-icon>
        </div>
        <div class="flag" :class="{ active: project.flagged }">
            <ceri-icon name="fa-flag" size="11" hcenter></ceri-icon>
        </div>
        <div class="unresolved" :class="{ active: project.unresolvedMessages.length }">
            <ceri-icon name="fa-comment" size="11" offset-y="7" hcenter></ceri-icon>
        </div>
        <div class="content">
            <div class="names">
                <span class="client">{{ project.client ? project.client.name : 'No Client' }}</span>
                <span class="project">{{ project.name }}</span>
            </div>
        </div>
        <footer>
            <div class="person-tags">
                <person-tag v-if="show.manager" :person="project.manager"></person-tag>
                <person-tag v-if="show.contractor && project.contractor" :person="project.contractor" :solid="true"></person-tag>
            </div>
            <div class="meta">
                <span class="estimate">{{ project.max | hours }}</span>
                <span class="due" v-if="project.dueString" :class="{overdue: project.overdue}">{{ project.dueString }}</span>
            </div>
        </footer> -->
        {{ project.name }}
    </div>

</template>


<script>
    import PersonTag from './PersonTag.vue';
    import Draggable from '../mixins/Draggable.js';

    export default {
        name: 'project-card',
        props: {
            project: {},
            show: {
                default: () => {
                    return {
                        contractor: false,
                        manager: true
                    }
                }
            }
        },
        computed: {
            payload () {
                return this.project;
            }
        },
        data () { return {
            dragging: false,
            delegating: false,
            dragDelta: {x:0, y:0},
            visible: true
        }},
        components: {PersonTag},
        mixins: [Draggable],
        methods: {
            open () {
                let prefix = this.$store.state.route.view ? this.$store.state.route.view + '-' : 'inbox-';
                this.$router.push({ name: prefix + 'project', params: { id: this.project.id }});
            },
            didAssumeDragDelegacy () {
                bus.$on('delegationInvite', () => { this.delegating = true; });
                bus.$on('delegationUninvite', () => { this.delegating = false; });
            },
            didSurrenderDragDelegacy () {
                bus.$off('delegationInvite');
                bus.$off('delegationUninvite');
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-card {
        background: white;
        border: 2px solid $light;
        border-radius: 5px;
        box-sizing: border-box;
        cursor: default;
        margin: 20px 0;
        padding: 10px;
        position: relative;
        transition: 0.3s ease;
        width: 100%;
        @include unselectable;
        &:hover {
            border-color: white;
            @include shadow;
            .flag, .unresolved {
                // border-top: 1px solid white;
            }
        }
        &.dragging {
            transition: none !important;
            z-index: 100;
        }
        &.pending {
            background: $light;
            border: 2px dashed $medium;
            margin: 19px -1px !important;
            opacity: 0.5;
            * {
                visibility: hidden;
            }
        }
        &.delegating {
            opacity: 0;
            // background: none;
            // border: 2px dashed $medium;
            // height: 40px; width: 40px;
            // margin: 19px -1px !important;
            // opacity: 0.5;
            // top: calc(20px);
            // left: calc(50% - 20px);
            // * {
            //     visibility: hidden;
            // }
        }

        // Badges
        .cycles, .flag, .unresolved {
            background: $light;
            // border: 2px solid $gray;
            border-radius: 3px;
            color: darken($light,10%);
            display: block;
            position: absolute;
                top: -10px;
            text-align: center;
            transition: all 0.15s ease;
            width: 25px; height: 18px;

            ceri-icon {
                height: 17px;

            }
        }
        .cycles {
            right: 70px;

            &.active {
                background: lighten($primary, 35%);
                ceri-icon {
                    color: $primary;
                }
            }
        }
        .flag {
            right: 10px;

            &.active {
                background: lighten($red, 35%);
                ceri-icon {
                    color: $red;
                }
            }

        }
        .unresolved {
            right: 40px;

            &.active {
                background: lighten($orange, 35%);
                ceri-icon {
                    color: $orange;
                }
            }

        }

        .content {
            margin: 0 0 10px 0;

            .names {
                display: flex;
                flex-flow: column;

                span.client {
                    font-size: 0.9em;
                    opacity: 0.75;
                    margin-bottom: 0;
                }

                span.project {
                    font-weight: 700;

                }

            }

        }

        footer {
            align-items: center;
            border-radius: 0 0 5px 5px;
            display: flex;
            justify-content: space-between;
            width: 100%;
            flex-flow: column;

            .person-tags {
                display: flex;
                width: 100%;
                .person-tag {
                    margin-right: 7.5px;
                }
            }

            .meta {
                justify-content: flex-end;
                display: flex;
                flex-wrap: wrap;
                margin-top: 10px;
                width: 100%;

                span {
                    display: block;
                    font-size: 0.9em;
                    opacity: 0.75;
                    text-align: right;

                    &.due {
                        font-weight: 900;
                        padding-left: 5px;

                        &.overdue {
                            color: $red;
                        }

                    }

                }

            }

        }

    }

</style>

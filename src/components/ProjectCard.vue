<template>

    <div @mousedown="considerDragDelegacy" @mouseup="cancelDragDelegacy" @click="open" tag="div" class="project-card" :class="{dragging}" :style="{transform:'translate(' + dragDelta.x + 'px,' + dragDelta.y + 'px)'}">
        <div class="flag" :class="{ active: project.flagged }">
            <ceri-icon name="fa-flag" size="10" hcenter></ceri-icon>
        </div>
        <div class="unresolved" :class="{ active: project.unresolvedMessages.length }">
            <ceri-icon name="fa-comment" size="9" hcenter></ceri-icon>
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
                <span class="estimate">{{ project.estimate | hours }}</span>
                <span class="due" v-if="project.dueString">{{ project.dueString }}</span>
            </div>
        </footer>
    </div>

</template>


<script>
    import PersonTag from './PersonTag.vue';

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
        data () { return {
            dragging: false,
            dragDelta: {x:0, y:0},
            visible: true,
            dragTimeout: null
        }},
        components: {PersonTag},
        methods: {
            open () {
                if (this.dragging) { return; }
                this.$router.push({ name: this.$store.state.route.view + '-project', params: { id: this.project.id }});
            },
            considerDragDelegacy (event) {
                this.dragTimeout = setTimeout(() => {
                    this.becomeDragDelegate(event);
                }, 200);
            },
            cancelDragDelegacy () {
                if (this.dragTimeout) {
                    clearTimeout(this.dragTimeout);
                }
            },
            becomeDragDelegate (event) {
                this.dragging = true;
                bus.$emit('setDragStart', event.clientX, event.clientY, this.project)
                let me = this;
                bus.$on('updateDragDelta', (dragDelta) => {
                    me.dragDelta = dragDelta;
                });
                bus.$on('setDragDelegateVisibility', (visible) => {
                    this.$el.style.visibility = visible ? 'visible': 'hidden';
                });
                bus.$on('clearDrag', (dragDelta) => {
                    me.dragDelta = {x:0,y:0};
                    bus.$off('updateDragDelta');
                    bus.$off('clearDrag');
                    bus.$off('setDragDelegateVisibility');
                    setTimeout(function () { me.dragging = false; }, 0);
                });
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

        // Badges
        .flag, .unresolved {
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
        .flag {
            right: 10px;

            &.active {
                background: lighten($orange, 35%);
                ceri-icon {
                    color: $orange;
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

                    }

                }

            }

        }

    }

</style>

<template>
    <div id="app" @mousemove="updateDragDelta" @scroll="updateDragDelta">
        <header>
            <div class="logo"></div>
            <nav>
                <router-link :to="{name:'team'}" class="navbar-item">Team</router-link>
                <router-link :to="{name:'clients'}" class="navbar-item">Clients</router-link>
                <router-link :to="{name:'time'}" class="navbar-item">Time</router-link>
            </nav>
        </header>
        <div class="main-container">
            <div class="main">
                <toolbar></toolbar>
                <router-view></router-view>
            </div>
        </div>
        <transition name="modal-fade">
            <div class="modal is-active" v-if="$store.state.route.itemId">
                <router-link tag="div" class="modal-background" :to="{name: $store.state.route.view}"></router-link>
                <router-view name="modal"></router-view>
            </div>
        </transition>
    </div>
</template>


<script>
    import Toolbar from './components/Toolbar.vue';

    export default {
        name: 'app',
        components: {Toolbar},
        data () { return {
            dragStart: null,
            dropDelegateEl: null,
            previousDropDelegateEl: null,
            payload: null
        }},
        computed: {
            modalOpen () {
                return this.$store.state.route.itemId !== null;
            }
        },
        watch: {
            modalOpen: (newVal) => {
                newVal ?
                    document.body.classList.add('noScroll') :
                    document.body.classList.remove('noScroll');
            }
        },
        methods: {
            updateDragDelta (event) {
                if (!this.dragStart) { return; }
                let x = event.pageX - this.dragStart.x;``
                let y = event.pageY - this.dragStart.y;
                bus.$emit('updateDragDelta', {x, y});

                let dragexitEvent = new CustomEvent('dragexit');


                bus.$emit('setDragDelegateVisibility', false); /////////////////

                // console.log(document.elementFromPoint(event.pageX,event.pageY));

                    this.dropDelegateEl = closestDropZone(document.elementFromPoint(event.pageX,event.pageY));

                    if (this.previousDropDelegateEl !== this.dropDelegateEl) {

                        // release old
                        if (this.previousDropDelegateEl) {
                            dragexitEvent = new CustomEvent('dragexit');
                            this.previousDropDelegateEl.dispatchEvent(dragexitEvent);
                        }

                        // attach new
                        if (this.dropDelegateEl) {
                            let dragoverEvent = new CustomEvent('dragover',{detail:this.payload});
                            this.dropDelegateEl.dispatchEvent(dragoverEvent);
                        }
                    }

                    this.previousDropDelegateEl = this.dropDelegateEl;

                bus.$emit('setDragDelegateVisibility', true); //////////////////

            },
            endDrag () {
                if (!this.dragStart) {return}
                this.dragStart = null;
                bus.$emit('clearDrag');
                if (this.dropDelegateEl) {
                    let dropEvent = new CustomEvent('drop', {detail:this.payload});
                    this.dropDelegateEl.dispatchEvent(dropEvent);
                }
            }
        },
        created () {
            bus.$on('setDragStart', (x, y, payload) => {
                this.dragStart = {x,y};
                this.payload = payload;
            });
            let me = this;
            document.addEventListener('mouseout', (e) => {
                let from = e.relatedTarget || e.toElement;
                if (!from || from.nodeName == "HTML") {
                    me.endDrag();
                }
            });
            document.addEventListener("mouseup", function(e) {
                if (me.dragStart) {
                    me.endDrag();
                }
            }, true);
        }
    }
</script>


<style lang="scss">
    @import './style/settings.scss';
    @import './style/global.scss';

    #app {
        background-color: $light;
        display: flex;
        font-size: 14px;
        min-height: 100vh;

        > header {
            background-color: white;
            border-right: 1px solid $gray;
            position: fixed;
            width: $header-size; height: 100vh;
            z-index: 2;

            nav {
                padding-top: $header-size;

                .navbar-item {
                    text-align: center;

                    &:hover {
                        background: $light;
                    }

                    &.is-active {
                        background: white;
                        color: $primary;
                        font-weight: 900;
                    }

                }

            }

        }

        .main-container {
            flex: 1 1;

            > .main {
                margin-left: $header-size;
                margin-bottom: 20px;
                padding-top: $header-size;
                right: 0; left: 0;

            }

        }

        .modal {
            height: 100%;
            overflow: scroll;
            position: fixed;

            .modal-background {
                background: rgba(black, 0.5);
                position: fixed;

            }
            .modal-card {
                align-self: flex-start;
                box-shadow: 0px 5px 50px 0px rgba(black, 0.25);
                // margin: 40px auto 120px auto;
                max-height: none;
                overflow: visible !important;

                .modal-card-body {
                    overflow: visible;

                }

            }
        }
        .modal-fade-enter-active {
            transition: all 0.25s ease;
            .modal-background {
                transition: all 0.25s;
            }
            .modal-card, .project-modal {
                transition: all 0.25s ease;
            }
        }
        .modal-fade-leave-active {
            transition: all 0.15s ease;
            .modal-background {
                transition: all 0.15s;
            }
            .modal-card, .project-modal {
                transition: all 0.15s ease;
            }
        }
        .modal-fade-enter, .modal-fade-leave-to {
            .modal-background {
                opacity: 0;
            }
            .modal-card, .project-modal {
                opacity: 0;
                transform: scale(0.925);
            }
        }

    }
</style>

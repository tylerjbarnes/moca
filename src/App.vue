<template>
    <div id="app" v-if="appReady">
        <header>
            <nav class="primary-nav">
                <router-link :to="{name:'inbox'}"    class="navbar-item"                       >Inbox</router-link>
                <router-link :to="{name:'projects'}" class="navbar-item" v-if="!user.canManage">Projects</router-link>
                <router-link :to="{name:'team'}"     class="navbar-item" v-if="user.canManage" >Team</router-link>
                <router-link :to="{name:'clients'}"  class="navbar-item" v-if="user.canManage" >Clients</router-link>
                <router-link :to="{name:'time'}"     class="navbar-item"                       >Time</router-link>
                <router-link :to="{name:'archive'}"  class="navbar-item"                       >Archive</router-link>
            </nav>
            <nav class="secondary-nav">
                <a href="/wp-admin" v-if="user.canManage">
                    <icon name="wordpress" scale="2" color="white"></icon>
                </a>
                <router-link :to="{name: 'profile'}" class="profile-link">
                    <img :src="user.avatar">
                </router-link>
            </nav>
        </header>
        <div class="main-container">
            <div class="main">
                <toolbar></toolbar>
                <router-view></router-view>
                <div class="sync-error" :class="{off: !appError}">
                    <h1>Sync Failed</h1>
                    <h2>Please try refreshing. If it still fails, go to the profile editor and click Reset App. (Resetting will lose unsyced changes.)</h2>
                </div>
            </div>
        </div>
        <transition name="modal-fade">
            <div class="modal is-active" v-if="route.itemId">
                <router-link tag="div" class="modal-background" :to="{name: route.view}"></router-link>
                <router-view name="modal"></router-view>
            </div>
        </transition>
        <transition name="slide-up">
            <delegator v-if="showDelegator"></delegator>
        </transition>
    </div>
</template>


<script>
    import Delegator from './components/Delegator.vue';
    import Inbox from './components/Inbox.vue';
    import Project from './objects/project.js';
    import Toolbar from './components/Toolbar.vue';

    export default {
        name: 'app',
        components: {Delegator, Inbox, Toolbar},
        data () { return {
            appReady: false,
            showDelegator: false
        }},
        computed: {
            modalOpen () {
                return this.route.itemId !== null;
            },
            appError () {
                return store.state.mocaSyncError;
            }
        },
        created () {
            bus.$on('didEndDrag', (e) => {
                this.showDelegator = false;
            });
            bus.$on('didStartDrag', (payload) => {
                if (payload instanceof Project && !payload.contractor_id) {
                    this.showDelegator = true;
                }
            });
            bus.$on('initialized', () => {
                this.appReady = true;
            });
            document.addEventListener("keydown", (e) => {
                if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { return; }
                bus.$emit('keydown', e.keyCode);
            });
        },
        watch: {
            modalOpen: (newVal) => {
                newVal ?
                    document.body.classList.add('noScroll') :
                    document.body.classList.remove('noScroll');
            }
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
            background-color: $darker;
            // border-right: 1px solid $gray;
            display: flex;
            flex-flow: column;
            height: 100vh;
            position: fixed;
            width: $header-size;
            z-index: 2;

            nav {

                &.primary-nav {
                    flex: 1 1 100vh;
                    padding-top: $header-size;

                }

                &.secondary-nav {
                    align-items: center;
                    color: white;
                    display: flex;
                    flex-flow: column;
                    justify-content: center;
                    padding-bottom: 15px;

                    // .fa-icon {
                    //     color: white;
                    //     display: block;
                    //     height: 40px !important;
                    //     width: 40px !important;
                    //     opacity: 0.5;
                    //     transition: 0.2s ease;
                    //     &:hover {
                    //         opacity: 1;
                    //     }
                    // }

                }

                .navbar-item {
                    color: $medium-dark;
                    text-align: center;

                    &:hover {
                        background: $light;
                    }

                    &.is-active {
                        background: inherit;
                        color: $medium-dark;
                        &:hover {
                            background: $light;
                        }
                    }

                    &.router-link-exact-active {
                        background: $dark;
                        color: white;
                        font-weight: 900;
                        &:hover {
                            background: inherit;
                        }
                    }

                }

                .profile-link {

                    img {
                        border-radius: 25px;
                        display: block;
                        height: 50px;
                        margin: 15px;
                        transition: 0.3s ease;
                        width: 50px;
                        @include lifts;

                    }

                    &.router-link-exact-active img {
                        border: 2px solid $primary !important;
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

                .sync-error {
                    background: darken($red, 15);
                    border-radius: 5px;
                    color: white;
                    font-size: 1.2em;
                    padding: 15px;
                    position: fixed;
                        right: 20px; bottom: 20px; left: 100px;
                    text-align: center;
                    transition: 0.5s ease;
                    z-index: 50;

                    &.off {
                        transform: translateY(200px);
                    }

                    h1 {
                        font-size: 1.4em;
                        font-weight: 900;
                    }
                }

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

        // Delegator Transition
        .slide-up-enter-active {
            transition: transform 0.2s ease-out;
        }
        .slide-up-leave-active {
            transition: transform 0.2s ease-in;
        }
        .slide-up-enter, .slide-up-leave-to {
            transform: translateY(100%);
        }

    }
</style>

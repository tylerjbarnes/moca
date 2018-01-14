<template>
    <div id="app" v-if="appReady && user">
        <header>
            <div class="logo"></div>
            <nav class="primary-nav">
                <router-link :to="{name:'inbox'}" class="navbar-item">Inbox</router-link>
                <router-link :to="{name:'projects'}" class="navbar-item" v-if="!user.canManage">Projects</router-link>
                <router-link :to="{name:'team'}" class="navbar-item" v-if="user.canManage">Team</router-link>
                <router-link :to="{name:'clients'}" class="navbar-item" v-if="user.canManage">Clients</router-link>
                <router-link :to="{name:'time'}" class="navbar-item">Time</router-link>
                <router-link :to="{name:'archive'}" class="navbar-item">Archive</router-link>
            </nav>
            <nav class="secondary-nav">
                <a href="/wp-admin" v-if="user.canManage">
                    <ceri-icon name="fa-wordpress" size="30" h-center></ceri-icon>
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
            </div>
        </div>
        <!-- <transition name="modal-fade">
            <div class="modal is-active" v-if="$store.state.route.itemId">
                <router-link tag="div" class="modal-background" :to="{name: $store.state.route.view}"></router-link>
                <router-view name="modal"></router-view>
            </div>
        </transition>
        <transition name="slide-up">
            <delegator v-if="showDelegator"></delegator>
        </transition> -->
    </div>

    <!-- <div id="app">
        <template v-if="user">
            <span>Let's get some projects for {{ user.name }}</span>
            <ul>
                <li v-for="project in projects" :key="project.id">{{ project.name }} - {{ project.unresolvedMessages.length }}</li>
            </ul>
        </template><template v-else>
            Loading.
        </template>
    </div> -->
</template>


<script>

    // export default {
    //     name: 'app',
    //     computed: {
    //         user () {
    //             return this.$store.getters.user();
    //         },
    //         projects () {
    //             return this.$store.getters.projectsByManager(this.user.id)
    //         }
    //     }
    // }

    import Inbox from './components/Inbox.vue';
    import Toolbar from './components/Toolbar.vue';
    import Delegator from './components/Delegator.vue';
    import Project from './objects/project.js';

    import HasMoca from './mixins/HasMoca.js';

    export default {
        name: 'app',
        components: {Inbox,Toolbar,Delegator},
        mixins: [HasMoca],
        data () { return {
            appReady: false,
            showDelegator: false
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
        created () {
            bus.$on('storeLoaded', () => {
                this.appReady = true;
            });
            bus.$on('didStartDrag', (payload) => {
                if (payload instanceof Project && !payload.contractor_id) {
                    this.showDelegator = true;
                }
            });
            bus.$on('didEndDrag', (e) => {
                this.showDelegator = false;
            });
            document.addEventListener("keydown", (e) => {
                if (['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { return; }
                bus.$emit('keydown', e.keyCode);
            });
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
                    display: flex;
                    flex-flow: column;
                    justify-content: center;
                    padding-bottom: 15px;

                    ceri-icon {
                        color: $dark;
                        opacity: 0.5;
                        transition: 0.2s ease;
                        &:hover {
                            opacity: 1;
                        }
                    }

                }

                .navbar-item {
                    text-align: center;

                    &:hover {
                        background: $light;
                    }

                    &.is-active {
                        background: inherit;
                        color: inherit;
                        &:hover {
                            background: $light;
                        }
                    }

                    &.router-link-exact-active {
                        background: white;
                        color: $primary;
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

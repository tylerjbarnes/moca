<template>
    <div id="app">
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
        }
    }
</script>


<style lang="scss">
    @import url('https://fonts.googleapis.com/css?family=Lato:400,700,900');
    @import './node_modules/bulma/bulma.sass';
    @import './theme.scss';
    @import './theme/inputs.scss';

    .moca-input { @include moca-input; }

    #app {
        background-color: $white-ter;
        display: flex;
        font-size: 14px;
        min-height: 100vh;

        > header {
            background-color: white;
            border-right: 1px solid $shadow;
            position: fixed;
            width: $headerWidth; height: 100vh;
            z-index: 2;

            nav {
                padding-top: $headerWidth;

                .navbar-item {
                    text-align: center;

                    &:hover {
                        background: $white-ter;
                    }

                    &.is-active {
                        background: white;
                        color: $green;
                        font-weight: 900;
                    }

                }

            }

        }

        .main-container {
            flex: 1 1;

            > .main {
                margin-left: $headerWidth;
                margin-bottom: 20px;
                padding-top: $headerWidth;
                right: 0; left: 0;

            }

        }

        .modal {
            height: 100%;
            overflow: scroll;
            position: fixed;

            .modal-background {
                background: rgba(black, 0.25);
                position: fixed;

            }
            .modal-card {
                align-self: flex-start;
                box-shadow: 0px 5px 50px 0px rgba(black, 0.25);
                margin: 40px auto 120px auto;
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
                transition: all 0.15s;
            }
            .modal-card {
                transition: all 0.25s ease;
            }
        }
        .modal-fade-leave-active {
            transition: all 0.15s ease;
            .modal-background {
                transition: all 0.15s;
            }
            .modal-card {
                transition: all 0.15s ease;
            }
        }
        .modal-fade-enter, .modal-fade-leave-to {
            .modal-background {
                opacity: 0;
            }
            .modal-card {
                opacity: 0;
                transform: scale(0.925);
            }
        }

    }
</style>

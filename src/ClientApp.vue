<template>
    <div id="client-app" v-if="appReady">

        <div class="main-titles">
            <h1>Hello {{ $store.state.profile.name }}</h1>
            <h2>Your current balance is {{ $store.state.balance | hours }} hours.</h2>
        </div>

        <div class="items">
            <div class="switcher">
                <span class="section-heading" :class="{active: mode == 'projects'}" @click="mode = 'projects';">Projects</span>
                <span class="section-heading" :class="{active: mode == 'packages'}" @click="mode = 'packages';">Packages</span>
            </div>
            <client-project v-if="mode == 'projects'" v-for="project in projects" key="project" :project="project"></client-project>
            <client-package v-if="mode == 'packages'" v-for="clientPackage in packages" key="package" :package="clientPackage"></client-package>
        </div>

        <span class="signout" @click="signout">Sign Out</span>

    </div>
</template>


<script>
    import ClientProject from './components/client-app/ClientProject.vue';
    import ClientPackage from './components/client-app/ClientPackage.vue';

    export default {
        name: 'client-app',
        components: {ClientProject,ClientPackage},
        data () { return {
            appReady: false,
            mode: 'projects'
        }},
        computed: {
            projects () {
                return store.state.projects.sort((a,b) => a.start < b.start);
            },
            packages () {
                return store.state.packages.sort((a,b) => a.date < b.date);
            }
        },
        created () {
            bus.$on('storeLoaded', () => {
                this.appReady = true;
            });
        },
        methods: {
            signout () {
                window.location.replace('/wp-login.php?action=logout');
            }
        }
    }
</script>


<style lang="scss">
    @import './style/settings.scss';
    @import './style/global.scss';

    #client-app {
        background: $light;
        min-height: 100vh;
        overflow: hidden;

        .main-titles {
            padding: 40px 20px 20px 20px;

            h1 {
                font-size: 1.4em;
                text-align: center;
            }
            h2 {
                text-align: center;
            }

        }

        .items {
            background: white;
            border-radius: 20px;
            box-shadow: 0px 7.5px 25px 0px darken($light,5%);
            margin: 20px 20px 40px 20px;
            padding-top: 20px;
            overflow: hidden;

            .switcher {
                display: flex;
                padding: 0 20px;

                .section-heading {
                    cursor: default;
                    display: block;
                    font-size: 1.4em;
                    font-weight: 700;

                    &:not(.active) {
                        cursor: default;
                        opacity: 0.37;

                    }

                    &:not(:first-of-type) {
                        cursor: pointer;
                        padding-left: 10px;

                    }

                }

            }

        }

        .signout {
            cursor: pointer;
            font-size: 0.9em;
            display: block;
            text-align: center;
            opacity: 0.5;
            transition: 0.3s ease;

            &:hover {
                opacity: 1;
            }

        }

    }
</style>

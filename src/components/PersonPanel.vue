<template>

    <div class="person-panel card">
        <div class="card-content">
            <header>
                <div class="avatar">
                    <img :src="person.avatar">
                    <transition name="scale">
                        <div class="online-dot" v-if="person.online"></div>
                    </transition>
                </div>
                <div class="titles">
                    <p class="title">{{ person.name }}</p>
                    <div class="subtitle">
                        <span>{{ subtitle }}</span>
                        <transition name="slide-fade">
                            <div class="online-label" v-if="person.online">Online</div>
                        </transition>
                    </div>

                </div>
                <time-bar :person="person"></time-bar>
            </header>
            <template v-if="person.projectsAssigned && person.projectsAssigned.length">
                <h2 class="collection-title" v-if="person.canManage">Assigned</h2>
                <project-collection :projects="person.projectsAssigned"></project-collection>
            </template>
            <template v-if="person.projectsManaged && person.projectsManaged.length">
                <h2 class="collection-title">Managing</h2>
                <project-collection :projects="person.projectsManaged" :kanban="true"></project-collection>
            </template>
            <template v-if="person.projectsOwned">
                <project-collection :projects="person.projectsOwned"></project-collection>
            </template>
        </div>
    </div>

</template>


<script>
    import ProjectCollection from '../components/ProjectCollection.vue';
    import TimeBar from '../components/TimeBar.vue';

    export default {
        name: 'person-panel',
        props: ['person'],
        computed: {
            subtitle () {
                return this.person.role == 'client' ?
                    this.person.expirationDescription :
                    capitalizeFirstLetter(this.person.role);
            }
        },
        components: {ProjectCollection, TimeBar}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .person-panel {
        border-radius: 5px;
        box-shadow: 0px 0px 15px 0px $gray;
        margin: 40px;

        .card-content {

            & > header {
                align-items: center;
                border-bottom: 1px solid $light;
                display: flex;
                margin-bottom: 20px;
                padding-bottom: 20px;

                .avatar {
                    flex: 0 0 50px;
                    margin-right: 10px;
                    position: relative;

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

                .titles {
                    flex: 0 0 180px;

                    p.title {
                        font-size: 1.2em;
                        font-weight: 900;

                    }
                    .subtitle {
                        display: flex;
                        font-size: 0.9em;
                        padding-top: 3px;
                        opacity: 0.9;

                        .online-label {
                            color: $green;
                            font-weight: 700;
                            margin-left: 5px;
                        }
                        .slide-fade-enter-active, .slide-fade-leave-active {
                            transition: all 0.4s ease;
                        }
                        .slide-fade-enter, .slide-fade-leave-to {
                            transform: translateX(10px);
                            opacity: 0;
                        }

                    }

                }

            } // header

            .collection-title {
                font-weight: 700;

            }

        }

    }

</style>

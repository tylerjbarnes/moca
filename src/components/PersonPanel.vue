<template>

    <div class="person-panel card">
        <div class="card-content">

            <!-- Header -->
            <header>
                <!-- <div class="avatar">
                    <img :src="person.avatar">
                    <transition name="scale">
                        <div class="online-dot" v-if="person.online"></div>
                    </transition>
                </div> -->
                <div class="titles">
                    <p class="title">{{ person.name }}</p>
                    <div class="subtitle">
                        <span>{{ subtitle }}</span>
                        <transition name="slide-fade">
                            <div class="online-label" v-if="person.online">Online</div>
                        </transition>
                    </div>
                </div>
                <template v-if="person.role == 'client'">
                    <!-- <div class="blurbs">
                        <div class="blurb">
                            <label>Balance</label>
                            <span :class="{negative: person.balance < 0}">{{ person.balance | hours }}</span>
                        </div>
                        <div class="blurb">
                            <label>Budgeted</label>
                            <span :class="{negative: person.hoursBudgetedOnActiveProjects < 0}">{{ person.hoursBudgetedOnActiveProjects | hours }}</span>
                        </div>
                        <div class="blurb">
                            <label>Available</label>
                            <span :class="{negative: person.hoursAvailable < 0}">{{ person.hoursAvailable | hours }}</span>
                        </div>
                    </div> -->
                </template>
            </header>

            <!-- Members -->
            <template v-if="person.role != 'client'">
                <template v-if="person.projectsAssigned && person.activeProjectsAssigned.length">
                    <h2 class="collection-title" v-if="person.canManage">Assigned</h2>
                    <project-collection :projects="filterProjects(person.activeProjectsAssigned)" :person="person"></project-collection>
                </template>
                <template v-if="person.canManage">
                    <h2 class="collection-title">Managing</h2>
                    <project-collection :projects="filterProjects(person.activeProjectsManaged)" :kanban="true" :person="person"></project-collection>
                </template>
                <!-- <template v-if="!person.canManage && !person.activeProjectsAssigned.length">
                    <div class="actions">
                        <button class="button" @click="archivePerson">Archive Contractor</button>
                    </div>
                </template> -->
            </template>

            <!-- Clients -->
            <template v-else>
                <template v-if="person.activeProjectsOwned.length">
                    <h2 class="collection-title">{{ person.activeProjectsOwned.length }} Active Projects</h2>
                    <project-collection :projects="filterProjects(person.activeProjectsOwned)" :kanban="true" :person="person"></project-collection>
                </template>

                <!-- <h2 class="collection-title">Files</h2>
                <button class="button primary">Add File</button> -->

                <!-- <template v-if="!person.activeProjectsOwned.length">
                    <div class="actions">
                        <button class="button" @click="archivePerson">Archive Client</button>
                    </div>
                </template> -->

                <!-- <files-view :client="person"></files-view> -->
            </template>

        </div>
    </div>

</template>


<script>
    import ProjectCollection from '../components/ProjectCollection.vue';
    import ResourceView from '../components/ResourceView.vue';
    import FilesView from '../components/FilesView.vue';
    import DragDropController from '../mixins/DragDropController.js';

    export default {
        name: 'person-panel',
        props: ['person'],
        data () { return {
            mode: 'projects',
            draftResource: null,
            showFiles: false
        }},
        computed: {
            filters () {
                return this.$store.state.uiFilters.projects;
            },
            subtitle () {
                return this.person.role == 'client' ?
                    // this.person.expirationDescription :
                    'not implemented' :
                    capitalizeFirstLetter(this.person.role);
            }
        },
        methods: {
            filterProjects (projects) {
                return this.filters.started ?
                    projects.filter(project => !project.future) :
                    projects;
            },
            archivePerson () {
                this.person.archive();
            }
        },
        components: {ProjectCollection, ResourceView, FilesView},
        mixins: [DragDropController]
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .person-panel {
        border-radius: 5px;
        box-shadow: 0px 0px 15px 0px $gray;
        margin: 40px 40px 0 40px;
        max-width: 800px;
        width: 100%;

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

                .blurbs {
                    display: flex;
                    flex: 1 1;

                    .blurb {
                        align-items: center;
                        border-right: 2px solid $light;
                        display: flex;
                        flex: 1 1;
                        flex-flow: column;
                        text-align: center;
                        &:first-of-type {
                            border-left: 2px solid $light;
                        }

                        label {
                            color: $medium;
                            font-size: 0.75em;
                            font-weight: 700;
                            text-transform: uppercase;

                        }

                        span {
                            font-weight: 700;
                            padding: 0 10px;
                            white-space: nowrap;

                            &.negative {
                                color: $red;
                                font-weight: 900;

                            }

                        }

                    }

                } // blurbs

            } // header

            .collection-title {
                font-weight: 700;
                padding: 10px 0;
            }

            .actions {
                display: flex;
                flex-flow: row-reverse;
                margin-top: 20px;
            }

        }

    }

</style>

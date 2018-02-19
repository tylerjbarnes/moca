<template>

    <div class="projects-view">
        <template v-if="$store.getters.user.canManage">
            <div class="section-header" :class="{open: delegateOpen}" @click="delegateOpen = !delegateOpen">
                <h1 class="title">Delegate</h1>
                <span class="count">{{ undelegatedProjects.length }}</span>
                <icon scale="1.2" name="chevron-right"></icon>
            </div>
            <project-collection v-show="delegateOpen && undelegatedProjects.length" :fluid="true" :projects="undelegatedProjects"></project-collection>
            <div class="section-header" :class="{open: doOpen}" @click="doOpen = !doOpen">
                <h1 class="title">Do</h1>
                <span class="count">{{ activeProjects.length }}</span>
                <icon scale="1.2" name="chevron-right"></icon>
            </div>
            <project-collection v-show="doOpen && activeProjects.length" :fluid="true" :projects="activeProjects"></project-collection>
            <div class="section-header" :class="{open: approveOpen}" @click="approveOpen = !approveOpen">
                <h1 class="title">Approve</h1>
                <span class="count">{{ pendingProjects.length }}</span>
                <icon scale="1.2" name="chevron-right"></icon>
            </div>
            <project-collection v-show="approveOpen && pendingProjects.length" :fluid="true" :projects="pendingProjects"></project-collection>
            <div class="section-header" :class="{open: sendOpen}" @click="sendOpen = !sendOpen">
                <h1 class="title">Send</h1>
                <span class="count">{{ approvedProjects.length }}</span>
                <icon scale="1.2" name="chevron-right"></icon>
            </div>
            <project-collection v-show="sendOpen && approvedProjects.length" :fluid="true" :projects="approvedProjects"></project-collection>
        </template>
        <template v-else>
            <div class="section-header" :class="{open: doOpen}" @click="doOpen = !doOpen">
                <h1 class="title">Do</h1>
                <span class="count">{{ activeProjects.length }}</span>
                <icon scale="1.2" name="chevron-right"></icon>
            </div>
            <project-collection v-show="doOpen && activeProjects.length" :fluid="true" :projects="activeProjects"></project-collection>
            <div class="section-header" :class="{open: approveOpen}" @click="approveOpen = !approveOpen">
                <h1 class="title">Pending Approval</h1>
                <span class="count">{{ pendingProjects.length }}</span>
                <icon scale="1.2" name="chevron-right"></icon>
            </div>
            <project-collection v-show="approveOpen && pendingProjects.length" :fluid="true" :projects="pendingProjects"></project-collection>
        </template>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';
    import CanSearchProjects from '../mixins/CanSearchProjects.js';
    import DragDropController from '../mixins/DragDropController.js';

    export default {
        name: 'projects-view',
        components: {ProjectCollection},
        data () {return {
            statuses: ['delegate','do','approve','send'],
            delegateOpen: true,
            doOpen: false,
            approveOpen: false,
            sendOpen: false
        }},
        computed: {
            allProjects () {
                return this.user.canManage ?
                    store.getters.activeProjects :
                    store.getters.user.projectsAssigned;
            },
            activeProjects () {
                return this.projects.filter(project => project.status == 'do');
            },
            pendingProjects () {
                return this.projects.filter(project => project.status == 'approve');
            },
            undelegatedProjects () {
                return this.projects.filter(x => x.status == 'delegate');
            },
            approvedProjects () {
                return this.projects.filter(x => x.status == 'send');
            }
        },
        mixins: [CanSearchProjects,DragDropController],
        mounted () {
            let savedScroll = localStorage['projectsScroll'];
            document.body.scrollTop = savedScroll;
        },
        created () {
            if (localStorage.getItem('delegateOpen') == 1) this.delegateOpen = true;
            if (localStorage.getItem('doOpen') == 1) this.doOpen = true;
            if (localStorage.getItem('approveOpen') == 1) this.approveOpen = true;
            if (localStorage.getItem('sendOpen') == 1) this.sendOpen = true;
        },
        watch: {
            delegateOpen: function(val) { localStorage.setItem('delegateOpen', val ? 1 : 0); },
            doOpen: function(val) { localStorage.setItem('doOpen', val ? 1 : 0); },
            approveOpen: function(val) { localStorage.setItem('approveOpen', val ? 1 : 0); },
            sendOpen: function(val) { localStorage.setItem('sendOpen', val ? 1 : 0); }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .projects-view {

        h1 {
            font-weight: 700;
            padding: 40px 10px 0 40px;

            &.missing {
                font-size: 2em;
                text-align: center;
                opacity: 0.5;
            }

        }

        span.count {
            font-size: 1.6em;
            font-weight: 300 !important;
            opacity: 0.5;
            padding-right: 10px;
        }

        .section-header {
            align-items: baseline;
            cursor: default;
            display: flex;
            &.open .fa-icon {
                transform: rotateZ(90deg);
            }

            .fa-icon {
                opacity: 0.75;
                transition: 0.15s ease-out;

            }

        }

        .project-collection {
            margin: 0 40px;

            .project-card {

                .flag, .unresolved {

                }
            }
        }

    }

</style>

<template>

    <div class="kanban-column column dropzone" @dragover="dragover" @dragexit="dragexit" @drop="drop" :class="{inviteDrop}">
        <header><span>{{ title }}</span></header>
        <div class="items">
            <!-- <transition-group name="list"> -->
                <project-card v-for="project in items" :project="project" :show="{contractor: true, manager: false}" :key="project.id" :class="{pending: projectIsPending(project)}"></project-card>
            <!-- </transition-group> -->
        </div>
    </div>

</template>


<script>
    import ProjectCard from './ProjectCard.vue';
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'kanban-column',
        props: ['title','projects','person'],
        components: {ProjectCard},
        data () { return {
            inviteDrop: false,
            pendingProjects: []
        }},
        computed: {
            items () {
                return [...this.pendingProjects, ...this.projects]
                    .sort((a,b) => new Date(a.earliestDue) > new Date(b.earliestDue));
            }
        },
        methods: {
            projectIsPending (project) {
                let role = this.person.role == 'administrator' ? 'manager' : this.person.role;
                let isDifferentPerson = project[role + '_id'] != this.person.id;
                return project.status != this.title || isDifferentPerson;
            },
            canAcceptProject (project) {
                // Must have same client and either a different person or different status
                let changingClient = this.person.role == 'client' && this.person.id != project.client_id;
                let changingManager = this.person.role == 'manager' && this.person.id != project.manager_id;
                let changingContractor = this.person.role == 'contractor' && this.person.id != project.contractor_id;
                let changingStatus = this.title != project.status;
                return (changingManager || changingContractor || changingStatus) && !changingClient;
            },
            dragover ({detail:project}) {
                if (!this.canAcceptProject(project)) { return; }
                this.inviteDrop = true;
                this.pendingProjects.push(project);
            },
            dragexit () {
                this.inviteDrop = false;
                this.pendingProjects = [];
            },
            drop ({detail:project}) {
                if (!this.canAcceptProject(project)) { return; }
                let changingManager = this.person.role == 'manager' && this.person.id != project.manager_id;
                let changingContractor = this.person.role == 'contractor' && this.person.id != project.contractor_id;
                this.inviteDrop = false;
                this.pendingProjects = [];
                new MocaMutationSet(
                    'update', 'project',
                    project.id, {
                        status: this.title,
                        manager_id: changingManager ? this.person.id : project.manager_id,
                        contractor_id: changingContractor ? this.person.id : project.contractor_id
                    }
                ).commit();

            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .kanban-column {
        flex: 0 0 25%;
        height: 100%;
        padding-top: 5px; padding-bottom: 5px;

        &.inviteDrop {
            // background: lighten($primary, 20%);

        }

        header {
            margin-bottom: 4px;

            span {
                display: block;
                font-size: 0.9em;
                font-weight: 700;
                text-transform: capitalize;
                opacity: 0.5;
            }
        }

        .items {
            margin-top: -10px;
            min-height: 100px;

        }

        // .list-enter-active, .list-leave-active {
        //     transition: all 1s;
        // }
        // .list-enter, .list-leave-to /* .list-leave-active below version 2.1.8 */ {
        //     opacity: 0;
        //     transform: translateY(30px);
        // }
        //
        // .list-move {
        //     transition: transform 1s;
        //
        // }
        //
        // .list-complete-item {
        //     transition: all 1s;
        // }
        // .list-complete-enter, .list-complete-leave-to {
        //     opacity: 0;
        //     transform: translateY(30px);
        // }

    }

</style>

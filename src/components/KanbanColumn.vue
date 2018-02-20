<template>

    <div class="kanban-column column dropzone" @dragenter="dragenter" @dragexit="dragexit" @drop="drop" @setDragEl="setDragEl" :class="{inviteDrop}">
        <header><span>{{ title }}</span></header>
        <div class="items">
            <!-- <transition-group name="list"> -->
                <project-card v-for="project in items" :project="project" :show="tagsToShow" :key="project.id + (projectIsPending(project) ? '-p' : '')" :class="{pending: projectIsPending(project)}"></project-card>
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
                return _.orderBy([...this.pendingProjects, ...this.projects], 'due');
                // return [...this.pendingProjects, ...this.projects]
                //     .sort((a,b) => {
                //         let dateA = a.earliestDue ? a.earliestDue : null;
                //         let dateB = b.earliestDue ? b.earliestDue : null;
                //         return dateA == dateB ? a.name > b.name : dateA > dateB || dateA == null;
                //     });
            },
            tagsToShow () {
                switch (this.person.role) {
                    case 'administrator':
                    case 'manager': return {contractor: true, manager: false};
                    case 'contractor': return {contractor: false, manager: true};
                    case 'client': return {contractor: true, manager: true};
                    default: break;
                }
            }
        },
        methods: {
            projectIsPending (project) {
                // let role = this.person.role == 'administrator' ? 'manager' : this.person.role;
                // let isDifferentPerson = project[role + '_id'] != this.person.id;
                let isDifferentPerson = false; // TEMP
                return project.status != this.title || isDifferentPerson;
            },
            canAcceptProject (project) {
                // Must have same client and either a different person or different status
                let changingClient = this.person.role == 'client' && this.person.id != project.client_id;
                let changingManager = this.person.canManage && this.person.id != project.manager_id;
                let changingContractor = this.person.role == 'contractor' && this.person.id != project.contractor_id;
                let changingStatus = this.title != project.status && (this.title != 'do' || project.contractor_id);
                return (changingManager || changingContractor || changingStatus) && !changingClient;
            },
            dragenter ({detail:project}) {
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
                let changingManager = this.person.canManage && this.person.id != project.manager_id;
                let changingContractor = this.person.role == 'contractor' && this.person.id != project.contractor_id;

                new MocaMutationSet(
                    'update', 'project',
                    project.id, {
                        status: this.title,
                        manager_id: changingManager ? this.person.id : project.manager_id,
                        contractor_id: this.title == 'delegate' ? null : (changingContractor ? this.person.id : project.contractor_id)
                    }
                ).commit().then(() => {
                    this.pendingProjects = [];
                    this.inviteDrop = false;
                });
            },
            setDragEl ({detail: dragDelegate}) {
                dragDelegate.hide();
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .kanban-column {
        justify-content: stretch;
        display: flex;
        flex: 0 0 calc(25% + 15px);
        flex-flow: column;
        margin: -7.5px;
        padding-top: 5px; padding-bottom: 5px;

        &.inviteDrop {
            // background: lighten($primary, 20%);

        }

        header {
            margin-bottom: 4px;
            padding-left: 7.5px;

            span {
                display: block;
                font-size: 0.9em;
                font-weight: 700;
                text-transform: capitalize;
                opacity: 0.5;
            }
        }

        .items {
            background: rgba($light,0.5);
            border-radius: 4px;
            flex-grow: 1;
            // max-height: 50vh;
            min-height: 100px;
            // overflow-y: scroll;
            padding: 14px 5px 5px 5px;

            .project-card {
                &:first-of-type {
                    margin-top: 0 !important;
                }
                &:last-of-type {
                    margin-bottom: 0 !important;
                }
            }

        }

    }

</style>

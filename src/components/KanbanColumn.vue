<template>

    <div class="kanban-column column dropzone" @dragover="dragover" @dragexit="dragexit" @drop="drop" :class="{inviteDrop}">
        <header><span>{{ title }}</span></header>
        <div class="items">
            <!-- <transition-group name="list"> -->
                <project-card v-for="project in items" :project="project" :show="{contractor: true, manager: false}" :key="project.id" :class="{pending: project.status != title}"></project-card>
            <!-- </transition-group> -->
        </div>
    </div>

</template>


<script>
    import ProjectCard from './ProjectCard.vue';

    export default {
        name: 'kanban-column',
        props: ['title','projects'],
        components: {ProjectCard},
        data () { return {
            inviteDrop: false,
            pendingProjects: []
        }},
        computed: {
            items () {
                return [...this.pendingProjects, ...this.projects]
                    .sort((a,b) => new Date(a.due) > new Date(b.due));
            }
        },
        methods: {
            dragover ({detail:project}) {
                if (project.status == this.title) { return; }
                this.inviteDrop = true;
                this.pendingProjects.push(project);
            },
            dragexit () {
                this.inviteDrop = false;
                this.pendingProjects = [];
            },
            drop ({detail:project}) {
                this.inviteDrop = false;
                this.pendingProjects = [];
                this.$store.dispatch('modifyObject', {
                    type: 'project',
                    id: project.id,
                    delta: {
                        status: this.title
                    }
                });
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .kanban-column {
        flex: 0 0 25%;
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

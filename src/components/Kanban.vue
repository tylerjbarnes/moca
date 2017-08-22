<template>

    <div class="kanban">
        <div class="columns">
            <div class="column">
                <header><span>Delegate</span></header>
                <div class="items">
                    <project-card v-for="project in projectsToDelegate" :project="project" :key="project.id"></project-card>
                </div>
            </div>
            <div class="column">
                <header><span>Do</span></header>
                <div class="items">
                    <project-card v-for="project in projectsToDo" :project="project" :key="project.id" :show="{contractor: true, manager: false}"></project-card>
                </div>
            </div>
            <div class="column">
                <header><span>Approve</span></header>
                <div class="items">
                    <project-card v-for="project in projectsToApprove" :project="project" :key="project.id"></project-card>
                </div>
            </div>
            <div class="column">
                <header><span>Send</span></header>
                <div class="items">
                    <project-card v-for="project in projectsToSend" :project="project" :key="project.id"></project-card>
                </div>
            </div>
        </div>
    </div>

</template>


<script>
    import ProjectCard from './ProjectCard.vue';

    export default {
        name: 'kanban',
        props: ['projects'],
        components: {ProjectCard},
        computed: {
            projectsToDelegate () {
                return this.projects.filter(project => project.status === 'delegate');
            },
            projectsToDo () {
                return this.projects.filter(project => project.status === 'do');
            },
            projectsToApprove () {
                return this.projects.filter(project => project.status === 'approve');
            },
            projectsToSend () {
                return this.projects.filter(project => project.status === 'send');
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .kanban {
        display: flex;
        flex-flow: column;

        .columns {
            display: flex;

            .column {
                flex: 0 0 25%;
                padding-top: 5px; padding-bottom: 5px;

                header {
                    margin-bottom: 4px;

                    span {
                        display: block;
                        font-size: 0.9em;
                        font-weight: 700;
                        opacity: 0.5;
                    }
                }

                .items {
                    margin-top: -10px;
                    min-height: 100px;

                }

            }
        }

    }

</style>

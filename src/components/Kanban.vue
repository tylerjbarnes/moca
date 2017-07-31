<template>

    <div class="kanban">
        <div class="columns">
            <div class="column">
                <header><span>Delegate</span></header>
                <div class="items">
                    <project-card v-for="project in projectsInDelegate" :project="project" :key="project.id"></project-card>
                </div>
            </div>
            <div class="column">
                <header><span>Do</span></header>
                <div class="items">
                    <project-card v-for="project in projectsInDo" :project="project" :key="project.id"></project-card>
                </div>
            </div>
            <div class="column">
                <header><span>Approve</span></header>
                <div class="items">
                    <project-card v-for="project in projectsInApprove" :project="project" :key="project.id"></project-card>
                </div>
            </div>
            <div class="column">
                <header><span>Send</span></header>
                <div class="items">
                    <project-card v-for="project in projectsInSend" :project="project" :key="project.id"></project-card>
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
            projectsInDelegate () {
                return this.projects.filter(project => project.status === 'delegate');
            },
            projectsInDo () {
                return this.projects.filter(project => project.status === 'do');
            },
            projectsInApprove () {
                return this.projects.filter(project => project.status === 'approve');
            },
            projectsInSend () {
                return this.projects.filter(project => project.status === 'send');
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .kanban {
        display: flex;
        flex-flow: column;

        .columns {
            display: flex;

            .column {

                header {
                    span {
                        display: block;
                        font-size: 0.75em;
                        font-weight: 700;
                        opacity: 0.5;
                        padding-bottom: 4px;
                    }
                }

                .items {
                    min-height: 100px;

                }

            }
        }

    }

</style>

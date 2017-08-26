<template>

    <div class="kanban">
        <div class="columns">
            <kanban-column :title="'delegate'" :projects="projectsToDelegate"></kanban-column>
            <kanban-column :title="'do'" :projects="projectsToDo"></kanban-column>
            <kanban-column :title="'approve'" :projects="projectsToApprove"></kanban-column>
            <kanban-column :title="'send'" :projects="projectsToSend"></kanban-column>
        </div>
    </div>

</template>


<script>
    import KanbanColumn from './KanbanColumn.vue';

    export default {
        name: 'kanban',
        props: ['projects'],
        components: {KanbanColumn},
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
        },
        methods: {
            becomeDropDelegate () {
                console.log('Yay!');
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .kanban {
        display: flex;
        flex-flow: column;
        margin-top: 10px;

        .columns {
            display: flex;

        }

    }

</style>

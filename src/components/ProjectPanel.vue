<template>

    <div class="project-panel">

        <div class="titles">
            <h2 class="client-name">{{ project.client.name }}</h2>
            <h1 class="project-name">{{ project.name }}</h1>
        </div>

        <div class="person-tags">
            <person-tag :person="project.manager"></person-tag>
            <person-tag v-if="project.contractor" :person="project.contractor" :solid="true"></person-tag>
        </div>

        <div class="blurbs">
            <div class="blurb">
                <label>Start</label>
                <span>{{ project.start | date }}</span>
            </div>
            <div class="blurb">
                <label>Due</label>
                <span>{{ project.dueString || 'Never' }}</span>
            </div>
            <div class="blurb">
                <label>Budget</label>
                <span>{{ project.budgetString }}</span>
            </div>
            <div class="blurb">
                <label>Recycle</label>
                <span>{{ project.autocycleString | capitalize }}</span>
            </div>
            <div class="blurb spacer"></div>
            <div class="blurb">
                <label>Logged</label>
                <span>{{ project.hoursLogged | hours }}</span>
            </div>
        </div>

        <project-actions :project="project"></project-actions>

    </div>

</template>


<script>
    import PersonTag from './PersonTag.vue';
    import ProjectActions from './ProjectActions.vue';

    export default {
        name: 'project-view',
        props: ['project'],
        components: {PersonTag,ProjectActions}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-panel {
        background: white;
        display: flex;
        flex-flow: column;
        padding: 20px;
        width: 100%;

        .titles {
            margin-bottom: 20px;

            h1.project-name {
                font-size: 1.4em;
                font-weight: 900;

            }

        }

        .person-tags {
            .person-tag:first-of-type {
                margin-right: 5px;
            }
        }

        .blurbs {
            flex-grow: 1;
            padding: 30px 0;

            .blurb {
                display: flex;
                flex-flow: column;
                margin-top: 10px;

                label {
                    color: $medium;
                    font-size: 0.75em;
                    font-weight: 700;
                    text-transform: uppercase;

                }

                span {
                    font-weight: 700;

                }

            }

        }

    }

</style>

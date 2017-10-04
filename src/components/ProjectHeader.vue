<template>

    <div class="project-header">

        <div class="top">
            <div class="titles">
                <h2 class="client-name">{{ project.client ? project.client.name : 'No Client' }}</h2>
                <h1 class="project-name">{{ project.name }}</h1>
            </div>
            <div class="person-tags">
                <person-tag :person="project.manager"></person-tag>
                <person-tag v-if="project.contractor" :person="project.contractor" :solid="true"></person-tag>
            </div>
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
            <!-- <div class="blurb">
                <label>Logged</label>
                <span>{{ project.hoursLogged | hours }}</span>
            </div> -->
        </div>

        <!-- <project-actions :project="project"></project-actions> -->

    </div>

</template>


<script>
    import PersonTag from './PersonTag.vue';
    import ProjectActions from './ProjectActions.vue';

    export default {
        name: 'project-header',
        props: ['project'],
        components: {PersonTag,ProjectActions}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-header {
        background: white;
        display: flex;
        flex-flow: column;
        padding: 20px 20px 10px 20px;
        width: 100%;

        .top {
            align-items: center;
            display: flex;

            .titles {
                flex: 1 0;

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

        }

        .blurbs {
            display: flex;
            margin-top: 10px;
            padding-top: 10px;

            .blurb {
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

                }

            }

        }

    }

</style>

<template>

    <router-link tag="div" class="project-card" :to="{ name: 'team-project', params: { id: project.id }}">
        <div class="names">
            <span class="client">{{ project.client.name }}</span>
            <span class="project">{{ project.name }}</span>
        </div>
    </router-link>

</template>


<script>

    export default {
        name: 'project-card',
        props: ['project']
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .project-card {
        background: white;
        // box-shadow: 0px 0px 15px 0px $shadow;
        border: 1px solid $shadow;
        border-radius: 5px;
        margin: 10px 0;
        padding: 10px;
        width: 240px; height: 120px;

        .names {
            display: flex;
            flex-flow: column;

            span.client {
                font-size: 0.75em;
                opacity: 0.75;
                margin-bottom: 0;
            }

            span.project {
                font-weight: 700;

            }

        }

    }

</style>

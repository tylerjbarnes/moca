<template>

    <div class="member-glance card">
        <div class="card-content">
            <p class="title">{{ member.name }}</p>
            <p class="subtitle">{{ member.role | capitalize }}</p>
            <project-collection :projects="member.projects"></project-collection>
        </div>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';

    export default {
        name: 'member-glance',
        props: ['member'],
        components: {ProjectCollection}
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .member-glance {
        border-radius: 5px;
        box-shadow: 0px 0px 15px 0px $shadow;
        margin: 30px 20px;
        // max-width: $max-width;

        p.title {
            font-size: 1.2em;
            font-weight: 900;

        }
        p.subtitle {
            font-size: 0.9em;
            padding-top: 3px;
            opacity: 0.9;

        }

    }

</style>

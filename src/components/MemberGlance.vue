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

    }

</style>

<template>

    <div class="person-row">
        <img :src="person.avatar" class="avatar">
        <span class="name">{{ person.name }}</span>
        <span @click="unarchive"><icon name="recycle" scale="1.5"></icon></span>
    </div>

</template>


<script>
    // import ProjectCollection from '../components/ProjectCollection.vue';

    export default {
        name: 'person-row',
        props: ['person'],
        methods: {
            unarchive () {
                this.person.unarchive();
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .person-row {
        align-items: center;
        background: white;
        cursor: default;
        display: flex;
        padding: 10px;
        @include unselectable;

        &:not(:last-of-type) {
            border-bottom: 1px solid $light;
        }

        img.avatar {
            border-radius: 15px;
            height: 30px;
            margin-right: 10px;
            width: 30px;
        }

        .name {
            flex: 1;
            font-weight: 700;

        }

        .role {
            color: $medium-dark;
            padding-left: 5px;

        }

        .fa-icon {
            opacity: 0.5;
            transition: 0.2s ease;

            &:hover {
                color: $primary;
                opacity: 1;

            }
        }

    }

</style>

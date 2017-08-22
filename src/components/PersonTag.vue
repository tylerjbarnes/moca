<template>

    <div class="person-tag" :style="{
        backgroundColor: person.canManage ? '' : person.lightColor,
        borderColor: !person.canManage ? 'transparent' : person.color,
        color: person.darkColor
    }">
        {{ person.firstName }}
    </div>

</template>


<script>

    export default {
        name: 'person-tag',
        props: ['person']
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .person-tag {
        border: 1px solid white;
        border-radius: 2px;
        box-sizing: border-box;
        display: inline-block;
        font-size: 0.9em;
        font-weight: 700;
        margin-right: 2px;
        padding: 4px 6px;

        &.solid {
            font-weight: 700;

        }

    }

</style>

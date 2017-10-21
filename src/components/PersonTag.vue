<template>

    <div class="person-tag" :class="{solid:solid}" :style="{
        backgroundColor: !solid ? '' : person.lightColor,
        borderColor: solid ? 'transparent' : person.color,
        color: solid ? person.darkColor : person.color
    }">
        {{ person.firstName }}
    </div>

</template>


<script>

    export default {
        name: 'person-tag',
        props: ['person','solid']
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
        padding: 4px 8px;

        &.solid {
            font-weight: 700;

        }

    }

</style>

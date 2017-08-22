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
    @import '../theme.scss';

    .person-tag {
        border: 1px solid;
        border-radius: 2px;
        display: block;
        font-size: 0.9em;
        font-weight: 700;
        opacity: 0.75;
        padding: 2.5px 5px;

    }

</style>

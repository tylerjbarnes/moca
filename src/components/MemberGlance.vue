<template>

    <div class="member-glance">
        {{ person.name }}
    </div>

</template>

<script>

    export default {
        name: 'member-glance',
        props: ['person']
    }

</script>

<style lang="scss">

    .box {
        background: #ddd;
        border: 1px solid #ccc;
        padding: 20px;
        margin: 20px;
    }

</style>

<template>

    <div class="box is-info">
        <p>
            <slot></slot>
        </p>
    </div>

</template>

<script>

    export default {

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

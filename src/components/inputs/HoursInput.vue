<template>

    <div class="hours-input">
        <span>Output: {{ potential }}</span>
        <input type="text" ref="input" :value="value" @input="updateValue($event.target.value)">
    </div>

</template>


<script>

    export default {
        name: 'hours-input',
        props: ['value'],
        methods: {
            updateValue (value) {
                let formattedValue = Math.ceil(parseFloat(value) * 4) / 4;
                this.$emit('input', formattedValue);
            }
        }
    }

</script>


<style lang="scss">
    @import '../../theme.scss';

    .hours-input {

    }

</style>

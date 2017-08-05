<template>

    <div class="hours-input">
        <button class="decrement" tabindex="-1" @click="decrement()">-</button>
        <input type="text" ref="input" :value="inputReadout()" @input="updateValue($event.target.value)" @focus="isFocused = true" @blur="blur();isFocused = false">
        <button class="increment" tabindex="-1" @click="increment()">+</button>
    </div>

</template>


<script>

    export default {
        name: 'hours-input',
        props: {
            value: {
                default: 0.25
            },
            min: {
                default: 0.25
            },
            max: {
                default: 24
            }
        },
        data () {
            return {
                formattedValue: 0.25,
                rawValue: 0.25,
                isFocused: false
            }
        },
        methods: {
            increment () {
                this.rawValue = this.trimValue(this.value + 0.25);
                this.$emit('input', this.rawValue);
            },
            decrement () {
                this.rawValue = this.trimValue(this.value - 0.25);
                this.$emit('input', this.rawValue);
            },
            blur () {
                this.rawValue = null;
            },
            inputReadout () {
                return this.isFocused && this.rawValue !== null ? this.rawValue : this.value;
            },
            updateValue (value) {
                this.rawValue = value;
                this.formattedValue = this.formatValue(value);
                this.$emit('input', this.formattedValue);
            },
            formatValue (value) {
                let result = value;
                if (value.includes(':')) {
                    let hours = parseInt(value.split(':')[0]);
                    hours = hours ? hours : 0;
                    let minuteString = value.split(':')[1];
                    let minutes = minuteString.length > 1 ? parseInt(minuteString) : parseInt(minuteString + '0');
                    result = hours + (minutes / 60);
                }
                result = Math.ceil(parseFloat(result) * 4) / 4;
                result = isNaN(result) ? 0.25 : result;
                result = this.trimValue(result);
                return result;
            },
            trimValue (value) {
                value = value > this.max ? this.max : value;
                value = value < this.min ? this.min : value;
                return value;
            }
        }
    }

</script>


<style lang="scss">
    @import '../../theme.scss';

    .hours-input {

    }

</style>

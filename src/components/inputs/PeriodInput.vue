<template>

    <div class="period-input">
        <button class="decrement" @click="decrement()" tabindex="-1">
            <ceri-icon name="fa-chevron-left" size="10" hcenter></ceri-icon>
        </button>
        <date-input ref="input" v-model="date" @input="setFromInput()"></date-input>
        <!-- <input type="text" ref="input" :value="inputReadout" @input="updateValue($event.target.value)" @keydown="handleKey" @focus="updateStringValue();isFocused = true" @blur="updateStringValue();isFocused = false"> -->
        <button class="increment" @click="increment()" tabindex="-1">
            <ceri-icon name="fa-chevron-right" size="10" hcenter></ceri-icon>
        </button>
    </div>

</template>


<script>
    import Period from '../../period.js';
    import DateInput from './DateInput.vue';

    export default {
        name: 'period-input',
        props: {
            value: { default: () => new Period() },
            min: { default: 0.25 },
            max: { default: 24 }
        },
        components: {DateInput},
        data () {
            return {
                isFocused: false,
                date: this.value.start
            }
        },
        methods: {
            increment () {
                let newPeriod = new Period(this.date).next();
                this.updateValue(newPeriod);
            },
            decrement () {
                let newPeriod = new Period(this.date).previous();
                this.updateValue(newPeriod);
            },
            setFromInput () {
                let newPeriod = new Period(this.date);
                this.updateValue(newPeriod);
            },
            updateValue (period) {
                this.date = period.start;
                this.$emit('input', period);
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .period-input {
        @include moca-input;
        display: flex;
        min-width: 100px !important;
        // overflow: hidden;
        height: 30px;
        position: relative;

        input {
            width: calc(100% - 60px);
            height: 100%;
            padding: 0;
            text-align: center;

        }

        button {
            background: none;
            border: none;
            height: 100%;
            outline: none;
            padding: 0;
            transition: all 0.15s ease;
            flex: 0 0 30px;
            &.increment {
                border-radius: 0 5px 5px 0;
            }
            &.decrement {
                border-radius: 5px 0 0 5px;
            }
            &:hover {
                background: $gray;
            }

        }

    }

</style>

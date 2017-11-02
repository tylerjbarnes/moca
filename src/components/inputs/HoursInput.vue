<template>

    <div class="hours-input">
        <button class="decrement" @click="decrement()" tabindex="-1">
            <ceri-icon name="fa-minus" size="10" hcenter></ceri-icon>
        </button>
        <input type="text" ref="input" :value="inputReadout" @input="updateValue($event.target.value)" @keydown="handleKey" @focus="updateStringValue();isFocused = true" @blur="updateStringValue();isFocused = false">
        <button class="increment" @click="increment()" tabindex="-1">
            <ceri-icon name="fa-plus" size="10" hcenter></ceri-icon>
        </button>
    </div>

</template>


<script>

    export default {
        name: 'hours-input',
        props: {
            value: { default: this.min },
            min: { default: 0.25 },
            max: { default: 24 }
        },
        watch: {
            min: function (val) { this.clipCurrentValue(); },
            max: function (val) { this.clipCurrentValue(); }
        },
        data () {
            return {
                isFocused: false,
                stringValue: this.value.toFixed(2)
            }
        },
        computed: {
            inputReadout () {
                return this.isFocused ?
                    this.stringValue :
                    this.value.toFixed(2);
            }
        },
        methods: {
            handleKey (event) {
                switch (event.keyCode) {
                    case 38: // up
                        this.increment();
                        break;
                    case 40: // down
                        this.decrement();
                        break;
                    default: break;
                }
            },
            updateStringValue () {
                this.stringValue = this.value.toFixed(2);
            },
            increment () {
                this.$emit('input', this.clipValue(this.value + 0.25));
                this.stringValue = this.clipValue(this.value + 0.25).toFixed(2);
            },
            decrement () {
                this.$emit('input', this.clipValue(this.value - 0.25));
                this.stringValue = this.clipValue(this.value - 0.25).toFixed(2);
            },
            clipCurrentValue () {
                this.$emit('input', this.clipValue(this.value));
                this.stringValue = this.clipValue(this.value).toFixed(2);
            },
            updateValue (value) {
                this.stringValue = value;
                this.$emit('input', this.convertValue(value));
            },
            convertValue (value) {
                let result = value;

                // Convert HH:MM Format
                if (value.includes(':')) {
                    let hours = parseInt(value.split(':')[0]);
                    hours = hours ? hours : 0;
                    let minuteString = value.split(':')[1];
                    let minutes = minuteString.length > 1 ? parseInt(minuteString) : parseInt(minuteString + '0');
                    result = hours + (minutes / 60);
                }

                // Round to Nearest Quarter
                result = Math.ceil(parseFloat(result) * 4) / 4;

                // Handle isNaN
                result = isNaN(result) ? 0.25 : result;

                // Clip to Min & Max
                result = this.clipValue(result);

                return result;
            },
            clipValue (value) {
                value = this.max && value > this.max ? this.max : value;
                value = this.min && value < this.min ? this.min : value;
                return value;
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .hours-input {
        @include moca-input;
        // align-items: center;
        display: flex;
        min-width: 100px !important;
        overflow: hidden;
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
            display: block;
            height: 100%;
            outline: none;
            padding: 0;
            // position: absolute;
            transition: all 0.15s ease;
            width: 30px;
            &:hover {
                background: $gray;
            }

        }

    }

</style>

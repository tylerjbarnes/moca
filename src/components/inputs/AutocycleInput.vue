<template>

    <div class="autocycle-input">
        <div class="autocycle-container">
            <template v-for="option in options">
                <input type="radio" name="autocycle" :id="option.name" :value="option.value" :checked="option.value == value" @change="updateValue($event.target.value)">
                <label :for="option.name">{{ option.name | capitalize }}</label>
            </template>
        </div>
    </div>

</template>


<script>
    import Datepicker from 'vuejs-datepicker';

    export default {
        name: 'autocycle-input',
        props: ['value'],
        data () {
            return {
                options: [
                    {name: 'off', value: null},
                    {name: 'daily', value: 'daily'},
                    {name: 'weekly', value: 'weekly'},
                    {name: 'monthly', value: 'monthly'},
                ]
            }
        },
        methods: {
            updateValue(value) {
                this.$emit('input', value ? value : null);
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .autocycle-input {
        display: inline-block;

        .autocycle-container {
            background: $light;
            border-radius: 5px;
            display: flex;
            padding: 7.5px;

            input {
                position: absolute !important;
                clip: rect(0, 0, 0, 0);
                height: 1px;
                width: 1px;
                border: 0;
                overflow: hidden;

            }

            label {
                flex: 1 1;
                font-size: 0.9em;
                font-weight: 900;
                text-align: center;
                opacity: 0.37;
                margin: 0 5px;
                padding: 5px 25px;
                transition: 0.3s;

                &:first-of-type { margin-left: 0; }
                &:last-of-type { margin-right: 0; }

            }

            input:checked + label {
                background-color: white;
                border-radius: 3px;
                opacity: 1;
                @include shadow;

            }

            input:focus + label {
                @include shadow(rgba(black,0.15));
            }

        }

    }

</style>

<template>

    <div class="flagged-input">
        <label class="switch">
            <input type="checkbox" @change="updateValue($event.target.checked)" :checked="value">
            <span class="slider">
                <span class="puck">
                    <icon name="flag"></icon>
                </span>
            </span>
        </label>
    </div>

</template>


<script>
    import Datepicker from 'vuejs-datepicker';

    export default {
        name: 'flagged-input',
        props: ['value'],
        methods: {
            updateValue (value) {
                this.$emit('input', value);
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .flagged-input {

        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;

            input {opacity:0;}

        }

        .slider {
            border-radius: 34px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: $light;
            -webkit-transition: .4s;
            transition: .4s;

            .puck {
                @include shadow(rgba(black,0.1));
                border-radius: 50%;
                position: absolute;
                content: "";
                height: 26px;
                width: 26px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: .3s;
                text-align: center;
                color: $light;

                .fa-icon {
                    transform: translateY(4px);
                }
            }
        }

        input:checked + .slider {
            background-color: $orange;
        }

        input:focus + .slider .puck {
            @include shadow(rgba(black,0.25));
        }

        input:checked + .slider .puck {
            color: $orange;
            transform: translateX(26px);
        }

    }

</style>

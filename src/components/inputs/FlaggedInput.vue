<template>

    <div class="flagged-input">
        <label class="switch">
            <input type="checkbox">
            <span class="slider">
                <span class="puck">
                    <ceri-icon name="fa-flag" hcenter></ceri-icon>
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
        data () {
            return {
                // options: [
                //     {name: 'off', value: null},
                //     {name: 'daily', value: 'daily'},
                //     {name: 'weekly', value: 'weekly'},
                //     {name: 'monthly', value: 'monthly'},
                // ]
            }
        },
        methods: {
            // updateValue(value) {
            //     this.$emit('input', value ? value : null);
            // }
        }
    }

</script>


<style lang="scss">
    @import '../../theme.scss';

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
            background-color: $white-ter;
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
                color: $gray;
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

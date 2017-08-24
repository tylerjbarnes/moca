<template>
    <div class="quick-log">
        <hours-input v-model="logPrimitive.hours" :max="project.max - project.hoursLogged"></hours-input>
        <button class="log">Log</button>
    </div>
</template>


<script>
    import HoursInput from './inputs/HoursInput.vue';

    export default {
        name: 'quick-log',
        props: ['project'],
        data () { return {
            logPrimitive: {
                hours: 0.25
            } // <-- Here - we're about to use MocaFactory to generate this primitive.
        }},
        components: {HoursInput}
    }
</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .quick-log {
        align-items: center;
        background: $light;
        display: flex;

        .hours-input {
            height: 100%;
            width: 100px;
        }

        button.button {
            background: pink !important;
        }

        button.log {
            background: $medium;
            border: none;
            border-radius: 2px;
            color: white;
            font-family: inherit !important;
            font-size: 0.75rem;
            font-weight: 900;
            height: 20px;
            margin: 5px;
            outline: none;
            text-transform: uppercase;
            transition: 0.15s ease;

            &:hover {
                background: $dark;

            }

        }

    }

</style>

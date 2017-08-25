<template>
    <div class="quick-log" :class="{disabled:disabled}">
        <template v-if="!disabled">
            <hours-input v-model="logPrimitive.hours" :max="project.max - project.hoursLogged"></hours-input>
            <button class="log" @click="save">Log</button>
        </template>
        <span class="disabled" v-if="disabled">Max Reached</span>
    </div>
</template>


<script>
    import HoursInput from './inputs/HoursInput.vue';
    import MocaFactory from '../objects/mocaFactory.js';

    export default {
        name: 'quick-log',
        props: ['project','disabled'],
        data () { return {
            logPrimitive: this.newLogPrimitive()
        }},
        components: {HoursInput},
        methods: {
            newLogPrimitive () {
                return MocaFactory.constructPrimitive('time',{
                    client_id: this.project.client ? this.project.client.id : null,
                    cycle: this.project.cycle,
                    project_id: this.project.id,
                    worker_id: this.$store.state.user.id
                })
            },
            resetPrimitive () {
                this.logPrimitive = this.newLogPrimitive();
            },
            save () {
                this.$store.dispatch('createObject',{
                    type: 'time',
                    primitive: this.logPrimitive
                });
                this.resetPrimitive();
            }
        }
    }
</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .quick-log {
        align-items: center;
        background: $light;
        display: flex;
        position: relative;

        &.disabled {
            .hours-input, button {
                opacity: 0;
            }
        }

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

        span.disabled {
            color: $medium;
            font-size: 0.75em;
            font-weight: 900;
            padding: 0 20px;
            white-space: nowrap;
            width: 100%;

        }

    }

</style>

<template>
    <div class="quick-log" :class="{open: editing}">
        <div class="wrapper">
            <button v-if="editing" class="cancel" @click="cancel">
                <ceri-icon name="fa-times" size="10" ></ceri-icon>
            </button>
            <hours-input v-if="editing" v-model="logPrimitive.hours" :max="project.max - project.hoursLogged"></hours-input>
            <span v-if="!editing" class="logged" :class="{locked: project.hoursLogged >= project.max}">{{ project.hoursLogged | hours }} Logged</span>
            <button class="log" @click="editOrSave" v-if="project.hoursLogged < project.max">
                <ceri-icon v-if="!editing" name="fa-plus" size="10" hcenter></ceri-icon>
                <ceri-icon v-if="editing" name="fa-check" size="10" hcenter></ceri-icon>
            </button>
        </div>
    </div>
</template>


<script>
    import HoursInput from './inputs/HoursInput.vue';
    import MocaFactory from '../objects/mocaFactory.js';
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'quick-log',
        props: ['project'],
        data () { return {
            logPrimitive: this.newLogPrimitive(),
            editing: false
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
            editOrSave () {
                this.editing ? this.save() : this.editing = true;
            },
            cancel () {
                this.editing = false;
            },
            save () {
                new MocaMutationSet(
                    'create',
                    'time',
                    this.logPrimitive.id,
                    this.logPrimitive
                ).commit();
                this.resetPrimitive();
                this.editing = false;
            }
        }
    }
</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .quick-log {
        overflow: visible;
        position: relative;
        width: 136px;

        &.open {
            .wrapper {
                flex-flow: row-reverse;
                @include shadow;
            }
        }

        .wrapper {
            align-items: center;
            background: white;
            border-radius: 20px;
            border: 2px solid $light;
            display: flex;
            height: 40px;
            justify-content: space-between;
            overflow: hidden;
            position: absolute;
                right: 0; top: -20px;

            .hours-input {
                border-radius: 15px;
                margin: 0 4px;
                width: 100px;

                button.increment {
                    border-radius: 0;
                }
            }

            .logged {
                font-size: 0.9em;
                font-weight: 700;
                margin: 0 6px;
                padding-left: 5px;
                white-space: nowrap;
                &.locked {
                    padding-right: 5px;
                }
            }

            button.log, button.cancel {
                border: none;
                border-radius: 50%;
                height: 28px;
                color: white;
                margin: 0 4px;
                outline: none;
                padding: 0 10px;
                width: 28px;
                @include lifts;
                &.log { background: $primary; }
                &.cancel { background: $medium; }

            }

        }

    }

</style>

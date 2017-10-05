<template>
    <div class="quick-log">
        <template>
            <button v-if="editing" class="cancel" @click="cancel">
                <ceri-icon name="fa-times" size="10" ></ceri-icon>
            </button>
            <hours-input v-if="editing" v-model="logPrimitive.hours" :max="project.max - project.hoursLogged"></hours-input>
            <span v-if="!editing" class="logged" :class="{locked: project.hoursLogged >= project.max}">{{ project.hoursLogged | hours }} Logged</span>
            <button class="log" @click="editOrSave" v-if="project.hoursLogged < project.max">
                <ceri-icon v-if="!editing" name="fa-plus" size="10" hcenter></ceri-icon>
                <ceri-icon v-if="editing" name="fa-check" size="10" hcenter></ceri-icon>
            </button>
        </template>
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
        align-items: center;
        border-radius: 20px;
        border: 2px solid $light;
        display: flex;
        height: 40px;
        overflow: hidden;

        .hours-input {
            border-radius: 15px;
            margin: 0 4px;
            max-width: 100px;

            button.increment {
                border-radius: 0;
            }
        }

        .logged {
            font-size: 0.9em;
            font-weight: 700;
            margin: 0 6px;
            padding-left: 10px;
            &.locked {
                padding-right: 10px;
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

</style>

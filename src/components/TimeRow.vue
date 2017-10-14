<template>

    <tr class="time-row" @dblclick="edit">
            <td class="time-icon" :class="time.type"><ceri-icon size="12" :name="iconName"></ceri-icon></td>

        <template v-if="!editing">
            <td class="date">{{ time.date | date }} <span class="year">{{ time.date | year }}</span></td>
            <td>{{ time.worker ? time.worker.firstName : '' }}</td>
            <td>{{ time.client ? time.client.name : '' }}</td>
            <td colspan="2">{{ time.project ? time.project.name : '' }}<span class="cycle" v-if="time.project">{{ time.project.cycle + 1 }}</span></td>
            <td class="hours">{{ outflow | hours }}</td>
            <td class="hours">{{ inflow | hours }}</td>
        </template><template v-else>
            <td class="shift-padding"><date-input v-model="time.date" upward="true" align="left"></date-input></td>
            <td>{{ time.worker ? time.worker.firstName : '' }}</td>
            <td class="shift-padding"><person-input :roles="['client']" v-model="time.client_id"></person-input></td>
            <td class="shift-padding"><project-input v-model="time.project_id" :allProjects="$store.state.projects"></project-input></td>
            <td class="shift-padding"><div class="moca-input"><input type="text"></div></td>
            <td colspan="2"><hours-input v-model="time.hours"></hours-input></td>
        </template>
    </tr>

</template>


<script>
    import Time from '../objects/time.js';
    import HoursInput from './inputs/HoursInput.vue';
    import PersonInput from './inputs/PersonInput.vue';
    import ProjectInput from './inputs/ProjectInput.vue';
    import DateInput from './inputs/DateInput.vue';

    export default {
        name: 'time-row',
        props: ['initialTime','isDraft'],
        components: {HoursInput,PersonInput,DateInput,ProjectInput},
        data () { return {
            time: null,
            editing: this.isDraft
        }},
        computed: {
            inflow () {
                return this.time.type == 'purchase' ? this.time.hours : null;
            },
            outflow () {
                return this.time.type != 'purchase' ? this.time.hours : null;
            },
            iconName () {
                switch (this.time.type) {
                    case 'purchase': return 'fa-cube';
                    case 'expiration': return 'fa-calendar-times-o';
                    default: return 'fa-pencil';
                }
            }
        },
        methods: {
            edit () {
                if (this.editing) { return; }
                this.editing = true;
            }
        },
        created () {
            this.time = this.isDraft ? new Time(this.initialTime) : this.initialTime;
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .time-row {
        border-top: 1px solid $gray;
        padding: 0 10px;
        position: relative;

        td {
            padding: 5px 10px;
            vertical-align: middle;

            &:first-of-type {
                padding-left: 10px;
            }
            &:last-of-type {
                padding-right: 10px;
            }

            &.shift-padding {
                transform: translateX(-10px);
            }

            &.time-icon {
                padding-right: 0;

                &.log { color: $orange; }
                &.purchase { color: $dark; }

            }

            &.hours {
                border-left: 1px solid $light;
                text-align: right;
            }

            .year {
                color: $medium;
            }

            .cycle {
                background: $light;
                border-radius: 0.7em;
                color: $medium-dark !important;
                display: inline-block;
                height: 1.4em;
                line-height: 1.4em;
                min-width: 1.4em;
                color: $medium-dark;
                font-size: 0.75em;
                font-weight: 700;
                margin-left: 4px;
                text-align: center;
            }

        }

    }

</style>

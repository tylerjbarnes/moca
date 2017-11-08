<template>

    <div class="time-table">
        <div class="time-row header">
            <div class="header cell time-icon"></div>
            <div class="header cell date">Date</div>
            <div class="header cell worker">Worker</div>
            <div class="header cell client">Client</div>
            <div class="header cell project">Project or Details</div>
            <div class="header cell hours">Hours</div>
        </div>
        <time-row v-if="timePrimitive" :_primitive_="timePrimitive" @stoppedEditing="timePrimitive = null"></time-row>
        <time-row v-for="time in times" :key="time.id"
            :time="time"
            :locked="hasOpenEditor"
            @startedEditing="hasOpenEditor = true"
            @stoppedEditing="hasOpenEditor = false;"
        ></time-row>
    </div>

</template>


<script>
    import TimeRow from './TimeRow.vue';
    import MocaFactory from '../objects/mocaFactory.js';

    export default {
        name: 'time-table',
        props: ['times'],
        data () { return {
            hasOpenEditor: false,
            timePrimitive: null
        }},
        components: {TimeRow},
        computed: {
            preparedTimes () {
                return this.draftTime ? [...this.times, this.draftTime] : this.times;
            }
        },
        methods: {
            newLog () {
                this.timePrimitive = MocaFactory.constructPrimitive('time', {
                    worker_id: store.state.user.id
                });
            },
            newPackage () {
                this.timePrimitive = MocaFactory.constructPrimitive('time', {
                    type: 'credit'
                });
            }
        },
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .time-table {
        background: white;
        border-radius: 5px;
        font-size: 0.9em;
        width: 100%;

        .time-row {
            align-items: stretch;
            border-top: 1px solid $gray;
            display: flex;
            flex-flow: row;
            position: relative;
            &.editing {
                background: white;
                border: none;
                margin: -5.5px 0;
                transform: scale(1.02);
                z-index: 1;
                @include shadow;
            }
            &.pending:not(.editing) {
                background-image: repeating-linear-gradient(45deg, white, white 10px, rgba($light,0.4) 10px, rgba($light,0.4)  20px);
            }

            > .cell {
                align-items: center;
                display: flex;
                padding: 5px 10px;

                &.header {
                    font-weight: 700;
                }

                &.shift-padding {
                    // > * {
                    //     transform: translateX(-10px);
                    // }
                }

                &.time-icon {
                    flex: 0 0 32px;
                    &.log { color: $medium; }
                    &.credit { color: $dark; }
                    &.expiration { color: $red; }
                }
                &.date {
                    flex: 0 0 110px;
                    .date-input { max-width: 100px !important; }
                }
                &.worker {
                    flex: 0 0 80px;
                    font-weight: 700;
                    &:not(.header) {
                        font-size: 0.9em;
                    }

                    span {
                        border-radius: 3px;
                        margin: -2px -5px;
                        padding: 2px 5px;
                    }
                }
                &.client {
                    flex: 0 0 130px;
                    .person-input { max-width: 120px !important; }
                }
                &.project, &.memo {
                    flex: 1 1 auto;
                }
                &.inflow, &.outflow {
                    flex: 0 0 60px;
                }
                &.hours {
                    flex: 0 0 120px;
                    .hours-input { max-width: 100px !important; }
                }

                &.memo {
                    color: $medium-dark;
                    font-size: 0.9em;
                    font-weight: 700;
                }


                &.hours {
                    text-align: right;
                }
                .year {
                    color: $medium;
                    padding-left: 4px;
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

            .actions {
                background: white;
                border-radius: 3px;
                overflow: auto;
                display: flex;
                padding: 5px;
                position: absolute;
                    right: 5px; top: 45px;
                @include shadow;

                .button:not(:first-of-type) {
                    margin-left: 5px;
                }

            }

        }

    }

</style>

<template>
    <div class="time-bar">
        <div class="bar">
            <div class="assigned" :style="{backgroundColor: person.color, width: assignedPercent}"></div>
            <div class="worked" :style="{backgroundColor: person.color, width: workedPercent}"></div>
            <div class="gridlines">
                <div class="gridbox" v-for="n in person.hoursAssignedOnCurrentProjects" :style="{width: segmentWidth}"></div>
            </div>
        </div>
        <div class="labels">
            <span class="label worked-label"><strong>{{ person.hoursWorkedOnCurrentProjects | formatHours}}</strong> Worked</span>
            <span class="label available-label"><strong>{{ person.hoursAssignedOnCurrentProjects - person.hoursWorkedOnCurrentProjects | formatHours}}</strong> Assigned</span>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'time-bar',
        props: ['person'],
        computed: {
            workedPercent () {
                let factor = this.person.hoursWorkedOnCurrentProjects / this.person.hoursAssignedOnCurrentProjects;
                return (factor * 100) + '%';
            },
            assignedPercent () {
                let factor = this.person.hoursAssignedOnCurrentProjects / this.person.hoursAssignedOnCurrentProjects;
                return (factor * 100) + '%';
            },
            segmentWidth () {
                let width = 100 / this.person.hoursAssignedOnCurrentProjects;
                return width + '%';
            }
        }
    }
</script>


<style lang="scss">
    @import '../theme.scss';

    .time-bar {
        display: flex;
        flex-flow: column;
        flex-grow: 1;

        .bar {
            background: $white-ter;
            border-radius: 0.6em;
            position: relative;
            overflow: hidden;
            width: 100%; height: 1.2em;

            .assigned, .worked, .labels, .gridlines {
                height: 100%;
                position: absolute;
                    top: 0; left: 0;
            }

            .assigned {
                background: green;
                opacity: 0.25;

            }

            .worked {
                background: $white-ter;
            }

            .gridlines {
                display: flex;
                transform: translateX(2px);
                width: 100%; height: 100%;

                .gridbox {
                    border-right: 2px solid white;
                    height: 100%;

                }

            }

        }

        .labels {
            align-items: center;
            display: flex;
            justify-content: space-between;
            padding-top: 5px;
            width: 100%;

            .label {
                font-size: 0.9em;
                font-weight: 500;
                margin: 0;

                &strong {
                    font-weight: 700;
                }

            }

        }

    }

</style>

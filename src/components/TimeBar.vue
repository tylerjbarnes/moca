<template>
    <div class="time-bar">
        <div class="bar">
            <div v-for="segment in segments" class="segment" :style="{backgroundColor: segment.color, width: (segmentTotal ? (segment.number / segmentTotal * 100) : 0) + '%'}"></div>
            <div class="gridlines" v-if="segmentTotal <= 20">
                <div class="gridbox" v-for="n in Math.ceil(segmentTotal)" :style="{flexBasis: segmentWidth}"></div>
            </div>
        </div>
        <div class="labels">
            <span v-for="segment in segments"><strong>{{ segment.number | formatHours }}</strong> {{ segment.label }}</span>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'time-bar',
        props: ['person'],
        computed: {
            segments () {
                return this.person.timeBarData
            },
            segmentTotal () {
                return this.segments.map(segment => segment.number).reduce((a,b) => a + b, 0);
            },
            segmentWidth () {
                return (this.segmentTotal ? (100 / this.segmentTotal) : 0) + '%';
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
            background-color: $white-ter;
            border-radius: 0.6em;
            display: flex;
            overflow: hidden;
            position: relative;
            width: 100%; height: 1.2em;

            .segment {
                background: $white-ter;
                height: 100%;

            }

            .gridlines {
                display: flex;
                position: absolute;
                    left: 0.5px;
                width: 100%; height: 100%;

                .gridbox {
                    border-right: 1px solid white;
                    flex: 0 0;
                    height: 100%;
                    // outline: 1px solid white;

                }

            }

        }

        .labels {
            align-items: center;
            display: flex;
            justify-content: space-between;
            padding-top: 5px;
            width: 100%;

            &.hidden {
                opacity: 0;
            }

            > span {
                font-size: 0.9em;
                font-weight: 500;
                margin: 0;

            }

        }

    }

</style>

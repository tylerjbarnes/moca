<template>

    <table class="time-table" :class="{locked}">
        <colgroup>
            <col width="27">
            <col width="120">
            <col width="auto">
            <col>
            <col>
            <col>
            <col width="65">
            <col width="65">
        </colgroup>
        <tbody>
            <tr ref="measure">
                <th class="time-icon"></th>
                <th>Date</th>
                <th>Worker</th>
                <th>Client</th>
                <th colspan="2">Project or Details</th>
                <th colspan="2">Hours</th>
            </tr>
        </tbody>
        <time-row v-for="time in times" :initialTime="time" :key="time.id"></time-row>
        <!-- <time-row :initialTime="timePrimitive" :isDraft="true"></time-row> -->
    </table>

</template>


<script>
    import TimeRow from './TimeRow.vue';
    import MocaFactory from '../objects/mocaFactory.js';

    export default {
        name: 'time-table',
        props: ['times'],
        data () { return {
            locked: false
        }},
        components: {TimeRow},
        computed: {
            timePrimitive () {
                return MocaFactory.constructPrimitive('time', {
                    worker_id: store.state.user.id
                });
            }
        },
        methods: {
            lockLayout () {

                // Measure & Set Cell Widths
                let measureCells = Array.from(this.$refs.measure.childNodes).filter(node => node.tagName == 'TD');
                let measures = measureCells.map(cell => cell.offsetWidth / this.$el.offsetWidth * 100);

                let colgroup = Array.from(this.$el.childNodes).filter(node => node.tagName == 'COLGROUP')[0];
                let cols = Array.from(colgroup.childNodes).filter(node => node.tagName == 'COL');

                for (const [i, col] of cols.entries()) {
                    col.style.width = measures[i] + '%';
                }

                // Set Table Locked
                this.locked = true;

            }
        },
        mounted () {
            this.lockLayout();
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .time-table {
        background: white;
        border-radius: 5px;
        font-size: 0.9em;
        width: 100%;

        &.locked {
            table-layout: fixed;
        }

        th {
            padding: 5px 10px;
            &:first-of-type {
                padding-left: 10px;
            }
            &:last-of-type {
                padding-right: 10px;
            }

        }

    }

</style>

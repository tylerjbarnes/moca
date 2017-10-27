<template>

    <div class="time-table">
        <div class="time-row">
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
                this.timePrimitive = MocaFactory.constructPrimitive('time', {worker_id: store.state.user.id});
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

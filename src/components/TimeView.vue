<template>

    <div id="time-view">
        <div class="actions">
            <button class="primary button" @click="logTime">Log Time</button>
            <button class="inverted button" @click="addPackage">Add Package</button>
        </div>
        <div class="time-panel">
            <time-table ref="timeTable" :times="filterTimes(times)"></time-table>
        </div>
    </div>

</template>


<script>
    import TimeTable from './TimeTable.vue';

    export default {
        name: 'time-view',
        components: {TimeTable},
        computed: {
            times () {
                return store.getters.timesInPeriod;
            }
        },
        methods: {
            filterTimes(times) {
                let timeFilters = store.state.uiFilters.times;
                if (timeFilters.clientId) {
                    times = times.filter(time => time.client_id == timeFilters.clientId);
                }
                if (timeFilters.workerId) {
                    times = times.filter(time => time.worker_id == timeFilters.workerId);
                }
                return times;
            },
            logTime() {
                this.$refs.timeTable.newLog();
            },
            addPackage() {
                this.$refs.timeTable.newPackage();
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #time-view {
        display: flex;
        flex-flow: column;
        padding: 20px 40px 40px 40px;

        .actions {
            display: flex;
            // justify-content: left;
            margin-bottom: 20px;

            .button:not(:first-of-type) {
                margin-left: 10px;
            }
        }

        .time-panel {
            flex-shrink: 1;
        }

    }

</style>

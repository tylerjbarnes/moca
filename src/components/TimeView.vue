<template>

    <div id="time-view">
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
            }
        },
        mounted () {
            let vm = this;
            bus.$on('logTime', () => {
                vm.$refs.timeTable.newLog();
            });
        },
        beforeDestroy () {
            bus.$off('logTime');
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #time-view {
        display: flex;
        flex-flow: column;
        padding: 40px;

        .time-panel {
            flex-shrink: 1;
        }

    }

</style>

<template>

    <div id="time-view">
        <header>
            <div class="actions">
                <button class="primary button" @click="logTime">Log Time</button>
                <button class="inverted button" @click="addPackage" v-if="user.canManage">Add Package</button>
            </div>
            <div class="total">
                <span class="logged" v-show="purchased"><label>Purchased</label><span class="num">{{ purchased | hours }}</span></span>
                <span class="logged" v-show="logged"><label>Logged</label><span class="num">{{ logged | hours }}</span></span>
            </div>
        </header>
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
            },
            logged () {
                return this.filterTimes(this.times).filter(x => x.type != 'purchase').map(time => time.hours).reduce((a,b) => a + b, 0);
            },
            purchased () {
                return this.filterTimes(this.times).filter(x => x.type == 'purchase').map(time => time.hours).reduce((a,b) => a + b, 0);
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
        },
        mounted () {
            let savedScroll = localStorage['timeScroll'];
            document.body.scrollTop = savedScroll;
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #time-view {
        display: flex;
        flex-flow: column;
        padding: 20px 40px 40px 40px;

        header {
            display: flex;
            margin-bottom: 10px;

            .actions {
                display: flex;
                flex-grow: 1;

                .button:not(:first-of-type) {
                    margin-left: 10px;
                }
            }

            .total {
                display: flex;
                flex-grow: 0;
                text-align: right;

                > span {
                    align-items: center;
                    display: flex;
                    flex-flow: column;
                    &:not(:last-of-type) {
                        margin-right: 20px;
                    }

                    .num {
                        display: block;
                        font-weight: 900;
                    }

                }

            }
        }

        .time-panel {
            flex-shrink: 1;
        }

    }

</style>

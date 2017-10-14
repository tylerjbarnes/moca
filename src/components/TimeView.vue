<template>

    <div id="time-view">
        <div class="time-panel">
            <time-table :times="times"></time-table>

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
                return store.state.times;
            }
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

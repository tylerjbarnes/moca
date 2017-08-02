<template>
    <div id="time-bar">
        {{ person.hoursWorked }}
    </div>
</template>


<script>

    export default {
        name: 'time-bar',
        props: ['person']
    }
</script>


<style lang="scss">

    .time-bar {


    }

</style>

<template>

    <div id="app">
        <message>{{ name }} is {{ status }}!!!</message>
        <message>Hi :)</message>
    </div>

</template>

<script>
    import Message from './components/Message.vue';
    import axios from 'axios';
    import qs from 'qs';

    export default {
        name: 'app',
        components: { Message },
        data() {
            return {
                name: 'Someone',
                status: 'something'
            }
        },
        mounted() {
            axios.post(ajaxurl, qs.stringify({
                action: 'hpm_api',
                function: 'load'
            }))
            .then(({data}) => {
                console.log(data);
            });
        }
    }

</script>

<style lang="scss">



</style>

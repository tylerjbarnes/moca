<template>

    <div id="app">
        <message>{{ name }} is {{ status }}!!!</message>
        <message>Hi :)</message>
    </div>

</template>

<script>
    import Message from './components/Message.vue';
    import axios from 'axios';

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
            axios.get('/api/test').then(({data}) => {
                this.name = data.name;
                this.status = data.status;
            });
        }
    }

</script>

<style lang="scss">



</style>

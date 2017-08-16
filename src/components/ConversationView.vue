<template>

    <div class="conversation-view">
        <message-view v-for="message in messages" key="message.id" :message="message"></message-view>
    </div>

</template>


<script>
    import MessageView from './MessageView.vue';

    export default {
        name: 'conversation-view',
        props: ['messages'],
        components: {MessageView},
        mounted () {
            this.$el.scrollTop = this.$el.scrollHeight;
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .conversation-view {
        overflow: scroll;
        width: 100%;

    }

</style>

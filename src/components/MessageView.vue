<template>

    <div class="message-view">
        <header>
            <img :src="message.author.avatar">
            {{ message.author.name }}
        </header>
        <div class="main">
            <div class="markup" v-html="markup"></div>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'message-view',
        props: ['message'],
        computed: {
            markup () {
                return markdown(this.message.content);
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .message-view {
        background: white;
        border-radius: 5px;
        margin: 20px;
        @include shadow;

        header {
            align-items: center;
            border-bottom: 1px solid darken($white-ter, 3%);
            display: flex;
            font-weight: 700;
            padding: 10px;

            img {
                border-radius: 15px;
                margin-right: 10px;
                width: 30px; height: 30px;
            }
        }

        .main {
            padding: 20px;

        }

    }

</style>

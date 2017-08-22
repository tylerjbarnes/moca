<template>

    <div class="resource-view">
        <header>
            {{ resource.name }}
            <!-- {{ resource.author.name }} -->
        </header>
        <div class="main">
            <div class="markup" v-html="markup"></div>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'resource-view',
        props: ['resource'],
        computed: {
            markup () {
                return markdown(this.resource.content.body);
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .resource-view {
        background: white;
        border-radius: 5px;
        margin: 20px;
        @include shadow;

        header {

        }

        .main {
            padding: 20px;

        }

    }

</style>

<template>

    <div class="resource-view">
        <header>
            <span class="name">{{ resource.name }}</span>
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
    @import '~styles/settings.scss';

    .resource-view {
        background: white;
        border-radius: 10px;
        box-shadow: 0px 7.5px 25px 0px darken($light,5%);

        header {
            padding: 20px;

            .name {
                font-size: 1.2em;
                font-weight: 900;
            }

        }

        .main {
            padding: 0 20px 20px 20px;

        }

    }

</style>

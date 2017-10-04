<template>

    <div class="resource-view">
        <header :style="{backgroundImage: gradientString}">
            <span class="name">{{ resource.name }}</span>
            <!-- {{ resource.author.name }} -->
        </header>
        <div class="main">
            <div class="markup" v-html="markup"></div>
            <div class="meta">
                created by {{ resource.author.firstName }} •
                <template v-if="resource.lastEditor">last edit by {{ resource.lastEditor.firstName }}</template>
            </div>
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
            },
            gradientString () {
                return 'linear-gradient(20deg,' +
                this.resource.project.manager.color + ' 40%,' +
                (this.resource.project.contractor ?
                    this.resource.project.contractor.color :
                    this.resource.project.manager.lightColor)
                    + ' 120%)'
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
        overflow: hidden;

        header {
            color: white;
            padding: 10px 20px;

            .name {
                font-size: 1.2em;
                font-weight: 900;
            }

        }

        .main {
            padding: 10px 20px;

            .markup {
                @include markup;
            }

            .meta {
                border-top: 1px solid $light;
                font-size: 0.8em;
                text-align: right;
                padding-top: 10px;
                margin-top: 20px;
                opacity: 0.5;

            }

        }

    }

</style>

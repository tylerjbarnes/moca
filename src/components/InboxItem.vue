<template>

    <div class="inbox-item" @click="select" :class="{selected}">
        <div class="icon">
            <ceri-icon :name="iconName" size=20 h-center></ceri-icon>
        </div>
        <div class="main">
            <div class="titles">
                <div class="inbox-title">{{ title }}</div>
                <div class="inbox-subtitle">{{ subtitle }}</div>
            </div>
            <div class="meta">
                <span class="time">{{ time | date }}</span>
            </div>
        </div>
    </div>

</template>


<script>
    import MessageView from './MessageView.vue';

    export default {
        name: 'inbox-item',
        props: ['type', 'object', 'time', 'selected'],
        components: {MessageView},
        computed: {
            title () {
                switch (this.type) {
                    case 'project': return this.object.name;
                    case 'time': return this.object.worker.firstName + ' logged extra time.';
                    case 'client': return this.object.firstName + '\'s hours expired.';
                    default: return 'Error';
                }
            },
            subtitle () {
                switch (this.type) {
                    case 'project': return this.object.resolvableMessages.length +
                        ' New Message' + (this.object.resolvableMessages.length != 1 ? 's' : '');
                    case 'time': return Vue.filter('hours')(this.object.hours) + ' Hours';
                    case 'client': return Vue.filter('hours')(this.object.balance) +
                        ' Hours Expired ' + Vue.filter('date')(this.object.lastPackage.expiration_date);
                    default: return 'Please inform Tyler';
                }
            },
            iconName () {
                switch (this.type) {
                    case 'project': return 'fa-comments-o';
                    case 'time': return 'fa-clock-o';
                    case 'client': return 'fa-calendar-times-o';
                    default: return 'fa-close';
                }
            }
        },
        methods: {
            select () {
                this.$emit('selected');
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .inbox-item {
        align-items: center;
        background: $lighter;
        cursor: default;
        display: flex;
        width: 100%;

        &.selected {
            background: white;
            border-left: 6px solid $primary;
            .main {
                border-bottom: 1px solid white;
            }
        }
        &:not(.selected) {
            padding-left: 6px;
            .main {
                border-bottom: 1px solid $gray;
            }
        }

        .icon {
            margin: 10px;

        }

        .main {
            display: flex;
            flex: 1 1;
            padding: 10px 10px 10px 0;

            .titles {
                flex: 1 1;

            }

            .meta {
                align-self: stretch;
                flex: 0 0 50px;
                opacity: 0.5;

                span.time {
                    display: block;
                    font-size: 0.9em;
                    font-weight: 900;
                    text-align: right;
                    // text-transform: uppercase;

                }

            }

        }

    }

</style>

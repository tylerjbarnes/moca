<template>

    <div class="project-header">

        <div class="top">
            <div class="titles">
                <div class="subtitles">
                    <h2 class="client-name">{{ project.client ? project.client.name : 'No Client' }}</h2>
                    <span class="cycle" v-if="user.canManage">{{ project.cycle + 1 }}</span>
                    <span class="flagged" v-if="project.flagged"><ceri-icon name="fa-flag" size="14" hcenter></ceri-icon></span>
                </div>
                <h1 class="project-name" :class="{external}" @click="open">{{ project.name }}</h1>
            </div>
            <div v-if="managing && !project.archived" class="meta">
                <span class="logged">{{ project.hoursLogged | hours }} Logged</span>
                <person-tag :person="project.manager"></person-tag>
                <person-tag v-if="project.contractor" :person="project.contractor" :solid="true"></person-tag>
            </div>
            <div v-else class="logging">
                <quick-log v-if="!project.archived" :project="project"></quick-log>
            </div>
            <person-tag v-if="!managing || project.archived" :person="project.manager"></person-tag>
        </div>

        <div class="blurbs">
            <div class="blurb">
                <label>Start</label>
                <span>{{ project.start | date }}</span>
            </div>
            <div class="blurb">
                <label>Due</label>
                <span>{{ project.dueString || 'Never' }}</span>
            </div>
            <div class="blurb">
                <label>Budget</label>
                <span>{{ project.budgetString }}</span>
            </div>
            <div class="blurb">
                <label>Recycle</label>
                <span>{{ project.autocycleString | capitalize }}</span>
            </div>
        </div>

    </div>

</template>


<script>
    import PersonTag from './PersonTag.vue';
    import ProjectActions from './ProjectActions.vue';
    import QuickLog from './QuickLog.vue';

    export default {
        name: 'project-header',
        props: ['project','external'],
        computed: {
            managing () { return this.user.canManage && this.user.id != this.project.contractor_id; }
        },
        methods: {
            open () {
                let prefix = this.$store.state.route.view ? this.$store.state.route.view + '-' : 'inbox-';
                this.$router.push({ name: prefix + 'project', params: { id: this.project.id }});
            }
        },
        components: {PersonTag,ProjectActions,QuickLog}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-header {
        background: white;
        display: flex;
        flex-flow: column;
        padding: 20px 20px 10px 20px;
        width: 100%;

        .top {
            align-items: center;
            display: flex;

            .titles {
                flex: 1 0;

                .subtitles {
                    align-items: center;
                    display: flex;

                    .cycle {
                        background: $light;
                        border-radius: 0.7em;
                        color: $medium-dark !important;
                        display: inline-block;
                        height: 1.4em;
                        line-height: 1.4em;
                        min-width: 1.4em;
                        color: $medium-dark;
                        font-size: 0.75em;
                        font-weight: 700;
                        margin-left: 4px;
                        text-align: center;
                    }

                    .flagged {
                        color: $red;
                        display: block;
                        text-align: center;
                        line-height: 1em;
                        margin-left: 2px;
                        width: 20px;

                    }

                }

                h1.project-name {
                    display: inline-block;
                    font-size: 1.4em;
                    font-weight: 900;

                    &.external {
                        cursor: pointer;
                    }

                }

            }

            .meta {
                align-items: center;
                display: flex;

                .person-tag {
                    margin-left: 10px;
                }

                .logged {
                    background: $light;
                    border: 2px solid $light;
                    border-radius: calc(0.9em + 8px);
                    color: $dark;
                    display: block;
                    font-size: 0.9em;
                    font-weight: 700;
                    padding: 4px 14px;
                    white-space: nowrap;
                }

            }

            .logged {
                display: block;
                text-align: right;
            }

            .person-tag {
                margin-left: 10px;
            }

        }

        .blurbs {
            display: flex;
            margin-top: 10px;
            padding-top: 10px;

            .blurb {
                border-right: 2px solid $light;
                display: flex;
                flex: 1 1;
                flex-flow: column;
                text-align: center;
                &:first-of-type {
                    border-left: 2px solid $light;
                }

                label {
                    color: $medium;
                    font-size: 0.75em;
                    font-weight: 700;
                    text-transform: uppercase;

                }

                span {
                    font-weight: 700;
                    padding: 0 10px;
                    white-space: nowrap;

                }

            }

        }

    }

</style>

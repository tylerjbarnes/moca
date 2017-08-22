<template>

    <router-link tag="div" class="project-card" :to="{ name: this.$store.state.route.view + '-project', params: { id: project.id }}">
        <div class="flag" :class="{ active: project.flagged }">
            <ceri-icon name="fa-flag" size="10" hcenter></ceri-icon>
        </div>
        <div class="unresolved" :class="{ active: project.unresolvedMessages.length }">
            <ceri-icon name="fa-comment" size="10" hcenter></ceri-icon>
        </div>
        <div class="content">
            <div class="names">
                <span class="client">{{ project.client ? project.client.name : 'No Client' }}</span>
                <span class="project">{{ project.name }}</span>
            </div>
        </div>
        <footer>
            <person-tag v-if="show.manager" :person="project.manager"></person-tag>
            <person-tag v-if="show.contractor && project.contractor" :person="project.contractor"></person-tag>
            <div class="meta">
                <span class="estimate">{{ project.estimate | formatHours }}</span>
                <span class="due" v-if="project.dueString">{{ project.dueString }}</span>
            </div>
        </footer>
    </router-link>

</template>


<script>
    import PersonTag from './PersonTag.vue';

    export default {
        name: 'project-card',
        props: {
            project: {},
            show: {
                default: () => {
                    return {
                        contractor: false,
                        manager: true
                    }
                }
            }
        },
        components: {PersonTag}
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-card {
        background: white;
        border: 1px solid $gray;
        border-radius: 5px;
        margin: 20px 0;
        padding: 10px;
        position: relative;
        width: 100%;
        @include lifts;
        &:hover {
            border-color: white;
            .flag, .unresolved {
                border-top: 1px solid white;
            }
        }

        @include unselectable;

        // Badges
        .flag, .unresolved {
            background: white;
            border: 1px solid $gray;
            border-radius: 0 0 3px 3px;
            color: $gray;
            position: absolute;
                top: -1px;
            text-align: center;
            transition: all 0.15s ease;
            width: 25px; height: 17px;

            &.active {
                border: none;
                top: -2px;

            }
        }
        .flag {
            right: 10px;

            &.active {
                background: lighten(red, 35%);
                ceri-icon {
                    color: red;
                }
            }

        }
        .unresolved {
            right: 40px;

            &.active {
                background: lighten(orange, 35%);
                ceri-icon {
                    color: orange;
                }
            }

        }

        .content {
            margin: 0 0 10px 0;

            .names {
                display: flex;
                flex-flow: column;

                span.client {
                    font-size: 0.9em;
                    opacity: 0.75;
                    margin-bottom: 0;
                }

                span.project {
                    font-weight: 700;

                }

            }

        }

        footer {
            align-items: center;
            border-radius: 0 0 5px 5px;
            display: flex;
            justify-content: space-between;
            width: 100%;

            .meta {
                display: flex;

                span {
                    display: block;
                    font-size: 0.9em;
                    opacity: 0.75;

                    &.due {
                        font-weight: 900;
                        padding-left: 5px;

                    }

                }

            }

        }

    }

</style>

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
            <span v-if="show.manager" class="manager-tag" :style="{borderColor: managerColor(), color: managerColor('darker')}">{{ project.manager.firstName }}</span>
            <span v-if="show.contractor && project.contractor" class="contractor-tag" :style="{backgroundColor: contractorColor('faded'), borderColor: contractorColor('faded'), color: contractorColor('darker')}">{{ project.contractor.firstName }}</span>
            <div class="meta">
                <span class="estimate">{{ project.estimate | formatHours }}</span>
                <span class="due" v-if="project.dueString">{{ project.dueString }}</span>
            </div>
        </footer>
    </router-link>

</template>


<script>

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
        methods: {
            contractorColor (modifier) {
                var baseColor = this.project.contractor ?
                    this.project.contractor.color :
                    this.project.manager.color;
                switch (modifier) {
                    case 'faded':
                        return tinycolor(baseColor).lighten(30).toString();
                    case 'darker':
                        return tinycolor(baseColor).darken(20).toString();
                    default:
                        return baseColor;
                }

            },
            managerColor (modifier) {
                switch (modifier) {
                    case 'faded':
                        return tinycolor(this.project.manager.color).lighten(30).toString();
                    case 'darker':
                        return tinycolor(this.project.manager.color).darken(20).toString();
                    default:
                        return this.project.manager.color;
                }

            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .project-card {
        background: white;
        border: 1px solid $shadow;
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

        @include no-select;

        // Badges
        .flag, .unresolved {
            background: white;
            border: 1px solid $shadow;
            border-radius: 0 0 3px 3px;
            color: $shadow;
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



            .contractor-tag, .manager-tag {
                border: 1px solid white;
                border-radius: 2px;
                box-sizing: border-box;
                display: inline-block;
                font-size: 0.9em;
                font-weight: 700;
                margin-right: 2px;
                padding: 4px 6px;

            }

            .manager-tag {
                font-weight: 500;

            }

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

<template>

    <div id="project-editor">
        <header class="modal-card-head">
            <div class="inner">
                <p class="modal-card-title">New Project</p>
                <router-link tag="button" :to="{name: $store.state.route.view}" class="delete"></router-link>
            </div>
        </header>
        <section class="modal-card-body">
            <!-- Basics -->
            <section>
                <header>
                    <span class="title">Basics</span>
                </header>
                <div class="fields">
                    <div class="field-columns">
                        <div class="field-column">
                            <input type="text" v-model="client_id" placeholder="Client">
                        </div>
                        <div class="field-column">
                            <input type="text" v-model="name" placeholder="Project Name">
                        </div>
                    </div>
                    <textarea v-model="overview" placeholder="Create an overview resource for the project..."></textarea>
                </div>
            </section>
            <!-- Team -->
            <section>
                <header>
                    <span class="title">Team</span>
                </header>
                <div class="fields">
                    <div class="field-columns">
                        <div class="field-column">
                            <input type="text" v-model="manager_id" placeholder="Manager">
                        </div>
                        <div class="field-column">
                            <input type="text" v-model="contractor_id" placeholder="Contractor">
                        </div>
                    </div>
                </div>
            </section>
            <!-- Timeline -->
            <section>
                <header>
                    <span class="title">Timeline</span>
                </header>
                <div class="fields">
                    <div class="field-columns">
                        <div class="field-column">
                            <hours-input v-model="estimate"></hours-input>
                        </div>
                        <div class="field-column">
                            <hours-input v-model="max"></hours-input>
                        </div>
                    </div>
                    <div class="field-columns">
                        <div class="field-column">
                            <input type="date" v-model="start">
                        </div>
                        <div class="field-column">
                            <input type="date" v-model="target">
                        </div>
                        <div class="field-column">
                            <input type="date" v-model="due">
                        </div>
                    </div>

                </div>
            </section>
            <!-- Settings -->
            <section>
                <header>
                    <span class="title">Settings</span>
                </header>
                <div class="fields">
                    <input type="text" v-model="autocycle" placeholder="Autocycle">
                    <input type="checkbox" v-model="flagged"> Priority
                </div>
            </section>
        </section>
        <footer class="modal-card-foot">
            <button class="button inverted" tabindex="-1">Cancel</button>
            <button class="button">Save</button>
        </footer>
    </div>

</template>


<script>
    import HoursInput from './inputs/HoursInput.vue';

    export default {
        name: 'project-editor',
        components: {HoursInput},
        data () {
            return {
                id: cuid(),
                name: '',
                start: new moment().format('YYYY-MM-DD'),
                target: null,
                due: null,
                estimate: 0.25,
                max: 0.25,
                autocycle: null,
                cycle: 0,
                status: 'delegate',
                flagged: false,
                client_id: null,
                contractor_id: null,
                manager_id: null,
                archived: false,
                overview: ''
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    #project-editor {

        .modal-card-head {
            background: white;
            border: none;
            border-radius: 3px 3px 0 0;
            padding: 0 40px;
            position: relative;

            .inner {
                border-bottom: 1px solid $shadow;
                padding: 40px 0;
                width: 100%;

                .modal-card-title {
                    font-size: 1.2em;
                    font-weight: 900;
                }

                .delete {
                    background-color: $shadow;
                    position: absolute;
                        top: 20px; right: 20px;
                }

            }

        }

        .modal-card-body {
            padding: 40px;

            section {
                display: flex;
                margin-bottom: 40px;
                    &:last-of-type { margin-bottom: 0; }

                header {
                    flex: 0 0 140px;

                    span.title {
                        font-size: 1em;
                        font-weight: 700;

                    }

                }

                .fields {
                    display: flex;
                    flex-flow: column;

                    .field-columns {
                        display: flex;
                        flex-wrap: wrap;

                        .field-column {
                            display: flex;
                            flex-flow: column;
                            &:first-of-type { margin-right: 5px; }
                            &:last-of-type { margin-left: 5px; }

                        }

                    }

                }

            }

        }

        .modal-card-foot {
            background: $white-ter;
            border: none;
            border-radius: 0 0 3px 3px;
            justify-content: flex-end;
            padding: 20px 40px;
        }

    }

</style>

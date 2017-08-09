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
                            <label>Project Name</label>
                            <div class="moca-input">
                                <input type="text" v-model="name" autofocus>
                            </div>
                        </div>
                        <div class="field-column">
                            <label>Client</label>
                            <person-input role="client" v-model="client_id"></person-input>
                        </div>
                    </div>
                    <div class="field-columns">
                        <div class="field-column single">
                            <label>Overview</label>
                            <div class="moca-input">
                                <textarea v-model="overview" placeholder="Create an overview resource for the project..."></textarea>
                            </div>
                        </div>
                    </div>
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
                            <label>Manager</label>
                            <div class="moca-input">
                                <person-input role="manager" v-model="manager_id"></person-input>
                            </div>
                        </div>
                        <div class="field-column">
                            <label>Contractor</label>
                            <person-input role="contractor" v-model="contractor_id"></person-input>
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
                            <label>Estimate</label>
                            <hours-input v-model="estimate"></hours-input>
                        </div>
                        <div class="field-column">
                            <label>Max</label>
                            <hours-input v-model="max"></hours-input>
                        </div>
                    </div>
                    <div class="field-columns">
                        <div class="field-column">
                            <label>Start</label>
                            <date-input v-model="start"></date-input>
                        </div>
                        <div class="field-column middle">
                            <label>Soft Due</label>
                            <date-input v-model="target"></date-input>
                        </div>
                        <div class="field-column">
                            <label>Hard Due</label>
                            <date-input v-model="due"></date-input>
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
                    <div class="field-columns">
                        <div class="field-column single">
                            <label>Autocycle</label>
                            <autocycle-input v-model="autocycle"></autocycle-input>
                        </div>
                    </div>
                    <div class="field-columns">
                        <div class="field-column single">
                            <label>Priority</label>
                            <flagged-input v-model="flagged"></flagged-input>
                        </div>
                    </div>
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
    import PersonInput from './inputs/PersonInput.vue';
    import DateInput from './inputs/DateInput.vue';
    import AutocycleInput from './inputs/AutocycleInput.vue';
    import FlaggedInput from './inputs/FlaggedInput.vue';

    import vSelect from 'vue-select';

    export default {
        name: 'project-editor',
        components: {HoursInput,vSelect,PersonInput,DateInput,AutocycleInput,FlaggedInput},
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
                overview: '',
                testVal: null
            }
        },
        computed: {
            clients () { return this.$store.getters.clients.map(client => { return {label: client.name, value: client.id} }); },
            managers () { return this.$store.getters.managers.map(manager => { return {label: manager.name, value: manager.id} }); },
            contractors () { return this.$store.getters.contractors.map(contractor => { return {label: contractor.name, value: contractor.id} }); }
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
                margin-bottom: 50px;
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
                    flex: 1 1;
                    flex-flow: column;

                    .field-columns {
                        display: flex;
                        margin-bottom: 30px;
                        &:last-of-type { margin-bottom: 0; }

                        .field-column {
                            display: flex;
                            flex: 1 1;
                            flex-flow: column;
                            position: relative;

                            &:first-of-type { margin-right: 5px; }
                            &:last-of-type { margin-left: 5px; }
                            &.single { margin: 0; }
                            &.middle { margin-right: 5px; margin-left: 5px; }

                            > label {
                                color: darken($gray,50%);
                                font-size: 0.75em;
                                font-weight: 700;
                                position: absolute;
                                    top: -1.6em;
                                text-transform: uppercase;

                            }

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

<template>

    <div id="project-editor">
        <div class="modal-card">
            <header class="modal-card-head">
                <div class="inner">
                    <p class="modal-card-title">{{ this.id ? this.projectPrimitive.name : 'New Project'}}</p>
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
                                    <input type="text" v-model="projectPrimitive.name" ref="nameEditor" autofocus>
                                </div>
                            </div>
                            <div class="field-column">
                                <label>Client</label>
                                <person-input roles="['client']" v-model="projectPrimitive.client_id" :disabled="this.id != null"></person-input>
                            </div>
                        </div>
                        <div class="field-columns" v-if="!this.id">
                            <div class="field-column single">
                                <label>Overview</label>
                                <div class="moca-input">
                                    <textarea v-model="resourcePrimitive.content.body" placeholder="Create an overview resource for the project..."></textarea>
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
                                    <person-input roles="['administrator','manager']" v-model="projectPrimitive.manager_id"></person-input>
                                </div>
                            </div>
                            <div class="field-column">
                                <label>Contractor</label>
                                <person-input ref="contractorInput" roles="['contractor']" v-model="projectPrimitive.contractor_id"></person-input>
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
                                <hours-input v-model="projectPrimitive.estimate"></hours-input>
                            </div>
                            <div class="field-column">
                                <label>Max</label>
                                <hours-input v-model="projectPrimitive.max"></hours-input>
                            </div>
                        </div>
                        <div class="field-columns">
                            <div class="field-column">
                                <label>Start</label>
                                <date-input v-model="projectPrimitive.start" :upward="true"></date-input>
                            </div>
                            <div class="field-column middle">
                                <label>Soft Due</label>
                                <date-input v-model="projectPrimitive.target" :upward="true" :align="'center'"></date-input>
                            </div>
                            <div class="field-column">
                                <label>Hard Due</label>
                                <date-input v-model="projectPrimitive.due" :upward="true" :align="'right'"></date-input>
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
                                <label>Recycle</label>
                                <autocycle-input v-model="projectPrimitive.autocycle"></autocycle-input>
                            </div>
                        </div>
                        <div class="field-columns">
                            <div class="field-column single">
                                <label>Priority</label>
                                <flagged-input v-model="projectPrimitive.flagged"></flagged-input>
                            </div>
                        </div>
                    </div>
                </section>
            </section>
            <footer class="modal-card-foot">
                <button class="button" @click="$router.go(-1)" tabindex="-1">Cancel</button>
                <button class="button primary" @click="save" :disabled="!validates">Save</button>
            </footer>
        </div>
    </div>

</template>


<script>
    import HoursInput from './inputs/HoursInput.vue';
    import PersonInput from './inputs/PersonInput.vue';
    import DateInput from './inputs/DateInput.vue';
    import AutocycleInput from './inputs/AutocycleInput.vue';
    import FlaggedInput from './inputs/FlaggedInput.vue';

    import MocaFactory from '../objects/mocaFactory.js';
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'project-editor',
        props: ['id','focusContractor'],
        components: {HoursInput,PersonInput,DateInput,AutocycleInput,FlaggedInput},
        data () {
            return {
                projectPrimitive: this.newProjectPrimitive(),
                resourcePrimitive: this.newResourcePrimitive()
            }
        },
        computed: {
            validates () {
                return this.projectPrimitive.name &&
                    this.projectPrimitive.manager_id &&
                    this.projectPrimitive.max >= this.projectPrimitive.estimate;
            },
            project () {
                return this.id ? this.$store.getters.project(this.id) : null;
            }
        },
        methods: {
            newProjectPrimitive () {
                return MocaFactory.constructPrimitive('project');
            },
            newResourcePrimitive () {
                return MocaFactory.constructPrimitive('resource',{name:'Overview'});
            },
            save () {

                // Logic Checks
                if (this.projectPrimitive.contractor_id && (!this.id || this.projectPrimitive.status == 'delegate')) {
                    this.projectPrimitive.status = 'do';
                }
                if (!this.projectPrimitive.contractor_id) {
                    this.projectPrimitive.status = 'delegate';
                }

                // Commit Project
                new MocaMutationSet(
                    this.id ? 'update' : 'create',
                    'project',
                    this.projectPrimitive.id,
                    this.projectPrimitive
                ).commit();

                // Commit Resource
                if (this.resourcePrimitive.content.body) {
                    this.resourcePrimitive.client_id = this.projectPrimitive.client_id;
                    this.resourcePrimitive.project_id = this.projectPrimitive.id;
                    new MocaMutationSet(
                        'create', 'resource', this.resourcePrimitive.id,
                        this.resourcePrimitive
                    ).commit();
                }

                // Route to Project
                let currentTab = router.currentRoute.path.split("/")[1];
                router.push({ name: currentTab + '-project', params: {id: this.projectPrimitive.id} });

            },
            focusOnContractor () {
                this.$refs.contractorInput.focus();
            }
        },
        created () {
            if (this.id) {
                Object.assign(this.projectPrimitive, this.project);
            }
        },
        mounted () {
            console.log(this.focusContractor);
            this.focusContractor ?
                this.focusOnContractor() :
                this.$refs.nameEditor.focus();
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #project-editor {
        align-self: flex-start;
        margin: 40px;

        .modal-card-head {
            background: white;
            border: none;
            border-radius: 3px 3px 0 0;
            padding: 0 40px;
            position: relative;

            .inner {
                border-bottom: 1px solid $gray;
                padding: 40px 0;
                width: 100%;

                .modal-card-title {
                    font-size: 1.2em;
                    font-weight: 900;
                }

                .delete {
                    background-color: $gray;
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
                                color: $dark;
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
            background: $light;
            border: none;
            border-radius: 0 0 3px 3px;
            justify-content: flex-end;
            padding: 20px 40px;
        }

    }

</style>

<template>

    <div class="time-row" :class="{editing}" @dblclick="edit">

        <!-- Icon -->
        <div class="cell time-icon" :class="object.type"><ceri-icon size="12" :name="iconName"></ceri-icon></div>

        <!-- Date -->
        <div v-if="!editing" class="cell date">{{ time.date | date }} <span class="year">{{ time.date | year }}</span></div>
        <div v-else          class="cell date"><date-input v-model="primitive.date" align="left" ref="initialInput"></date-input></div>

        <!-- Worker -->
        <div class="cell worker"><span v-if="worker" :style="{background: worker.lightColor, color: worker.darkColor}">{{ worker.firstName }}</span></div>

        <!-- Client -->
        <div v-if="!isDraft" class="cell client">{{ time.client ? time.client.name : '' }}</div>
        <div v-else          class="cell client"><person-input :roles="['client']" v-model="primitive.client_id"></person-input></div>

        <!-- Project -->
        <template v-if="object.type == 'log'">
            <!-- editing a draft or non-project log -->
            <template v-if="editing && (isDraft || !primitive.project_id)">
                <!-- editing a draft -->
                <template v-if="isDraft">
                    <div class="cell project"><project-input v-model="primitive.project_id" :allProjects="availableProjects"></project-input></div>
                </template>
                <!-- no project is set -->
                <template v-if="!primitive.project_id">
                    <div class="cell memo"><div class="moca-input"><input type="text" v-model="primitive.memo" placeholder="Memo"></div></div>
                </template>
            </template>
            <!-- else -->
            <template v-else>
                <div v-if="time.project_id" class="cell project">{{ time.project ? time.project.name : '' }}<span class="cycle" v-if="time.project">{{ time.cycle + 1 }}</span></div>
                <div v-else                      class="cell memo">{{ time.memo }}</div>
            </template>
        </template>

        <!-- Details -->
        <template v-if="object.type == 'credit'">
            <div v-if="!editing" class="cell project">Expires on {{ time.package.expiration_date | date }}</div>
            <div v-else         class="cell project">Expiration Picker</div>
        </template>

        <!-- Hours -->
        <template v-if="!editing">
            <div class="cell outflow">{{ outflow | hours }}</div>
            <div class="cell inflow">{{ inflow | hours }}</div>
        </template><template v-else>
            <div class="cell hours"><hours-input v-model="primitive.hours" :max="max"></hours-input></div>
        </template>

        <!-- Actions -->
        <div class="actions" v-if="editing">
            <button tabindex="-1" class="button dangerous" v-if="!isDraft" @click="deleteTime">Delete</button>
            <button tabindex="-1" class="button" @click="stopEditing">Cancel</button>
            <button class="button primary" @click="save" :disabled="!validates">Save</button>
        </div>

    </div>

</template>


<script>
    import Time from '../objects/time.js';
    import HoursInput from './inputs/HoursInput.vue';
    import PersonInput from './inputs/PersonInput.vue';
    import ProjectInput from './inputs/ProjectInput.vue';
    import DateInput from './inputs/DateInput.vue';
    import MocaFactory from '../objects/mocaFactory.js';
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'time-row',
        props: ['time','_primitive_','locked'],
        components: {HoursInput,PersonInput,DateInput,ProjectInput},
        data () { return {
            editing: this.isDraft,
            primitive: {
                date: null,
                client_id: null,
                project_id: null,
                memo: '',
                hours: null
            }
        }},
        computed: {
            availableProjects () {
                let allProjects = store.state.user.canManage ?
                    store.state.projects :
                    store.getters.projectsByContractor(store.state.user.id);
                let projectsForClient = this.object.client_id ?
                    allProjects.filter(project => project.client_id == this.object.client_id) :
                    [];
                return projectsForClient;
            },
            worker () {
                return this.time ?
                    this.time.worker :
                    this.primitive.worker_id ?
                        store.getters.person(this.primitive.worker_id) :
                        null;
            },
            object () {
                return this.time ? this.time : this.primitive;
            },
            isDraft () {
                return !this.time;
            },
            inflow () {
                return this.object.type == 'credit' ? this.object.hours : null;
            },
            outflow () {
                return this.object.type != 'credit' ? this.object.hours : null;
            },
            iconName () {
                switch (this.object.type) {
                    case 'credit': return 'fa-cube';
                    case 'expiration': return 'fa-calendar-times-o';
                    default: return 'fa-pencil';
                }
            },
            timeProject () {
                return this.time ? this.time.project : null;
            },
            primitiveClient () {
                return !this.time ? this.primitive.client_id : null;
            },
            max () {
                if (!this.object.project_id) { return null; }
                let project = this.time ?
                    this.time.project :
                    store.getters.project(this.object.project_id);
                return this.time ?
                    project.max - project.hoursLogged + this.time.hours :
                    project.max - project.hoursLogged;
            },
            validates () {
                return this.object.project_id || this.object.memo.length;
            }
        },
        methods: {
            edit () {
                if (this.editing || this.locked) { return; }
                this.setPrimitiveFromTime();
                this.editing = true;
                this.$emit('startedEditing');

                let me = this;
                setTimeout(function () { me.$refs.initialInput.focus(); }, 0);
            },
            stopEditing () {
                if (!this.isDraft) { this.editing = false; }
                this.$emit('stoppedEditing');
            },
            deleteTime () {
                this.$emit('stoppedEditing');
                if (confirm("Are you sure you want to delete this entry?")) {
                    new MocaMutationSet('delete', 'time', this.time.id).commit();
                }
            },
            setPrimitiveFromTime() {
                Object.assign(this.primitive, this.time);
            },
            save () {
                if (!this.isDraft) {
                    new MocaMutationSet(
                        'update', 'time',
                        this.primitive.id, this.primitive
                    ).commit();
                    this.stopEditing();
                } else {
                    new MocaMutationSet(
                        'create', 'time',
                        this.primitive.id, this.primitive
                    ).commit();
                    this.stopEditing();
                }
            }
        },
        watch: {
            timeProject: function(newVal) {
                if (newVal && this.time) { this.time.memo = null; }
            },
            primitiveClient: function(val) {
                this.primitive.project_id = null;
            }
        },
        created () {
            if (this._primitive_) {
                this.editing = true;
                Object.assign(this.primitive, this._primitive_);
            }
        },
        mounted () {
            if (this.editing) {
                let me = this;
                setTimeout(function () { me.$refs.initialInput.focus(); }, 0);
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    // see time table

</style>

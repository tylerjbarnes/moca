<template>

    <div class="time-row" :class="{editing, pending: time && time.pending}" @dblclick="edit">

        <!-- Icon -->
        <div class="cell time-icon" :class="object.type"><icon :name="iconName"></icon></div>

        <!-- Date -->
        <div v-if="!editing" class="cell date">{{ time.date | date(false) }} <span class="year">{{ time.date | year }}</span></div>
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
                <div v-if="time.project_id" class="cell project">{{ time.project ? time.project.name : '' }}<span class="cycle" v-if="time.project && time.cycle != time.project.cycle">{{ time.cycle + 1 }}</span></div>
                <div v-else                      class="cell memo">{{ time.memo }}</div>
            </template>
        </template>

        <!-- Details -->
        <template v-if="object.type == 'purchase'">
            <div v-if="!editing && time.package" class="cell project">Expires on {{ time.package.expiration_date | date }}</div>
            <div v-else         class="cell project">
                <date-input v-model="packagePrimitive.expiration_date"></date-input>
            </div>
        </template>
        <template v-else-if="object.type == 'expiration'">
            <div class="cell project"></div>
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
            <button tabindex="-1" class="button dangerous" v-if="!isDraft && user.canManage" @click="deleteTime">{{ time && time.pending ? 'Reject' : 'Delete' }}</button>
            <button tabindex="-1" class="button" @click="stopEditing">Cancel</button>
            <button class="button primary" @click="approve" v-if="time && time.pending && user.canManage">Approve</button>
            <button class="button primary" @click="save" v-else :disabled="!validates">Save</button>
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
            },
            packagePrimitive: {
                expiration_date: null
            }
        }},
        computed: {
            availableProjects () {
                let allProjects = store.getters.user.canManage ?
                    store.getters.activeProjects :
                    store.getters.projectsByContractor(store.getters.user.id);
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
                return this.object.type == 'purchase' ? this.object.hours : null;
            },
            outflow () {
                return this.object.type != 'purchase' ? this.object.hours : null;
            },
            iconName () {
                switch (this.object.type) {
                    case 'purchase': return 'cube';
                    case 'expiration': return 'calendar-times-o';
                    default: return 'pencil';
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
                return this.object.type == 'log' ?
                    this.object.project_id || this.object.memo.length :
                    this.object.client_id && this.packagePrimitive.expiration_date;
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
                if (confirm("Are you sure you want to delete this entry?")) {
                    if (this.type == 'purchase' && this.time.package) {
                        new MocaMutationSet('delete', 'package', this.time.package.id).commit();
                    }
                    new MocaMutationSet('delete', 'time', this.time.id).commit();
                    this.$emit('stoppedEditing');
                }
            },
            setPrimitiveFromTime() {
                Object.assign(this.primitive, this.time);
                if (this.time.package) {
                    this.packagePrimitive.expiration_date = this.time.package.expiration_date;
                }
            },
            async save () {
                this.primitive.pending = !store.getters.user.canManage && !this.primitive.project_id;
                if (this.primitive.project_id) {
                    let project = await store.getters.object('project', this.primitive.project_id);
                    this.primitive.cycle = project.cycle;
                }
                if (!this.isDraft) {
                    new MocaMutationSet(
                        'update', 'time',
                        this.primitive.id, this.primitive
                    ).commit();
                    if (this.primitive.type == 'purchase') {
                        this.packagePrimitive.client_id = this.primitive.client_id;
                        this.packagePrimitive.hours = this.primitive.hours;
                        new MocaMutationSet(
                            'update', 'package',
                            this.time.package.id, this.packagePrimitive
                        ).commit();
                    }
                    this.stopEditing();
                } else {
                    new MocaMutationSet(
                        'create', 'time',
                        this.primitive.id, this.primitive
                    ).commit();
                    if (this.primitive.type == 'purchase') {
                        this.packagePrimitive.client_id = this.primitive.client_id;
                        this.packagePrimitive.hours = this.primitive.hours;
                        new MocaMutationSet(
                            'create', 'package',
                            this.packagePrimitive.id, this.packagePrimitive
                        ).commit();
                    }
                    this.stopEditing();
                }
            },
            approve () {
                this.primitive.pending = false;
                this.save();
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
                if (this.primitive.type == 'purchase'){
                    this.packagePrimitive = MocaFactory.constructPrimitive('package');
                    this.primitive.package_id = this.packagePrimitive.id;
                }
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

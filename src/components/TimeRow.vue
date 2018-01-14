<template>

    <div class="time-row">{{ time.hours | hours }} on {{ time.date | date }}</div>

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
                    if (this.type == 'credit' && this.time.package) {
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
            save () {
                this.primitive.pending = !store.state.user.canManage;
                if (!this.isDraft) {
                    new MocaMutationSet(
                        'update', 'time',
                        this.primitive.id, this.primitive
                    ).commit();
                    if (this.primitive.type == 'credit') {
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
                    if (this.primitive.type == 'credit') {
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
                if (this.primitive.type == 'credit'){
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

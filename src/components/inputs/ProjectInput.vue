<template>

    <div class="project-input">
        <button class="delete" @click="clearSelection" v-if="searchTerm.length" tabindex="-1"></button>
        <input ref="input" role="text" v-model="searchTerm" @focus="focus" @blur="isFocused = false" @keydown="handleKey" @input="input" :disabled="disabled || !projects.length" placeholder="No Project">
        <div class="panel" v-show="isFocused || panelIsFocused" @mouseover="panelIsFocused = true" @mouseleave="leavePanel();panelIsFocused = false">
            <div class="items">
                <div class="item" v-for="(project,index) in projects" @mouseover="softSelect(index)" @click="select(project)" :class="{selected:isSelected(project)}">{{ project.name }}</div>
            </div>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'project-input',
        props: ['allProjects','value','disabled'],
        data () {
            return {
                searchTerm: '',
                displayValue: '',
                isFocused: false,
                panelIsFocused: false,
                selectedProject: null
            }
        },
        watch: {
            value: function(val) { val ? this.select(store.getters.project(val)) : this.select(null); }
        },
        computed: {
            projects () {
                let options = {extract: (project) => project.name};
                return fuzzy.filter(this.searchTerm, this.allProjects, options).map(result => result.original);
            },
            placeholderText () {
                return 'Select a Project';
            }
        },
        methods: {
            handleKey (event) {
                switch (event.keyCode) {
                    case 9:
                    case 13:
                        this.commitSelection();
                        this.blur();
                        break;
                    default: break;
                }
            },
            input () {
                if (this.searchTerm == '') {
                    this.selectedProject = null;
                    this.commitSelection();
                    return;
                }
                this.selectedProject = this.projects[0];
            },
            leavePanel () {
                this.selectedProject = this.searchTerm ? this.projects[0] : null;
            },
            blur () {
                this.panelIsFocused = false;
                this.isFocused = false;
                this.projects.length && this.searchTerm.length ?
                    this.commitSelection() :
                    this.clearSelection();
            },
            focus () {
                if (this.searchTerm) { this.softSelect(0); }
                this.$refs.input.focus();
                this.isFocused = true;
            },
            softSelect (index) {
                this.selectedProject = this.projects[index];
            },
            select (project) {
                this.selectedProject = project;
                this.commitSelection();
                this.inputIsFocused = false;
                this.panelIsFocused = false;
            },
            isSelected (project) {
                return this.selectedProject && project.id === this.selectedProject.id;
            },
            commitSelection () {
                this.searchTerm = this.selectedProject ? this.selectedProject.name : '';
                this.$emit('input', this.selectedProject ? this.selectedProject.id : null);
                this.panelIsFocused = false;
            },
            clearSelection () {
                this.searchTerm = '';
                this.$emit('input', null);
            }
        },
        created () {
            let project = this.projects.find(project => project.id === this.value);
            this.searchTerm = project ? project.name : '';
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .project-input {
        @include moca-input;
        position: relative;

        button.delete {
            position: absolute;
                top: 5px;
                right: 5px;
            transform: scale(0.75);
            transition: 0.2s;
            &:not(:hover) {
                opacity: 0.5;
            }
        }

        .panel {
            background: white;
            box-shadow: 0px 0px 15px 0px darken($gray,5%);
            max-height: 200px;
            overflow-y: scroll;
            position: absolute;
            width: 100%;
            z-index: 10;

            .items {

                .item {
                    @include unselectable;
                    font-size: 0.75em;
                    padding: 5px 10px;
                    &.selected {
                        background: $primary;
                        color: white;
                        font-weight: 900;
                    }

                }

            }

            .empty {
                color: $medium-dark;
                font-size: 0.75em;
                font-weight: 700;
                padding: 5px 10px;

            }

        }

    }

</style>

<template>

    <div class="person-input">
        <button class="delete" @click="clearSelection" v-if="searchTerm.length" tabindex="-1"></button>
        <input ref="input" role="text" v-model="searchTerm" @focus="focus" @blur="isFocused = false" @keydown="handleKey" @input="input" :disabled="disabled || !persons.length" :placeholder="placeholderText">
        <div class="panel" v-show="isFocused || panelIsFocused" @mouseover="panelIsFocused = true" @mouseleave="leavePanel();panelIsFocused = false">
            <div class="items">
                <div class="item" v-for="(person,index) in persons" @mouseover="softSelect(index)" @click="select(person)" :class="{selected:isSelected(person)}">{{ person.name }}</div>
            </div>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'person-input',
        props: ['roles','value','disabled'],
        data () {
            return {
                searchTerm: '',
                displayValue: '',
                isFocused: false,
                panelIsFocused: false,
                selectedPerson: null
            }
        },
        computed: {
            persons () {
                let options = {extract: (person) => person.name};
                let allPersons = this.$store.getters.personsByRoles(this.roles);
                return fuzzy.filter(this.searchTerm, allPersons, options).map(result => result.original);
            },
            placeholderText () {
                return 'Select a ' + (this.roles.includes('client') ?
                    (this.roles.length > 1 ? 'Person' : 'Client') :
                    'Member');
            }
        },
        watch: {
            value: function(val) { val ? this.select(store.getters.person(val)) : this.select(null); }
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
                    this.selectedPerson = null;
                    this.commitSelection();
                    return;
                }
                this.selectedPerson = this.persons[0];
            },
            leavePanel () {
                this.selectedPerson = this.searchTerm ? this.persons[0] : null;
            },
            blur () {
                this.panelIsFocused = false;
                this.isFocused = false;
                this.persons.length && this.searchTerm.length ?
                    this.commitSelection() :
                    this.clearSelection();
            },
            focus () {
                if (this.searchTerm) { this.softSelect(0); }
                this.$refs.input.focus();
                this.isFocused = true;
            },
            softSelect (index) {
                this.selectedPerson = this.persons[index];
            },
            select (person) {
                this.selectedPerson = person;
                this.commitSelection();
                this.inputIsFocused = false;
                this.panelIsFocused = false;
            },
            isSelected (person) {
                return this.selectedPerson && person.id === this.selectedPerson.id;
            },
            commitSelection () {
                this.searchTerm = this.selectedPerson ? this.selectedPerson.name : '';
                this.$emit('input', this.selectedPerson ? this.selectedPerson.id : null);
                this.panelIsFocused = false;
            },
            clearSelection () {
                this.searchTerm = '';
                this.$emit('input', null);
            }
        },
        created () {
            let person = this.persons.find(person => person.id === this.value);
            this.searchTerm = person ? person.name : '';
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .person-input {
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

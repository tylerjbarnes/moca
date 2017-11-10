<template>

    <div class="selector">
        <button class="delete" @click="clearSelection" v-if="searchTerm.length" tabindex="-1"></button>
        <input ref="input" role="text" v-model="searchTerm" @focus="focus" @blur="isFocused = false" @keydown="handleKey" @input="input" :disabled="disabled || !items.length">
        <div class="panel" v-show="isFocused || panelIsFocused" @mouseover="panelIsFocused = true" @mouseleave="leavePanel();panelIsFocused = false">
            <div class="items">
                <div class="item" v-for="(item,index) in items" @mouseover="softSelect(index)" @click="select(item)" :class="{selected:isSelected(item)}">{{ item.name }}</div>
            </div>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'selector',
        props: ['allItems','value','disabled','description'],
        data () {
            return {
                searchTerm: '',
                displayValue: '',
                isFocused: false,
                panelIsFocused: false,
                selectedItem: null
            }
        },
        computed: {
            items () {
                let options = {extract: (item) => item.name};
                return fuzzy.filter(this.searchTerm, this.allItems, options).map(result => result.original);
            },
            placeholderText () {
                return 'Select a ' + description;
            }
        },
        watch: {
            value: function(val) { val ? this.select(this.allItems.find(item => item.id == val)) : this.select(null); }
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
                    this.selectedItem = null;
                    this.commitSelection();
                    return;
                }
                this.selectedItem = this.items[0];
            },
            leavePanel () {
                this.selectedItem = this.searchTerm ? this.items[0] : null;
            },
            blur () {
                this.panelIsFocused = false;
                this.isFocused = false;
                this.items.length && this.searchTerm.length ?
                    this.commitSelection() :
                    this.clearSelection();
            },
            focus () {
                if (this.searchTerm) { this.softSelect(0); }
                this.$refs.input.focus();
                this.isFocused = true;
            },
            softSelect (index) {
                this.selectedItem = this.items[index];
            },
            select (item) {
                this.selectedItem = item;
                this.commitSelection();
                this.inputIsFocused = false;
                this.panelIsFocused = false;
            },
            isSelected (item) {
                return this.selectedItem && item.id === this.selectedItem.id;
            },
            commitSelection () {
                this.searchTerm = this.selectedItem ? this.selectedItem.name : '';
                this.$emit('input', this.selectedItem ? this.selectedItem.id : null);
                this.panelIsFocused = false;
            },
            clearSelection () {
                this.searchTerm = '';
                this.$emit('input', null);
            }
        },
        created () {
            let item = this.items.find(item => item.id === this.value);
            this.searchTerm = item ? item.name : '';
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .selector {
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

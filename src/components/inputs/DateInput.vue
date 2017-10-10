<template>

    <div class="date-input">
        <input type="text" ref="input" :value="inputReadout" @input="updateStringValue($event.target.value)" @keydown="handleKey" @focus="updateStringValueFromValue();isFocused = true" @blur="isFocused = false" :placeholder="placeholder">
        <div class="panel" v-show="isFocused || panelIsFocused" @mouseover="panelIsFocused = true" @mouseleave="leavePanel();panelIsFocused = false" :class="[align,{upward:upward}]">
            <datepicker :inline="true" v-model="picker" @selected="pickerSelected" @changedMonth="keepFocus" @changedYear="keepFocus" @changedDecade="keepFocus" :highlighted="{dates:[new Date()]}" :disabled="this.disabledDates"></datepicker>
        </div>
    </div>

</template>


<script>
    import Datepicker from 'vuejs-datepicker';

    export default {
        name: 'date-input',
        props: ['value','upward','placeholder','disabledDates','align'],
        components: {Datepicker},
        data () {
            return {
                picker: null,
                isFocused: false,
                panelIsFocused: false,
                stringValue: moment(this.value).format('MMM DD, YYYY')
            }
        },
        computed: {
            inputReadout () {
                return this.isFocused ? this.stringValue : ( this.value ? moment(this.value).format('MMM DD, YYYY') : '');
            }
        },
        methods: {
            updateValue (value) {
                this.stringValue = moment(value).format('MMM DD, YYYY')
                this.$emit('input', moment(value).format('YYYY-MM-DD'));
            },
            updateStringValue (value) {
                if (value === '') {
                    this.stringValue = '';
                    this.picker = null;
                    this.$emit('input', null);
                    return;
                }

                this.stringValue = value;
                let theMoment = moment(value,'MMM DD, YYYY');
                if (theMoment.isValid()) {
                    let theDate = new Date(theMoment.year(), theMoment.month(), theMoment.date());
                    this.picker = theDate;
                    this.$emit('input', theMoment.format('YYYY-MM-DD'));
                }
            },
            updateStringValueFromValue () {
                return this.stringValue = this.value ? moment(this.value).format('MMM DD, YYYY') : '';
            },
            pickerSelected (value) {
                this.updateValue(value);
                this.blur();
            },
            leavePanel () {

            },
            keepFocus () {
                this.$refs.input.focus();
            },
            handleKey (event) {
                switch (event.keyCode) {
                    case 9:
                    case 13:
                        // this.commitSelection();
                        this.blur();
                        break;
                    default: break;
                }
            },
            blur () {
                this.panelIsFocused = false;
                this.isFocused = false;
                // this.persons.length && this.searchTerm.length ?
                //     this.commitSelection() :
                //     this.clearSelection();
            },
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .date-input {
        min-width: 100px;
        position: relative;
        @include moca-input;

        input {
            width: 100%;
        }

        .panel {
            padding-bottom: 40px;
            position: absolute;
            z-index: 100;

            &.upward {
                bottom: 100%;
                padding-bottom: 0;
            }

            &.center {
                right: calc(50% - 150px);
            }

            &.right {
                right: 0;
            }

            .vdp-datepicker {
                font: inherit !important;

                .vdp-datepicker__calendar {
                    border: none;
                    box-shadow: 0px 0px 15px 0px rgba(black,0.1);

                    .cell {
                        &.highlighted {
                            background: rgba($primary,0.25);
                        }
                        &.selected {
                            background: $primary;
                        }
                        &:not(.blank):not(.disabled):hover {
                            &.day, &.month, &.year {
                                border-color: $primary;
                            }

                        }
                    }

                }

            }

        }

    }

</style>

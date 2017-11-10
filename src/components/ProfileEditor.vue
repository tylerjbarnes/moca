<template>

    <div id="profile-editor">
        <div class="form-card">
            <span class="color-preview"
                :style="{
                    background: lightColor,
                    color: darkColor
                    }">{{ $store.state.user.name }}</span>
            <div class="fields">
                <div class="field-columns">
                    <div class="field-column">
                        <label>Cell Number</label>
                        <div class="moca-input">
                            <input type="text" v-model="cell_number" @input="cell_number = formatCell(cell_number)">
                        </div>
                    </div>
                    <div class="field-column">
                        <label>Cell Provider</label>
                        <selector v-model="cell_provider" :allItems="cellProviderOptions" :description="'Provider'"></selector>
                    </div>
                </div>
                <div class="field-columns">
                    <div class="field-column">
                        <label>Timezone</label>
                        <selector v-model="time_offset" :allItems="timezoneOptions" :description="'Provider'"></selector>
                    </div>
                    <div class="field-column">
                        <label>Notification Time</label>
                        <selector v-model="notification_time" :allItems="notificationTimeOptions" :description="'Provider'"></selector>
                    </div>
                </div>
                <div class="field-columns">
                    <div class="field-column">
                        <div class="color-select">
                            <color-picker v-model="colorObject"></color-picker>
                        </div>
                    </div>
                </div>
            </div>
            <div class="actions">
                <button @click="cancel" class="button">Cancel</button>
                <button @click="save" :disabled="!validates" class="primary button">Save</button>
            </div>
        </div>
    </div>

</template>


<script>
    import PersonTag from './PersonTag.vue';
    import Selector from './inputs/Selector.vue';
    import MocaMutationSet from '../objects/mocaMutationSet.js';
    import { Slider } from 'vue-color';

    export default {
        name: 'profile-editor',
        data () { return {
            colorObject: this.colorObjectFromHex(store.state.user.color),
            colorUpdateTimeout: null,
            cell_number: store.state.user.cell_number,
            cell_provider: store.state.user.cell_provider,
            cellProviderOptions: [
                { id: 'verizon', name: 'Verizon' },
                { id: 'att', name: 'AT&T' },
                { id: 'tmobile', name: 'T-Mobile' },
                { id: 'sprint', name: 'Sprint' }
            ],
            time_offset: store.state.user.time_offset,
            timezoneOptions: [
                { id: -12, name: '(GMT -12:00) Eniwetok, Kwajalein' },
                { id: -11, name: '(GMT -11:00) Midway Island, Samoa' },
                { id: -10, name: '(GMT -10:00) Hawaii' },
                { id:  -9, name: '(GMT -9:00) Alaska' },
                { id:  -8, name: '(GMT -8:00) Pacific Time' },
                { id:  -7, name: '(GMT -7:00) Mountain Time' },
                { id:  -6, name: '(GMT -6:00) Central Time, Mexico City' },
                { id:  -5, name: '(GMT -5:00) Eastern Time, Bogota, Lima' },
                { id:  -4, name: '(GMT -4:00) Atlantic Time (Canada), Caracas, La Paz' },
                { id:  -3, name: '(GMT -3:30) Newfoundland' },
                { id:  -3, name: '(GMT -3:00) Brazil, Buenos Aires, Georgetown' },
                { id:  -2, name: '(GMT -2:00) Mid-Atlantic' },
                { id:  -1, name: '(GMT -1:00 hour) Azores, Cape Verde Islands' },
                { id:   0, name: '(GMT) Western Europe Time, London, Lisbon, Casablanca' },
                { id:   1, name: '(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris' },
                { id:   2, name: '(GMT +2:00) Kaliningrad, South Africa' },
                { id:   3, name: '(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg' },
                { id:   3, name: '(GMT +3:30) Tehran' },
                { id:   4, name: '(GMT +4:00) Abu Dhabi, Muscat, Baku, Tbilisi' },
                { id:   4, name: '(GMT +4:30) Kabul' },
                { id:   5, name: '(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent' },
                { id:   5, name: '(GMT +5:30) Bombay, Calcutta, Madras, New Delhi' },
                { id:   5, name: '(GMT +5:45) Kathmandu' },
                { id:   6, name: '(GMT +6:00) Almaty, Dhaka, Colombo' },
                { id:   7, name: '(GMT +7:00) Bangkok, Hanoi, Jakarta' },
                { id:   8, name: '(GMT +8:00) Beijing, Perth, Singapore, Hong Kong' },
                { id:   9, name: '(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk' },
                { id:   9, name: '(GMT +9:30) Adelaide, Darwin' },
                { id:  10, name: '(GMT +10:00) Eastern Australia, Guam, Vladivostok' },
                { id:  11, name: '(GMT +11:00) Magadan, Solomon Islands, New Caledonia' },
                { id:  12, name: '(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka' }
            ],
            notification_time: store.state.user.notification_time,
            notificationTimeOptions: [
                { id: 0,  name: '12:00 AM' },
                { id: 1,  name: '1:00 AM'  },
                { id: 2,  name: '2:00 AM'  },
                { id: 3,  name: '3:00 AM'  },
                { id: 4,  name: '4:00 AM'  },
                { id: 5,  name: '5:00 AM'  },
                { id: 6,  name: '6:00 AM'  },
                { id: 7,  name: '7:00 AM'  },
                { id: 8,  name: '8:00 AM'  },
                { id: 9,  name: '9:00 AM'  },
                { id: 10, name: '10:00 AM' },
                { id: 11, name: '11:00 AM' },
                { id: 12, name: '12:00 PM' },
                { id: 13, name: '1:00 PM'  },
                { id: 14, name: '2:00 PM'  },
                { id: 15, name: '3:00 PM'  },
                { id: 16, name: '4:00 PM'  },
                { id: 17, name: '5:00 PM'  },
                { id: 18, name: '6:00 PM'  },
                { id: 19, name: '7:00 PM'  },
                { id: 20, name: '8:00 PM'  },
                { id: 21, name: '9:00 PM'  },
                { id: 22, name: '10:00 PM' },
                { id: 23, name: '11:00 PM' },
            ]
        }},
        computed: {
            lightColor () {
                return tinycolor(this.colorObject.hex).lighten(32).toString();
            },
            darkColor () {
                return tinycolor(this.colorObject.hex).darken(25).saturate(20).toString();
            },
            validates () {
                return this.cell_number != store.state.user.cell_number ||
                       this.cell_provider != store.state.user.cell_provider ||
                       this.time_offset != store.state.user.time_offset ||
                       this.notification_time != store.state.user.notification_time ||
                       this.colorObject.hex != store.state.user.color;
            }
        },
        methods: {
            colorObjectFromHex (hex) {
                let tc = tinycolor(hex);
                return {
                    hex: hex,
                    hsl: tc.toHsl(),
                    hsv: tc.toHsv(),
                    rgb: tc.toRgb(),
                    a: 1
                }
            },
            // saveColor () {
            //     new MocaMutationSet(
            //         'update', 'person', store.state.user.id,
            //         {color: this.colorObject.hex}
            //     ).commit();
            // },
            formatCell (val) {
                 return !isNaN(parseInt(val)) ?
                     parseInt(val).toString().substr(0,10) :
                     '';
            },
            save () {
                new MocaMutationSet(
                    'update', 'person', store.state.user.id,
                    {
                        cell_number: this.cell_number,
                        cell_provider: this.cell_provider,
                        time_offset: this.time_offset,
                        notification_time: this.notification_time,
                        color: this.colorObject.hex
                    }
                ).commit();
                router.go(-1);
            },
            cancel () {
                router.go(-1);
            }
        },
        components: {'color-picker': Slider, PersonTag, Selector}
        // watch: {
        //     colorObject: function(newVal) {
        //         let vm = this;
        //         clearTimeout(this.colorUpdateTimeout);
        //         this.colorUpdateTimeout = setTimeout(function () {
        //             vm.saveColor();
        //         }, 1000);
        //     }
        // }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #profile-editor {
        display: flex;
        justify-content: center;

        .form-card {
            align-items: stretch;
            background: white;
            border-radius: 10px;
            box-shadow: 0px 7.5px 25px 0px darken($light,5%);
            display: flex;
            flex-flow: column;
            justify-content: center;
            max-width: 600px;
            overflow: visible;
            margin-top: 40px;
            padding: 40px;
            width: 100%;

            .color-preview {
                align-self: center;
                border-radius: 2px;
                font-weight: 700;
                margin-bottom: 60px;
                padding: 4px 8px;
                text-align: center;

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
                                top: -1.6em; left: 0; right: 0;
                            text-align: center;
                            text-transform: uppercase;

                        }

                        .color-select {
                            align-items: center;
                            display: flex;
                            flex-flow: column;
                            padding-top: 10px;

                        }

                    }

                }

            }

            .actions {
                display: flex;
                justify-content: center;
                padding-top: 40px;

                button:not(:last-of-type) {
                    margin-right: 10px;
                }

            }

        }

    }

</style>

<template>
    <div class="request-view" :class="{open: editing}">
        <div class="wrapper">
            <div class="dialogue">
                <div class="row">
                    <div class="moca-input">
                        <input type="text" ref="reason" v-model="primitive.content.reason" placeholder="Why do you need more time?" autofocus>
                    </div>
                </div>
                <div class="row">
                    <hours-input v-model="primitive.content.hours" :min="0"></hours-input>
                    <date-input v-model="primitive.content.due" :upward="true" :disabledDates="disabledDates()" :placeholder="'Same Due'"></date-input>
                </div>
                <div class="row">
                    <button class="button dangerous" @click="save" :disabled="!valid">Submit Request</button>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
    import HoursInput from './inputs/HoursInput.vue';
    import DateInput from './inputs/DateInput.vue';
    import MocaFactory from '../objects/mocaFactory.js';
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'request',
        props: ['project'],
        data () { return {
            primitive: this.newMessagePrimitive(),
            editing: false
        }},
        components: {HoursInput,DateInput},
        mounted () {
            this.$refs.reason.focus();
        },
        computed: {
            valid () {
                return this.primitive.content.reason &&
                    (this.primitive.content.hours || this.primitive.content.due);
            }
        },
        methods: {
            newMessagePrimitive () {
                return MocaFactory.constructPrimitive('message',{
                    type: 'request',
                    project_id: this.project.id,
                    cycle: this.project.cycle,
                    content: {
                        hours: 0.00,
                        due: null,
                        reason: ''
                    }
                });
            },
            disabledDates () {
                return {
                    to: new Date(moment(this.project.due).add(1,'days'))
                };
            },
            save () {
                this.primitive.datetime = new moment().utc().format('YYYY-MM-DD HH:mm:ss');

                new MocaMutationSet(
                    'create', 'message',
                    this.primitive.id, this.primitive
                ).commit();
                this.primitive = this.newMessagePrimitive();
                this.editing = false;
                this.$emit('closeRequest');
            }
        }
    }
</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .request-view {
        align-items: center;
        justify-content: center;
        display: flex;
        height: 100%; width: 100%;
        position: absolute;
            top: 0; left: 0;

        .wrapper {
            position: absolute;
                bottom: 45px;

            .dialogue {
                background: white;
                border-radius: 5px;
                overflow: visible;
                padding: 10px;

                @include shadow(rgba(black,0.2));

                .row {
                    display: flex;
                    flex-grow: 1;

                    &:not(:first-of-type) {
                        margin-top: 10px;
                    }

                    > *:last-of-type:not(:first-of-type) {
                        margin-left: 10px;
                    }

                    button.button {
                        width: 100%;
                    }

                }

            }

        }

    }

</style>

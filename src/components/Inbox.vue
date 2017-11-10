<template>

    <div id="inbox">
        <div class="items">
            <inbox-item v-for="item in items"
                :key="item.object.id"
                :type="item.type"
                :object="item.object"
                :selected="selected && item.object.id === selected.object.id"
                @selected = "select(item)"
            ></inbox-item>
        </div>
        <div class="preview">
            <template v-if="!selected">No more items!</template>
            <template v-else-if="selected.type == 'project'">
                <conversation-view ref="focalPoint" :project="selected.object"></conversation-view>
            </template>
            <template v-else-if="selected.type == 'time'">
                <div class="time-table-wrapper">
                    <time-table :times="times"></time-table>
                    <div class="actions">
                        <button class="dangerous button" @click="rejectTime">Reject</button>
                        <button ref="focalPoint" class="primary button" @click="approveTime">Approve</button>
                    </div>
                </div>
            </template>
            <template v-else-if="selected.type == 'client'">
                <div class="avatar">
                    <img :src="selected.object.avatar">
                </div>
                <span class="title">{{ selected.object.name }}</span>
                <span>{{ selected.object.expirationDescription }}</span>
                <div class="blurbs">
                    <div class="blurb">
                        <label>Balance</label>
                        <span :class="{negative: selected.object.balance < 0}">{{ selected.object.balance | hours }}</span>
                    </div>
                    <div class="blurb">
                        <label>Budgeted</label>
                        <span :class="{negative: selected.object.hoursBudgetedOnActiveProjects < 0}">{{ selected.object.hoursBudgetedOnActiveProjects | hours }}</span>
                    </div>
                    <div class="blurb">
                        <label>Available</label>
                        <span :class="{negative: selected.object.hoursAvailable < 0}">{{ selected.object.hoursAvailable | hours }}</span>
                    </div>
                </div>
                <date-input v-model="extensionDate" :upward="true" :disabledDates="disabledDates" :placeholder="'New Expiration Date'"></date-input>
                <div class="actions">
                    <button class="primary button" :disabled="!extensionDate" @click="extendPackage">Extend</button>
                    <button ref="focalPoint" class="dangerous button" @click="expirePackage">Expire</button>
                </div>
            </template>
        </div>
    </div>

</template>


<script>
    import InboxItem from './InboxItem.vue';
    import ConversationView from './ConversationView.vue';
    import DateInput from './inputs/DateInput.vue';
    import TimeTable from './TimeTable.vue';
    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'inbox',
        props: [],
        data () { return {
            selectedIndex: null,
            extensionDate: null
        }},
        components: {InboxItem,ConversationView,TimeTable,DateInput},
        computed: {
            selected () {
                return this.items[this.selectedIndex];
            },
            projectItems () {
                let messages = store.state.user.canManage ?
                    store.getters.messagesFromContractors.filter(message => !message.resolved) :
                    store.getters.messagesFromManagers.filter(message => !message.resolved);
                let projects = [...new Set(messages.map(message => message.project))];
                return projects.map(project => ({type: 'project', object: project, time: project.lastChatMessage.datetime}));
            },
            timeItems () {
                let times = store.getters.pendingTimes;
                return times.map(time => ({type: 'time', object: time, time: time.date}));
            },
            clientItems () {
                let clients = store.getters.expiredClients;
                return clients.map(client => ({type: 'client', object: client, time: client.lastPackage.time.date}));
            },
            items () {
                return [...this.projectItems, ...this.timeItems, ...this.clientItems].sort((a,b) => {
                    return a.time < b.time;
                });
            },
            times () {
                let times = [];
                times.push(store.getters.time(this.selected.object.id));
                return times;
            },
            disabledDates () {
                return {
                    to: new Date(moment(this.selected.object.lastPackage.expiration_date).add(1,'days'))
                };
            }
        },
        methods: {
            select(item) {
                var vm = this;
                this.selectedIndex = this.items.indexOf(item);
                setTimeout(function () { vm.$refs.focalPoint && vm.$refs.focalPoint.focus(); });
            },
            shiftSelection(steps) {
                this.selectedIndex += steps;
                if (this.selectedIndex < 0 || this.selectedIndex > this.items.length) {
                    this.selectedIndex = null;
                }
            },
            keydown (keyCode) {
                switch (keyCode) {
                    case 38: // up
                        this.shiftSelection(-1);
                        break;
                    case 40: // down
                        this.shiftSelection(1);
                        break;
                    default: break;
                }
            },
            // Times
            approveTime () {
                new MocaMutationSet(
                    'update', 'time',
                    this.selected.object.id, {pending:false}
                ).commit();
            },
            rejectTime () {
                new MocaMutationSet(
                    'delete', 'time', this.selected.object.id
                ).commit();
            },
            // Packages
            extendPackage () {
                this.selected.object.lastPackage.extend(moment(this.extensionDate).format('YYYY-MM-DD'));
            },
            expirePackage () {
                this.selected.object.lastPackage.expire();
            }
        },
        mounted () {
            if (this.items.length && !this.selected) {
                this.select(this.items[0]);
            }
            bus.$on('keydown', (keyCode) => { this.keydown(keyCode); });
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #inbox {
        position: absolute;
            top: $header-size; bottom: 0;
            left: $header-size; right: 0;

        > .items {
            background: white;
            border-right: 1px solid $gray;
            height: 100%;
            position: absolute;
            width: 300px;
            z-index: 2;

            .titles {

                .inbox-title {
                    font-weight: bold;
                }

            }

        }

        > .preview {
            align-items: center;
            display: flex;
            flex-flow: column;
            height: 100%;
            justify-content: center;
            overflow: hidden;
            position: absolute;
                top: 0; bottom: 0;
                left: 300px; right: 0;

            .time-table-wrapper {
                align-self: stretch;
                align-items: stretch;
                display: flex;
                flex-flow: column;
                padding: 0 20px;

            }

            .avatar {
                img {
                    border-radius: 50px;
                    height: 100px;

                }

            }

            > span.title {
                margin-bottom: 0;

            }

            .blurbs {
                display: flex;
                flex: 1 1;
                flex-grow: 0;
                margin: 20px 40px 40px 40px;

                .blurb {
                    align-items: center;
                    border-right: 2px solid $light;
                    display: flex;
                    flex: 1 1;
                    flex-flow: column;
                    margin: 0 10px;
                    text-align: center;
                    &:first-of-type {
                        border-left: 2px solid $light;
                    }

                    label {
                        color: $medium;
                        font-size: 0.75em;
                        font-weight: 700;
                        text-transform: uppercase;

                    }

                    span {
                        font-weight: 700;
                        padding: 0 10px;
                        white-space: nowrap;

                        &.negative {
                            color: $red;
                            font-weight: 900;

                        }

                    }

                }

            } // blurbs

            .date-input {
                background: white;
                margin-top: 10px;
                max-width: 300px;
            }

            .actions {
                display: flex;
                justify-content: center;
                margin: 20px 0;

                .button {
                    margin: 0 5px;

                }

            }

        }

    }

</style>
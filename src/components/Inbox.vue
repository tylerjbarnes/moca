<template>

    <div id="inbox" v-if="ready">
        <div class="items">
            <inbox-item v-for="item in items"
                :key="item.object.id"
                :type="item.type"
                :time="item.time"
                :object="item.object"
                :selected="itemIsSelected(item)"
                @selected = "requestSelectionByItem(item)"
            ></inbox-item>
        </div>
        <div class="preview">
            <template v-if="!selectedItem">Wow, Inbox Zero. Nice 👌</template>
            <template v-else-if="selectedItem.type == 'project'">
                <project-header :project="selectedItem.object" :external="true"></project-header>
                <conversation-view ref="focalPoint" :project="selectedItem.object"></conversation-view>
            </template>
            <template v-else-if="selectedItem.type == 'time'">
                <div class="time-table-wrapper">
                    <time-table :times="times"></time-table>
                    <div class="actions">
                        <button class="dangerous button" @click="rejectTime">Reject</button>
                        <button ref="focalPoint" class="primary button" @click="approveTime">Approve</button>
                    </div>
                </div>
            </template>
            <template v-else-if="selectedItem.type == 'client'">
                <div class="avatar">
                    <img :src="selectedItem.object.avatar">
                </div>
                <span class="title">{{ selectedItem.object.name }}</span>
                <span>{{ selectedItem.object.expirationDescription }}</span>
                <div class="blurbs">
                    <div class="blurb">
                        <label>Balance</label>
                        <span :class="{negative: selectedItem.object.balance < 0}">{{ selectedItem.object.balance | hours }}</span>
                    </div>
                    <div class="blurb">
                        <label>Budgeted</label>
                        <span :class="{negative: selectedItem.object.hoursBudgetedOnActiveProjects < 0}">{{ selectedItem.object.hoursBudgetedOnActiveProjects | hours }}</span>
                    </div>
                    <div class="blurb">
                        <label>Available</label>
                        <span :class="{negative: selectedItem.object.hoursAvailable < 0}">{{ selectedItem.object.hoursAvailable | hours }}</span>
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
    import ConversationView from './ConversationView.vue';
    import DateInput from './inputs/DateInput.vue';
    import InboxItem from './InboxItem.vue';
    import MocaFactory from '../objects/mocaFactory.js';
    import MocaMutationSet from '../objects/mocaMutationSet.js';
    import ProjectHeader from './ProjectHeader.vue';
    import TimeTable from './TimeTable.vue';

    export default {
        name: 'inbox',
        components: {ConversationView,DateInput,InboxItem,ProjectHeader,TimeTable},
        props: [],
        data () { return {
            selectedItem: null,
            extensionDate: null
        }},
        computed: {
            projectItems () {
                let projects = store.getters.projectsWithResolvableMessages;
                return projects
                    .map(project => {
                        return {
                            type: 'project',
                            object: project,
                            time: store.getters.resolvableMessagesByProject(project.id)[0].datetime
                        }
                    });
            },
            timeItems () {
                let times = store.getters.pendingTimes;
                return times.map(time => ({type: 'time', object: time, time: time.date}));
            },
            clientItems () {
                let clients = store.getters.expiredClients;
                return clients.map(client => ({type: 'client', object: client, time: client.lastPackage.expiration_date})); // @TODO - only needed for bad data
            },
            items () {
                return this.user.canManage ?
                    _.orderBy([...this.projectItems, ...this.timeItems, ...this.clientItems], 'time', 'desc') :
                    _.orderBy([...this.projectItems], 'time', 'desc');
            },
            times () {
                return [store.getters.time(this.selectedItem.object.id)];
            },
            disabledDates () {
                return {
                    to: new Date(moment(this.selectedItem.object.lastPackage.expiration_date).add(1,'days'))
                };
            }
        },
        methods: {
            async requestSelectionByItem (item) {
                if (item.type == 'project') {
                    await store.dispatch('fetch', {bufferName: 'messagesByProject', id: item.object.id});
                    await store.dispatch('fetch', {bufferName: 'timesByProject', id: item.object.id});
                }
                this.setSelection(item.object.id);
            },
            async requestSelectionByIndex (index) {
                if (index < 0) index = 0;
                if (this.items.length >= index + 1) {
                    this.requestSelectionByItem(this.items[index]);
                } else {
                    this.items.length ?
                        this.requestSelectionByIndex(this.items.length - 1) :
                        this.setSelection(null);
                }
            },
            setSelection (objectId) {
                this.selectedItem = _.find(this.items, x => x.object.id == objectId);
            },
            indexOfItem (item) {
                return _.findIndex(this.items, x => x.object.id == item.object.id);
            },
            itemIsSelected (item) {
                return this.selectedItem && this.selectedItem.object.id == item.object.id;
            },
            updateSelectionForChangeInItems (oldSelectedIndex) {
                if (this.selectedItem && _.find(this.items, x => x.object.id == this.selectedItem.object.id)) return;
                if (this.items.length >= oldSelectedIndex) {
                    this.requestSelectionByIndex(oldSelectedIndex);
                } else if (this.items.length) {
                    this.requestSelectionByItem(this.items[this.items.length - 1]);
                } else {
                    this.setSelection(null);
                }
            },
            keydown (keyCode) {
                if (!this.selectedItem) return;
                switch (keyCode) {
                    case 38: // up
                        this.requestSelectionByIndex(this.indexOfItem(this.selectedItem) - 1);
                        break;
                    case 40: // down
                        this.requestSelectionByIndex(this.indexOfItem(this.selectedItem) + 1);
                        break;
                    default: break;
                }
            },
            // Times
            approveTime () {
                new MocaMutationSet(
                    'update', 'time',
                    this.selectedItem.object.id, {pending:false}
                ).commit();
            },
            rejectTime () {
                new MocaMutationSet(
                    'delete', 'time', this.selectedItem.object.id
                ).commit();
            },
            // Packages
            extendPackage () {
                this.selectedItem.object.lastPackage.extend(moment(this.extensionDate).format('YYYY-MM-DD'));
            },
            expirePackage () {
                this.selectedItem.object.lastPackage.expire();
            }
        },
        watch: {
            items: function(newVal, oldVal) {
                bus.$emit('updateInboxItems', newVal);
                let oldSelectedIndex = this.selectedItem ?
                    _.findIndex(oldVal, x => x.object.id == this.selectedItem.object.id) :
                    0;
                this.updateSelectionForChangeInItems(oldSelectedIndex);
            }
        },
        mounted () {
             bus.$emit('updateInboxItems', this.items);
             this.requestSelectionByIndex(0);
             bus.$on('keydown', (keyCode) => { this.keydown(keyCode); });
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #inbox {
        position: fixed;
            top: $header-size; bottom: 0;
            left: $header-size; right: 0;

        > .items {
            background: white;
            border-right: 1px solid $gray;
            height: 100%;
            overflow-y: scroll;
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

            .project-header {
                padding: 20px;

                .blurbs {
                    display: none;

                }

            }

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

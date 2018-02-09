import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import MocaObject from './objects/mocaObject.js';
import MocaFactory from './objects/mocaFactory.js';

import Client from './objects/client.js';
import Member from './objects/member.js';
import Message from './objects/message.js';
import Package from './objects/package.js';
import Project from './objects/project.js';
import Resource from './objects/resource.js';
import Time from './objects/time.js';

import axios from 'axios';
import qs from 'qs';
import Period from './period.js';

import Dexie from 'dexie';
import Mocadex from './mocadex.js';

// prepare the mocadex
window.db = new Dexie('mocadex');
db.version(1).stores({
    messages: '&id,resolved,project_id,datetime,type',
    packages: '&id',
    persons: '&id,&wp_id,archived,role',
    projects: '&id,archived,start',
    resources: '&id,project_id',
    times: '&id,date,pending,project_id,client_id,type'
});

const state = {
    userId: null,
    searchTerm: '',
    uiFilters: {
        archive: {
            clientId: null
        },
        projects: {
            started: false,
        },
        times: {
            period: new Period(),
            clientId: null,
            workerId: null
        }
    },
    route: { view: null, item: null },
    lastMutationId: 0,
    buffer: {

        // packages
        packages: null,

        // persons
        activePersons: null,

        // projects
        activeProjects: null,
        archivedProjects: null,
        projectsForTimesInPeriod: null,
        projectsWithUnresolvedMessages: null,

        // messages
        messagesByProject: null,
        resolvableMessages: null,

        // resources
        resourcesByProject: null,

        // times
        balances: null,
        pendingTimes: null,
        purchases: null,
        timesByProject: null,
        timesInPeriod: null

    }
};

const getters = {
    buffer: (state, getters) => (bufferName, single, id) => {
        // try { console.log(bufferName, buffers[bufferName].id, id); }
        if (
            !store.state.buffer[bufferName] ||
            (buffers[bufferName].id && buffers[bufferName].id != id)
        ) return single ? null : [];
        return single ?
            state.buffer[bufferName].find(x => x.id === id) :
            state.buffer[bufferName];
    },
    object: (state, getters) => (type, id) => {
        for (let bufferName of Object.keys(store.state.buffer)) {
            let buffer = store.state.buffer[bufferName];
            let foundObj = buffer ? _.find(buffer, ['id', id]) : null;
            if (foundObj){
                return foundObj;
            }
        }
        // console.log(new Error('Object not found!'), type, id);
        return null;
    },

    // messages
    messagesByProject: (state, getters) => (id) => getters.buffer('messagesByProject', false, id),
    resolvableMessages: (state, getters) => getters.buffer('resolvableMessages'),
    resolvableMessagesByProject: (state, getters) => (id) => getters.resolvableMessages.filter(x => x.project_id == id),

    // packages
    mocaPackage: (state, getters) => (id) => getters.buffer('packages', true, id),
    packagesByClient: (state, getters) => (id) => getters.buffer('packages').filter(x => x.client_id == id),

    // persons
    clients: (state, getters) => _.orderBy(getters.buffer('activePersons').filter(x => x.role == 'client'), 'name'),
    members: (state, getters) => _.orderBy(getters.buffer('activePersons').filter(x => x.role != 'client'), 'name'),
    person: (state, getters) => (id) => getters.buffer('activePersons', true, id) || getters.buffer('archivedPersons', true, id),
    personsByRoles: (state, getters) => (roles) => _.orderBy(getters.buffer('activePersons').filter(x => roles.includes(x.role)), 'name'),
    user: (state, getters) => getters.person(state.userId),
    expiredClients: (state, getters) => _.orderBy(state.buffer.balances && getters.buffer('activePersons').filter(x => x.role == 'client' && x.expired), 'name'),

    // projects
    activeProjects: (state, getters) => getters.buffer('activeProjects'),
    archivedProjects: (state, getters) => getters.buffer('archivedProjects'),
    project: (state, getters) => (id) => getters.buffer('activeProjects', true, id) || getters.buffer('projectsForTimesInPeriod', true, id) || getters.buffer('archivedProjects', true, id),
    projectsByClient: (state, getters) => (id) => getters.buffer('activeProjects').filter(x => x.client_id == id),
    projectsByContractor: (state, getters) => (id) => getters.buffer('activeProjects').filter(x => x.contractor_id == id),
    projectsByManager: (state, getters) => (id) => getters.buffer('activeProjects').filter(x => x.manager_id == id),
    projectsWithResolvableMessages: (state, getters) => {
        let projectsWithUnresolvedMessages = getters.buffer('projectsWithUnresolvedMessages');
        let resolvableMessages = getters.resolvableMessages;
        let projectIdsWithResolvableMessages = _.uniq(resolvableMessages.map(x => x.project_id));
        return projectsWithUnresolvedMessages.filter(x => projectIdsWithResolvableMessages.includes(x.id));
    },

    // resources
    resourcesByProject: (state, getters) => (id) => getters.buffer('resourcesByProject', false, id),

    // times
    balance: (state, getters) => (id) => {
        if (!state.buffer.balances) { console.log(new Error()); }
        return _.find(state.buffer.balances, ['clientId', id]).balance;
    },
    pendingTimes: (state, getters) => getters.buffer('pendingTimes'),
    purchaseByPackage: (state, getters) => (id) => getters.buffer('purchases').find(x => x.package_id == id),
    timesByProject: (state, getters) => (id) => getters.buffer('timesByProject', false, id),
    timesInPeriod: (state, getters) => _.orderBy(getters.buffer('timesInPeriod'), 'date', 'desc'),

    // other
    online: (state, getters) => (id) => true, // @TODO
    route: (state, getters) => store.state.route,

};

const mutations = {

    loseProject (state, id) {
        state.messages = state.messages.filter(message => message.project_id != id);
        state.resources = state.resources.filter(resource => resource.project_id != id);
    },

    // Interface

    setSearchTerm(state, searchTerm) { state.searchTerm = searchTerm; },
    setUiFilter(state, filterData) { state.uiFilters[filterData.type][filterData.name] = filterData.value; },
    setUser(state, id) { state.userId = id; },
    // setLastMutationId(state, mutationId) { state.lastMutationId = mutationId; },
    updateRoute(state, route) { state.route = route; },
    // ready(state) { state.ready = true; }

    setBuffer(state, {name, data, id}) { state.buffer[name] = data; buffers[name].id = id; },

    updateBuffer(state, {mutations, primitives}) {
        for (let mutation of mutations) {
            let primitive = _.find(primitives, ['id', mutation.object_id]);
            console.log(mutation.object_type, mutation.property_name, mutation.property_value);

            for (let bufferName in buffers) {
                let buffer = buffers[bufferName];

                if (buffer.watch && buffer.watch[mutation.object_type]) {
                    buffer.watch[mutation.object_type](mutation);
                }
                if (buffer.primitiveType != mutation.object_type) continue;

                let objectIndex = _.findIndex(state.buffer[bufferName], (o) => o.id == mutation.object_id);
                switch (mutation.action) {
                    case 'create':
                    case 'update':
                        if (buffer.shouldContain && buffer.shouldContain(primitive)) {
                            // add or update
                            let object = MocaFactory.constructObject(buffer.primitiveType, primitive);
                            if (objectIndex >= 0) {
                                state.buffer[bufferName].splice(objectIndex, 1, object);
                            } else {
                                state.buffer[bufferName] && state.buffer[bufferName].push(object);
                            }
                        } else {
                            // delete
                            if (objectIndex >= 0) {
                                state.buffer[bufferName].splice(objectIndex, 1);
                            }
                        }
                        break;
                    case 'delete':
                        if (objectIndex >= 0) {
                            state.buffer[bufferName].splice(objectIndex, 1);
                        }
                }

            }
        }
    },

    cleanup(state, primitiveIds) {
        for (let bufferName in buffers) {
            let buffer = state.buffer[bufferName];
            if (!buffer) continue;
            let foundIndex = _.findIndex(buffer, x => primitiveIds.includes(x.id))
            if (foundIndex !== -1) {
                buffer.splice(foundIndex, 1);
            }
        }
    }

};

const buffers = {

    // packages
    packages: {
        primitiveType: 'package',
        fetch: () => new Promise(function(resolve, reject) {
            db.packages.toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => true
    },

    // persons
    archivedPersons: {
        primitiveType: 'person',
        fetch: () => new Promise(function(resolve, reject) {
            db.persons.where('archived').equals(1).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => primitive.archived
    },
    activePersons: {
        primitiveType: 'person',
        fetch: () => new Promise(function(resolve, reject) {
            db.persons.where('archived').equals(0).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => !primitive.archived
    },

    // projects

    // about to ipmplement archivedProjects as a fuzzy searched set of 20ish


    archivedProjects: {
        primitiveType: 'project',
        fetch: () => new Promise(function(resolve, reject) {
            let clientFilter = store.state.uiFilters.archive.clientId;
            clientFilter ?
                db.projects.orderBy('start').reverse().and(x => x.archived && x.client_id == clientFilter).toArray().then(primitives => { resolve(primitives); }) :
                db.projects.orderBy('start').reverse().and(x => x.archived).limit(40).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => primitive.archived
    },
    activeProjects: {
        primitiveType: 'project',
        fetch: () => new Promise(function(resolve, reject) {
            db.projects.where('archived').equals(0).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => !primitive.archived
    },
    projectsWithUnresolvedMessages: {
        primitiveType: 'project',
        fetch: () => new Promise(function(resolve, reject) {
            db.messages.orderBy('datetime').reverse().and(x => x.resolved == 0).toArray(messages => {
                let projectPromises = messages.map(message => db.projects.get(message.project_id));
                Promise.all(projectPromises).then(primitives => {
                    primitives = _.uniqBy(primitives.filter(x => !x.archived).reverse(), 'id').reverse();
                    resolve(primitives);
                });
            });
        }),
        watch: {
            message: (mutation) => {
                if (
                    mutation.action == 'update' && mutation.property_name == 'resolved' ||
                    mutation.action != 'update'
                ) {
                    store.dispatch('fetch', {bufferName: 'projectsWithUnresolvedMessages', force: true});
                }
            }
        }
    },
    projectsForTimesInPeriod: {
        primitiveType: 'project',
        fetch: () => new Promise(function(resolve, reject) {
            db.times.where('date').between(
                store.state.uiFilters.times.period.start,
                store.state.uiFilters.times.period.end
            ).toArray().then(times => {
                let projectIds = _.uniq(times.filter(x => x.project_id).map(x => x.project_id));
                db.projects.where('id').anyOf(projectIds).toArray()
                    .then(primitives => { resolve(primitives); });
            });
        }),
        watch: {
            time: (mutation) => {
                if (
                    mutation.action == 'update' && mutation.property_name == 'date' ||
                    mutation.action != 'update'
                ) {
                    store.dispatch('fetch', {bufferName: 'projectsForTimesInPeriod', force: true });
                }
            }
        }
    },

    // messages
    messagesByProject: {
        primitiveType: 'message',
        fetch: (id) => new Promise(function(resolve, reject) {
            db.messages.where('project_id').equals(id).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => buffers.messagesByProject.id && primitive.project_id === buffers.messagesByProject.id
    },
    resolvableMessages: {
        primitiveType: 'message',
        fetch: () => new Promise(function(resolve, reject) {
            db.messages.where('resolved').equals(0).and(x => messageIsResolvable(x)).toArray().then(primitives => {
                resolve(primitives);
            });
        }),
        shouldContain: (primitive) => messageIsResolvable(primitive)
    },

    // resources
    resourcesByProject: {
        primitiveType: 'resource',
        fetch: (id) => new Promise(function(resolve, reject) {
            db.resources.where('project_id').equals(id).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => buffers.resourcesByProject.id && primitive.project_id == buffers.resourcesByProject.id
    },

    // times
    balances: {
        primitiveType: null,
        fetch: () => new Promise(function(resolve, reject) {
            db.persons.where('role').equals('client').and(x => !x.archived).toArray(clients => {
                let timePromises = clients.map(client => new Promise(function(resolveInner, rejectInner) {
                    db.times.where('client_id').equals(client.id).toArray()
                        .then(times => {
                            let credit = _.sumBy(times.filter(x => x.type == 'purchase'), 'hours');
                            let debit = _.sumBy(times.filter(x => x.type != 'purchase'), 'hours');
                            resolveInner({clientId: client.id, balance: credit - debit});
                        });
                }));
                Promise.all(timePromises).then(balances => {
                    resolve(balances);
                });
            });
        }),
        watch: {
            time: (mutation) => {
                if (
                    mutation.action == 'update' && mutation.property_name == 'hours' ||
                    mutation.action != 'update'
                ) {
                    store.dispatch('fetch', {bufferName: 'balances', force: true});
                }
            }
        }
    },
    pendingTimes: {
        primitiveType: 'time',
        fetch: () => new Promise(function(resolve, reject) {
            db.times.where('pending').equals(1).toArray().then(primitives => {
                resolve(primitives);
            });
        }),
        shouldContain: (primitive) => primitive.pending
    },
    purchases: {
        primitiveType: 'time',
        fetch: () => new Promise(function(resolve, reject) {
            db.times.where('type').equals('purchase').toArray().then(primitives => {
                resolve(primitives);
            })
        }),
        shouldContain: (primitive) => primitive.type == 'purchase'
    },
    timesByProject: {
        primitiveType: 'time',
        fetch: (id) => new Promise(function(resolve, reject) {
            db.times.where('project_id').equals(id).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => buffers.timesByProject.id && primitive.project_id == buffers.timesByProject.id
    },
    timesInPeriod: {
        primitiveType: 'time',
        fetch: () => new Promise(function(resolve, reject) {
            db.times.where('date').between(
                store.state.uiFilters.times.period.start,
                store.state.uiFilters.times.period.end
            ).toArray().then(primitives => { resolve(primitives); });
        }),
        shouldContain: (primitive) => {
            return primitive.date >= store.state.uiFilters.times.period.start && primitive.date <= store.state.uiFilters.times.period.end;
        }
    }

};
window.buffers = buffers; // TEMP


const actions = {

    exportMutations (context, mutations) {

        // save mutations to IndexedDB
        Mocadex.saveMutations(mutations).then(() => {

            // fetch primitives
            let primitivePromises = [];
            for (let mutation of mutations) {
                primitivePromises.push(
                    Mocadex.getPrimitive(mutation.object_type, mutation.object_id)
                );
            }
            Promise.all(primitivePromises)
                .then(primitives => {

                    // update buffers
                    context.commit('updateBuffer', {mutations, primitives});

                    // sync

                });

        });

    },

    importMutations (context, data) {

    },

    // Object Gain

    gainObject (context, object) {

        // hpmAPI('object_dependents', [object.object_type, object.object_id]).then(data => {
        //     console.log('Gained Object Dependents', data);
        //
        //     // Add to Local Store
        //     context.commit('importObjects', data);
        //
        //     // Add to IndexedDB
        //     for (let type of [
        //         'message',
        //         'resource'
        //     ]) {
        //         for (let primitive of data[type + 's']) {
        //             forager.setObject(type, primitive.id, primitive);
        //         }
        //     }
        //
        // });

    },

    loseObject (context, object) {

        // // Only Support Projects for Now
        // console.log('Losing Access to Project', object);
        //
        // // Remove from IndexedDB
        // for (let type of [
        //     'message',
        //     'resource'
        // ]) {
        //     for (let primitive of store.state[type + 's'].filter(dep => dep.project_id == object.object_id)) {
        //         forager.removeObject(type, primitive.id);
        //     }
        // }
        //
        // // Remove from Local Store
        // context.commit('loseProject', object.object_id);

    },

    // Static Objects

    importObjects (context, data) {
        db.messages.where('id').notEqual('0').delete();
        db.packages.where('id').notEqual('0').delete();
        db.persons.where('id').notEqual('0').delete();
        db.projects.where('id').notEqual('0').delete();
        db.resources.where('id').notEqual('0').delete();
        db.times.where('id').notEqual('0').delete();
        data.messages && db.messages.bulkAdd(data.messages.map(x => typifyForIdb(x)));
        data.packages && db.packages.bulkAdd(data.packages.map(x => typifyForIdb(x)));
        data.persons && db.persons.bulkAdd(data.persons.map(x => typifyForIdb(x)));
        data.projects && db.projects.bulkAdd(data.projects.map(x => typifyForIdb(x)));
        data.resources && db.resources.bulkAdd(data.resources.map(x => typifyForIdb(x)));
        data.times && db.times.bulkAdd(data.times.map(x => typifyForIdb(x)));
    },

    // Fetch & Buffer Management

    fetch (context, {bufferName, id, force}) {
        if (!id && !force && store.state.buffer[bufferName]) return store.state.buffer[bufferName];
        return new Promise(function(resolve, reject) {
            buffers[bufferName].fetch(id)
                .then(primitives => {
                    let constructed = primitives.map(x =>
                        buffers[bufferName].primitiveType ?
                            MocaFactory.constructObject(buffers[bufferName].primitiveType, x) :
                            x
                    );
                    context.commit('setBuffer', {name: bufferName, data: constructed, id: id});
                    resolve();
                });
        });
    },

    cleanup (context, id) {
        // @TODO - incomplete
        db.messages.where('type').equals('mutation').and(x => x.content.object_id == id).toArray().then(primitives => {
            let primitiveIds = primitives.map(x => x.id);
            context.commit('cleanup', primitiveIds);
            db.messages.bulkDelete(primitiveIds);
        });
    },

    // Interface

    setSearchTerm (context, searchTerm) { context.commit('setSearchTerm', searchTerm); },
    setUiFilter (context, filterData) {
        context.commit('setUiFilter', filterData);

        if (filterData.type == 'times' && filterData.name == 'period') {
            store.dispatch('fetch', {bufferName: 'timesInPeriod', force: true});
            store.dispatch('fetch', {bufferName: 'projectsForTimesInPeriod', force: true});
        }

        if (filterData.type == 'archive' && filterData.name == 'clientId') {
            store.dispatch('fetch', {bufferName: 'archivedProjects', force: true });
        }

    },
    initialize (context, wpId) {
        let initialBuffers = [
            {bufferName: 'activePersons'},
            {bufferName: 'archivedPersons'},
            {bufferName: 'activeProjects'},
            {bufferName: 'archivedProjects'},
            {bufferName: 'resolvableMessages'},
            {bufferName: 'balances'},
            {bufferName: 'pendingTimes'},
            {bufferName: 'packages'},
            {bufferName: 'purchases'},
            {bufferName: 'timesInPeriod'},
            {bufferName: 'projectsForTimesInPeriod'},
            {bufferName: 'projectsWithUnresolvedMessages'}
        ];
        db.persons.get({ wp_id: wpId }).then((userPrimitive) => {
            context.commit('setUser', userPrimitive.id);

            let fetchPromises = initialBuffers.map(x => store.dispatch('fetch', x));
            Promise.all(fetchPromises).then(() => {
                bus.$emit('initialized');
            });
        });
    },
    updateRoute (context, route) { context.commit('updateRoute', route); },
    // ready (context) { context.commit('ready'); }

    setSearchTerm (context, searchTerm) {  },
    // setUiFilter (context, filterData) { },
    // setUser (context, wpId) { },
    // updateRoute (context, route) { },
    ready (context) { }

};


export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    mutations
});

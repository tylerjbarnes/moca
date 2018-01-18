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

// prepare the mocadex
var db = new Dexie('mocadex');
db.version(1).stores({
    messages: '&id,resolved,project_id',
    packages: '&id',
    persons: '&id,&wp_id,archived',
    projects: '&id,archived',
    resources: '&id,project_id',
    times: '&id,date,pending,project_id'
});

const state = {
    userId: null,
    searchTerm: '',
    uiFilters: {
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

    persons: {}, // all
    projects: {}, // unarchived
    timesInPeriod: {}, // current period
    mocaPackages: {}, // tied to times in current period

    archivedProjects: {}, // 20 at a time

    unresolvedMessages: {},
    pendingTimes: {},

    resourcesByProject: null,
    timesByProject: null,
    messagesByProject: null
};

const getters = {

    user: (state, getters) => MocaFactory.constructObject('person', getters.person(state.userId)),
    person: (state, getters) => (id) => MocaFactory.constructObject('person', state.persons[id]),
    project: (state, getters) => (id) => MocaFactory.constructObject('project', state.projects[id]),
    mocaPackage: (state, getters) => (id) => MocaFactory.constructObject('package', state.mocaPackages[id]),
    resource: (state, getters) => (id) => MocaFactory.constructObject('resource', state.resourcesByProject[id]),

    projectsByManager: (state, getters) => (id) => Object.values(state.projects).filter(x => x.manager_id === id)
        .map(x => MocaFactory.constructObject('project', x)),

    projectsByContractor: (state, getters) => (id) => Object.values(state.projects).filter(x => x.contractor_id === id)
        .map(x => MocaFactory.constructObject('project', x)),

    projectsByClient: (state, getters) => (id) => Object.values(state.projects).filter(x => x.client_id === id)
        .map(x => MocaFactory.constructObject('project', x)),

    unresolvedMessages: (state, getters) => () => Object.values(state.unresolvedMessages) // @TODO this one has to be called function style for no reason - lose the ()
        .map(x => MocaFactory.constructObject('message', x)),

    unresolvedMessagesByProject: (state, getters) => (id) => Object.values(state.unresolvedMessages).filter(x => x.project_id === id)
        .map(x => MocaFactory.constructObject('message', x)),

    members: (state, getters) => Object.values(state.persons).filter(x => x.role != 'client')
        .map(x => MocaFactory.constructObject('person', x)),

    clients: (state, getters) => Object.values(state.persons).filter(x => x.role == 'client')
        .map(x => MocaFactory.constructObject('person', x)),

    personsByRoles: (state, getters) => (roles) => Object.values(state.persons).filter(x => roles.includes(x.role))
        .map(x => MocaFactory.constructObject('person', x)),

    timesInPeriod: (state, getters) => Object.values(state.timesInPeriod)
        .map(x => MocaFactory.constructObject('time', x)),

    archivedProjects: (state, getters) => Object.values(state.archivedProjects)
        .map(x => MocaFactory.constructObject('project', x)),

    pendingTimes: (state, getters) => Object.values(state.pendingTimes)
        .map(x => MocaFactory.constructObject('time', x)),

    resourcesByProject: (state, getters) => (id) => state.resourcesByProject ?
        Object.values(state.resourcesByProject).map(x => MocaFactory.constructObject('resource', x)) :
        null,

    timesByProject: (state, getters) => (id) => state.timesByProject ?
        Object.values(state.timesByProject).map(x => MocaFactory.constructObject('time', x)) :
        null,

    messagesByProject: (state, getters) => (id) => state.messagesByProject ?
        Object.values(state.messagesByProject).map(x => MocaFactory.constructObject('message', x)) :
        null,

    route: (state, getters) => store.state.route,

    // // Single Objects
    //
    // object: (state, getters) => (type, id) => MocaFactory.constructObject(type, state.lookup[type][id]),
    // message: (state, getters) => (id) => getters.object('message', id),
    // mocaPackage: (state, getters) => (id) => getters.object('package', id),
    // person: (state, getters) => (id) => getters.object('person', id),
    // project: (state, getters) => (id) => getters.object('project', id),
    // resource: (state, getters) => (id) => getters.object('resource', id),
    // time: (state, getters) => (id) => getters.object('time', id),
    //
    // // Messages
    //
    // messagesByProject: (state, getters) => (id) => state.messages.filter(message => message.project_id === id).map(x => MocaFactory.constructObject('message', x)),
    // messagesFromContractors: (state, getters) => state.messages.filter(message => message.author.role == 'contractor' && message.type != 'activity').map(x => MocaFactory.constructObject('message', x)),
    // messagesFromManagers: (state, getters) => state.messages.filter(message => message.author.canManage && message.type != 'activity').map(x => MocaFactory.constructObject('message', x)),
    // mutationMessagesForObject: (state, getters) => (id) => state.messages.filter(message => message.content.object_id === id).map(x => MocaFactory.constructObject('message', x)),
    //
    // // Packages
    //
    // packagesByClient: (state, getters) => (id) => state.packages.filter(mocaPackage => mocaPackage.client_id === id).map(x => MocaFactory.constructObject('package', x)),
    //
    // // Persons
    //
    // clients: (state, getters) => state.persons.filter(person => person.role === 'client').map(x => MocaFactory.constructObject('person', x)),
    // activeClients: (state, getters) => state.persons.filter(person => person.role === 'client' && !person.archived).map(x => MocaFactory.constructObject('person', x)),
    // expiredClients: (state, getters) => getters.activeClients.filter(client => client.expired).map(x => MocaFactory.constructObject('person', x)),
    // management: (state, getters) => getters.members.filter(person => person.canManage).map(x => MocaFactory.constructObject('person', x)),
    // contractors: (state, getters) => state.persons.filter(person => person.role === 'contractor').map(x => MocaFactory.constructObject('person', x)),
    // members: (state, getters) => state.persons.filter(person => person.role !== 'client').map(x => MocaFactory.constructObject('person', x)),
    // activeMembers: (state, getters) => state.persons.filter(person => person.role !== 'client' && !person.archived).map(x => MocaFactory.constructObject('person', x)),
    // personsByRoles: (state, getters) => (roles) => state.persons.filter(person => roles.includes(person.role)).map(x => MocaFactory.constructObject('person', x)),
    //
    //
    // // Projects
    //
    // projectsByContractor: (state, getters) => (id) => state.projects.filter(project => project.contractor_id === id).map(x => MocaFactory.constructObject('project', x)),
    // projectsByManager: (state, getters) => (id) => state.projects.filter(project => project.manager_id === id).map(x => MocaFactory.constructObject('project', x)),
    // projectsByClient: (state, getters) => (id) => state.projects.filter(project => project.client_id === id).map(x => MocaFactory.constructObject('project', x)),
    // projectsByStatus: (state, getters) => (status) => state.projects.filter(project => project.status === status).map(x => MocaFactory.constructObject('project', x)),
    //
    // // Resources
    //
    // resourcesByProject: (state, getters) => (id) => state.resources.filter(resource => resource.project_id === id).map(x => MocaFactory.constructObject('resource', x)),
    // resourcesByClient: (state, getters) => (id) => state.resources.filter(resource => resource.client_id === id).map(x => MocaFactory.constructObject('resource', x)),
    //
    // // Times
    //
    // times: (state, getters) => state.times.sort((a,b) => a.date < b.date || (a.date == b.date && a.cycle < b.cycle)).map(x => MocaFactory.constructObject('time', x)),
    // pendingTimes: (state, getters) => getters.times.filter(time => time.pending).map(x => MocaFactory.constructObject('time', x)),
    // timesInPeriod: (state, getters) => state.times.filter(time => time.date >= state.uiFilters.times.period.start && time.date <= state.uiFilters.times.period.end).sort((a,b) => a.date < b.date || (a.date == b.date && a.cycle < b.cycle)).map(x => MocaFactory.constructObject('time', x)),
    // logsByProject: (state, getters) => (id) => state.times.filter(time => time.project_id === id).map(x => MocaFactory.constructObject('time', x)),
    // timesByContractor: (state, getters) => (id) => state.times.filter(time => time.worker_id === id).map(x => MocaFactory.constructObject('time', x)),
    // timesByClient: (state, getters) => (id) => state.times.filter(time => time.client_id === id).map(x => MocaFactory.constructObject('time', x)),
    // creditForPackage: (state, getters) => (id) => MocaFactory.constructObject('time', state.times.find(time => time.package_id === id)),

};

const mutations = {

    // Object Mutation

    mutateObject (state, mutation) {

        switch (mutation.action) {
            case 'create':
                state[mutation.object_type + 's'].push(
                    MocaFactory.constructObject(mutation.object_type, mutation.property_value)
                );
                break;
            case 'update':
                let object = state[mutation.object_type + 's'].find(object => object.id === mutation.object_id);
                object[mutation.property_name] = mutation.property_value;
                break;
            case 'delete':
                let deletionObject = state[mutation.object_type + 's'].find(object => object.id === mutation.object_id);
                deletionObject.cleanUp();
                state[mutation.object_type + 's'] = state[mutation.object_type + 's'].filter(
                    object => object.id !== mutation.object_id
                );
                break;
            default: return;
        }

    },

    // Static Objects

    importObjects (state, data) {

    },

    loseProject (state, id) {
        state.messages = state.messages.filter(message => message.project_id != id);
        state.resources = state.resources.filter(resource => resource.project_id != id);
    },

    // Interface

    // setSearchTerm(state, searchTerm) { state.searchTerm = searchTerm; },
    setUiFilter(state, filterData) { state.uiFilters[filterData.type][filterData.name] = filterData.value; },
    setUser(state, id) { state.userId = id; },
    // setLastMutationId(state, mutationId) { state.lastMutationId = mutationId; },
    updateRoute(state, route) { state.route = route; },
    // ready(state) { state.ready = true; }


    setPersons (state, data) { state.persons = data; },
    setProjects (state, data) { state.projects = data; },
    setUnresolvedMessages (state, data) { state.unresolvedMessages = data; },
    setTimesInPeriod (state, data) { state.timesInPeriod = data; },
    setPendingTimes (state, data) { state.pendingTimes = data; },
    setArchivedProjects (state, data) { state.archivedProjects = data; },

    setResourcesByProject (state, resources) { state.resourcesByProject = resources; },
    setTimesByProject (state, times) { state.timesByProject = times; },
    setMessagesByProject (state, messages) { state.messagesByProject = messages; },

    cleanResourcesByProject (state) { state.resourcesByProject = null; },
    cleanTimesByProject (state) { state.timesByProject = null; },
    cleanMessagesByProject (state) { state.messagesByProject = null; },

};

const actions = {

    // Object Mutation

    applyMutations (context, mutations) {
        // for (let mutation of mutations) {
        //     context.commit('mutateObject', mutation);
        // }
    },

    persistMutations (context, mutations) {
        // if (!mutations) { return; }
        // for (let mutation of mutations) {
        //     forager.mutateObject(mutation);
        // }
    },

    exportMutations (context, mutations) {
        // store.dispatch('applyMutations', mutations);
        // hpmAPI('mutate', [mutations, pusher.socketId]).then(response => {
        //     if ( response.integrity == store.state.lastMutationId) {
        //         store.dispatch('persistMutations', mutations);
        //         store.dispatch('setLastMutationId', response.mutation_id);
        //     } else {
        //         console.log('Out of sync. Last mutation should be ' + response.integrity[store.state.user.id] + ', but is ' + store.state.lastMutationId + '.', response);
        //         alert("Hmm... looks like you're out of sync. Refresh to make sure you have the latest.");
        //     }
        // }, response => {
        //     alert("Crap, got disconnected, and that didn't save. Make sure you're connected and refresh.");
        // });
    },

    importMutations (context, data) {
        // console.log(data.mutations.length + ' New Mutations Imported');
        // store.dispatch('applyMutations', data.mutations);
        // if ( !data.integrity || data.integrity[store.state.user.id] == store.state.lastMutationId) {
        //     store.dispatch('setLastMutationId', data.mutation_id);
        //     store.dispatch('persistMutations', data.mutations);
        // } else {
        //     console.log('Out of sync. Last mutation should be ' + data.integrity[store.state.user.id] + ', but is ' + store.state.lastMutationId + '.');
        //     alert("Hmm... looks like you're out of sync. Refresh to make sure you have the latest.");
        // }
    },

    setLastMutationId (context, mutationId) {
        // context.commit('setLastMutationId', mutationId);
        // forager.setLastMutationId(mutationId);
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
        data.messages && db.messages.bulkAdd(data.messages);
        data.packages && db.packages.bulkAdd(data.packages);
        data.persons && db.persons.bulkAdd(data.persons);
        data.projects && db.projects.bulkAdd(data.projects);
        data.resources && db.resources.bulkAdd(data.resources);
        data.times && db.times.bulkAdd(data.times);


    },

    loadAppState (context) {
        // load active persons
        let persons = {};
        db.persons.where('archived').equals(0).each((person) => { persons[person.id] = person; })
            .then(() => {
                context.commit('setPersons', persons);
            });

        // load active projects
        let projects = {};
        db.projects.where('archived').equals(0).each((project) => { projects[project.id] = project; })
            .then(() => {
                context.commit('setProjects', projects);
            });

        // unresolved messages for counting/flagging/etc.
        let unresolvedMessages = {};
        db.messages.where('resolved').equals(0).each((message) => { unresolvedMessages[message.id] = message; })
            .then(() => {
                context.commit('setUnresolvedMessages', unresolvedMessages);
            });

        context.dispatch('fetchTimesInPeriod');

        // pending times
        let pendingTimes = {};
        db.times.where('pending').equals(1).each((time) => { pendingTimes[time.id] = time; })
            .then(() => {
                context.commit('setPendingTimes', pendingTimes);
            });

        // archived projects
        let archivedProjects = {};
        db.projects.where('archived').equals(1).limit(20).each((project) => { archivedProjects[project.id] = project; })
            .then(() => {
                context.commit('setArchivedProjects', archivedProjects);
            });

        // db.persons.count((count) => {console.log(count); });
    },

    fetchResourcesByProject (context, id) {
        let resources = {};
        db.resources.where('project_id').equals(id).each((resource) => { resources[resource.id] = resource; })
            .then(() => {
                context.commit('setResourcesByProject', resources);
            });
    },
    cleanResourcesByProject (context) {
        context.commit('cleanResourcesByProject');
    },

    fetchTimesByProject (context, id) {
        let times = {};
        db.times.where('project_id').equals(id).each((time) => { times[time.id] = time; })
            .then(() => {
                context.commit('setTimesByProject', times);
            });
    },
    cleanTimesByProject (context) {
        context.commit('cleanTimesByProject');
    },

    fetchMessagesByProject (context, id) {
        let messages = {};
        db.messages.where('project_id').equals(id).each((message) => { messages[message.id] = message; })
            .then(() => {
                context.commit('setMessagesByProject', messages);
            });
    },
    cleanMessagesByProject (context) {
        context.commit('cleanMessagesByProject');
    },

    fetchTimesInPeriod (context ) {
        // times in current period
        let timesInPeriod = {};
        db.times.where('date').between(state.uiFilters.times.period.start, state.uiFilters.times.period.end).each((time) => { timesInPeriod[time.id] = time; })
            .then(() => {
                context.commit('setTimesInPeriod', timesInPeriod);
            });
    },

    // Interface

    // setSearchTerm (context, searchTerm) { context.commit('setSearchTerm', searchTerm); },
    setUiFilter (context, filterData) {
        context.commit('setUiFilter', filterData);

        // @TODO - robust
        if (filterData.type == 'times' && filterData.name == 'period') {
            store.dispatch('fetchTimesInPeriod');
        }
    },
    setUser (context, wpId) {
        db.persons.get({ wp_id: wpId }).then((userPrimitive) => {
            context.commit('setUser', userPrimitive.id);
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

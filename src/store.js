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

import forager from './forager.js';

const state = {
    messages:  [],
    packages:  [],
    persons: [],
    projects:  [],
    resources:  [],
    times:  [],
    //
    lookup: {},
    //
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
    lastMutationId: 0
};

const getters = {

    object: (state, getters) => (type, id) => state.lookup[type][id],

    // Messages
    message: (state, getters) => (id) => state.lookup['message'][id],
    messagesByProject: (state, getters) => (id) => state.messages.filter(message => message.project_id === id),
    messagesFromContractors: (state, getters) => state.messages.filter(message => message.author.role == 'contractor' && message.type != 'activity'),
    messagesFromManagers: (state, getters) => state.messages.filter(message => message.author.canManage && message.type != 'activity'),
    mutationMessagesForObject: (state, getters) => (id) => {
        return state.messages.filter(message => message.content.object_id === id);
    },

    // Packages
    mocaPackage: (state, getters) => (id) => state.lookup['package'][id],
    packagesByClient: (state, getters) => (id) => {
        return state.packages.filter(mocaPackage => mocaPackage.client_id === id);
    },

    // Persons
    clients: (state, getters) => state.persons.filter(person => person.role === 'client'),
    activeClients: (state, getters) => state.persons.filter(person => person.role === 'client' && !person.archived),
    expiredClients: (state, getters) => getters.activeClients.filter(client => client.expired),
    management: (state, getters) => getters.members.filter(person => person.canManage),
    contractors: (state, getters) => state.persons.filter(person => person.role === 'contractor'),
    members: (state, getters) => state.persons.filter(person => person.role !== 'client'),
    activeMembers: (state, getters) => state.persons.filter(person => person.role !== 'client' && !person.archived),
    personsByRoles: (state, getters) => (roles) => state.persons.filter(person => roles.includes(person.role)),
    person: (state, getters) => (id) => state.lookup['person'][id],

    // Projects
    project: (state, getters) => (id) => state.lookup['project'][id],
    projectsByContractor: (state, getters) => (id) => state.projects.filter(project => project.contractor_id === id),
    projectsByManager: (state, getters) => (id) => state.projects.filter(project => project.manager_id === id),
    projectsByClient: (state, getters) => (id) => state.projects.filter(project => project.client_id === id),
    projectsByStatus: (state, getters) => (status) => state.projects.filter(project => project.status === status),

    // Resources
    resource: (state, getters) => (id) => state.lookup['resource'][id],
    resourcesByProject: (state, getters) => (id) => state.resources.filter(resource => resource.project_id === id),
    resourcesByClient: (state, getters) => (id) => state.resources.filter(resource => resource.client_id === id),

    // Times
    time: (state, getters) => (id) => state.lookup['time'][id],
    times: (state, getters) => state.times.sort((a,b) => a.date < b.date || (a.date == b.date && a.cycle < b.cycle)),
    pendingTimes: (state, getters) => getters.times.filter(time => time.pending),
    timesInPeriod: (state, getters) => state.times.filter(time => time.date >= state.uiFilters.times.period.start && time.date <= state.uiFilters.times.period.end).sort((a,b) => a.date < b.date || (a.date == b.date && a.cycle < b.cycle)),
    logsByProject: (state, getters) => (id) => state.times.filter(time => time.project_id === id),
    timesByContractor: (state, getters) => (id) => state.times.filter(time => time.worker_id === id),
    timesByClient: (state, getters) => (id) => state.times.filter(time => time.client_id === id),
    creditForPackage: (state, getters) => (id) => state.times.find(time => time.package_id === id),

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
        for (let type of [
            'message',
            'package',
            'person',
            'project',
            'resource',
            'time'
        ]) {
            if (!data[type + 's']) { continue; }
            // let primitives = [...state[type + 's'], ...data[type + 's'].map(
            //     primitive => {
            //         state.lookup[type] = state.lookup[type] ? state.lookup[type] : {};
            //         state.lookup[type][primitive.id] = primitive;
            //         return MocaFactory.constructObject(type, primitive);
            //     }
            // )];
            for (var i = 0; i < data[type + 's'].length; i++) {
                let primitive = data[type + 's'][i];
                let mocaObject = MocaFactory.constructObject(type, primitive);
                state.lookup[type] = state.lookup[type] ? state.lookup[type] : {};
                state.lookup[type][primitive.id] = mocaObject;
                state[type + 's'].push(mocaObject);
            }
            // state[type + 's'] = primitives;
        }
    },

    loseProject (state, id) {
        state.messages = state.messages.filter(message => message.project_id != id);
        state.resources = state.resources.filter(resource => resource.project_id != id);
    },

    // Interface

    setSearchTerm(state, searchTerm) { state.searchTerm = searchTerm; },
    setUiFilter(state, filterData) { state.uiFilters[filterData.type][filterData.name] = filterData.value; },
    setUser(state, wpId) { state.user = state.persons.find(person => person.wp_id == wpId); },
    setLastMutationId(state, mutationId) { state.lastMutationId = mutationId; },
    updateRoute(state, route) { state.route = route; },
    ready(state) { state.ready = true; }

};

const actions = {

    // Object Mutation

    applyMutations (context, mutations) {
        for (let mutation of mutations) {
            context.commit('mutateObject', mutation);
        }
    },

    persistMutations (context, mutations) {
        if (!mutations) { return; }
        for (let mutation of mutations) {
            forager.mutateObject(mutation);
        }
    },

    exportMutations (context, mutations) {
        store.dispatch('applyMutations', mutations);
        hpmAPI('mutate', [mutations, pusher.socketId]).then(response => {
            if ( response.integrity == store.state.lastMutationId) {
                store.dispatch('persistMutations', mutations);
                store.dispatch('setLastMutationId', response.mutation_id);
            } else {
                console.log('Out of sync. Last mutation should be ' + response.integrity[store.state.user.id] + ', but is ' + store.state.lastMutationId + '.', response);
                alert("Hmm... looks like you're out of sync. Refresh to make sure you have the latest.");
            }
        }, response => {
            alert("Crap, got disconnected, and that didn't save. Make sure you're connected and refresh.");
        });
    },

    importMutations (context, data) {
        console.log(data.mutations.length + ' New Mutations Imported');
        store.dispatch('applyMutations', data.mutations);
        if ( !data.integrity || data.integrity[store.state.user.id] == store.state.lastMutationId) {
            store.dispatch('setLastMutationId', data.mutation_id);
            store.dispatch('persistMutations', data.mutations);
        } else {
            console.log('Out of sync. Last mutation should be ' + data.integrity[store.state.user.id] + ', but is ' + store.state.lastMutationId + '.');
            alert("Hmm... looks like you're out of sync. Refresh to make sure you have the latest.");
        }
    },

    setLastMutationId (context, mutationId) {
        context.commit('setLastMutationId', mutationId);
        forager.setLastMutationId(mutationId);
    },

    // Object Gain

    gainObject (context, object) {

        hpmAPI('object_dependents', [object.object_type, object.object_id]).then(data => {
            console.log('Gained Object Dependents', data);

            // Add to Local Store
            context.commit('importObjects', data);

            // Add to IndexedDB
            for (let type of [
                'message',
                'resource'
            ]) {
                for (let primitive of data[type + 's']) {
                    forager.setObject(type, primitive.id, primitive);
                }
            }

        });

    },

    loseObject (context, object) {

        // Only Support Projects for Now
        console.log('Losing Access to Project', object);

        // Remove from IndexedDB
        for (let type of [
            'message',
            'resource'
        ]) {
            for (let primitive of store.state[type + 's'].filter(dep => dep.project_id == object.object_id)) {
                forager.removeObject(type, primitive.id);
            }
        }

        // Remove from Local Store
        context.commit('loseProject', object.object_id);

    },

    // Static Objects

    importObjects (context, data) {

        console.log('Objects Imported:', data);

        // Add to Local Store
        context.commit('importObjects', data);

        // Add to IndexedDB
        for (let type of [
            'message',
            'package',
            'person',
            'project',
            'resource',
            'time'
        ]) {
            for (let primitive of data[type + 's']) {
                forager.setObject(type, primitive.id, primitive);
            }
        }

    },

    // Interface

    setSearchTerm (context, searchTerm) { context.commit('setSearchTerm', searchTerm); },
    setUiFilter (context, filterData) { context.commit('setUiFilter', filterData); },
    setUser (context, wpId) { context.commit('setUser', wpId); },
    updateRoute (context, route) { context.commit('updateRoute', route); },
    ready (context) { context.commit('ready'); }

};


export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    mutations
});

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


const state = {
    messages:  [],
    packages:  [],
    persons: [],
    projects:  [],
    resources:  [],
    times:  [],
    //
    searchTerm: '',
    route: { view: null, item: null },
    lastMutationId: 0
};

const getters = {

    object: (state, getters) => (type, id) => state[type + 's'].find(object => object.id === id),

    // Messages
    message: (state, getters) => (id) => state.messages.find(message => message.id === id),
    messagesByProject: (state, getters) => (id) => {
        return state.messages.filter(message => message.project_id === id);
    },
    messagesByParent: (state, getters) => (id) => {
        return state.messages.filter(message => message.parent_id === id);
    },

    // Packages
    packagesByClient: (state, getters) => (id) => {
        return state.packages.filter(mocaPackage => mocaPackage.client_id === id);
    },

    // Persons
    clients: (state, getters) => state.persons.filter(person => person.role === 'client'),
    management: (state, getters) => getters.members.filter(person => person.canManage),
    contractors: (state, getters) => state.persons.filter(person => person.role === 'contractor'),
    members: (state, getters) => state.persons.filter(person => person.role !== 'client'),
    personsByRoles: (state, getters) => (roles) => state.persons.filter(person => roles.includes(person.role)),
    person: (state, getters) => (id) => {
        return state.persons.find(person => person.id === id);
    },

    // Projects
    project: (state, getters) => (id) => state.projects.find(project => project.id === id),
    projectsByContractor: (state, getters) => (id) => state.projects.filter(project => project.contractor_id === id),
    projectsByManager: (state, getters) => (id) => state.projects.filter(project => project.manager_id === id),
    projectsByClient: (state, getters) => (id) => state.projects.filter(project => project.client_id === id),

    // Resources
    resourcesByProject: (state, getters) => (id) => state.resources.filter(resource => resource.project_id === id),

    // Times
    logsByProject: (state, getters) => (id) => state.times.filter(time => time.project_id === id && time.cycle === time.project.cycle),
    timesByContractor: (state, getters) => (id) => state.times.filter(time => time.worker_id === id),
    timesByClient: (state, getters) => (id) => state.times.filter(time => time.client_id === id),
    purchaseForPackage: (state, getters) => (id) => state.times.find(time => time.package_id === id)

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
            state[type + 's'] = data[type + 's'].map(
                primitive => MocaFactory.constructObject(type, primitive)
            );
        }
    },

    // Interface

    setSearchTerm(state, searchTerm) { state.searchTerm = searchTerm; },
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

    exportMutations (context, mutations) {
        store.dispatch('applyMutations', mutations);
        hpmAPI('mutate', [mutations, pusher.socketId]).then(response => {
            store.dispatch('setLastMutationId', response.last_mutation_id);
        });
    },

    importMutations (context, data) {
        store.dispatch('applyMutations', data.mutations);
        store.dispatch('setLastMutationId', data.last_mutation_id);
    },

    // Static Objects

    importObjects (context, data) {
        context.commit('importObjects', data);
    },

    // Interface

    setSearchTerm (context, searchTerm) { context.commit('setSearchTerm', searchTerm); },
    setUser (context, wpId) { context.commit('setUser', wpId); },
    setLastMutationId (context, mutationId) { context.commit('setLastMutationId', mutationId); },
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

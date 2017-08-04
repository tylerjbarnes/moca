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


const state = {
    messages:  [],
    packages:  [],
    persons: [],
    projects:  [],
    resources:  [],
    times:  [],
    //
    searchTerm: ''
};

const getters = {

    // Messages
    messagesByProject: (state, getters) => (id) => {
        return state.messages.filter(message => message.project_id === id);
    },

    // Packages
    packagesByClient: (state, getters) => (id) => {
        return state.packages.filter(mocaPackage => mocaPackage.client_id === id);
    },

    // Persons
    clients: (state, getters) => state.persons.filter(person => person.role === 'client'),
    members: (state, getters) => state.persons.filter(person => person.role !== 'client'),
    person: (state, getters) => (id) => {
        return state.persons.find(person => person.id === id);
    },

    // Projects
    project: (state, getters) => (id) => {
        return state.projects.find(project => project.id === id);
    },
    projectsByContractor: (state, getters) => (id) => {
        return state.projects.filter(project => project.contractor_id === id);
    },
    projectsByManager: (state, getters) => (id) => {
        return state.projects.filter(project => project.manager_id === id);
    },
    projectsByClient: (state, getters) => (id) => {
        return state.projects.filter(project => project.client_id === id);
    },

    // Times
    timesByContractor: (state, getters) => (id) => {
        return state.times.filter(time => time.worker_id === id);
    },
    timesByClient: (state, getters) => (id) => {
        return state.times.filter(time => time.client_id === id);
    },
    purchaseForPackage: (state, getters) => (id) => {
        return state.times.find(time => time.package_id === id);
    }

};

const mutations = {

    // Objects

    addObjects (state, args) { state[args.setName] = [...state[args.setName], ...args.objects]; },
    addObject (state, args) { state[args.setName].push(args.object); },
    updateObject (state, args) {
        let object = store.state[args.setName].find(object => object.id === args.primitive.id);
        object.update(args.primitive);
    },
    removeObject (state, args) { state[args.setName] = state[args.setName].filter(object => object.id !== args.id) },

    // Interface

    setSearchTerm(state, searchTerm) { state.searchTerm = searchTerm; },
    setUser(state, wpId) { state.user = state.persons.find(person => person.wp_id == wpId); }

};

const actions = {

    // Objects

    addObjects (context, args) {
        let objects = MocaFactory.constructObjects(args.type, args.primitives);
        context.commit('addObjects', {setName: args.type + 's', objects});
    },
    addObject (context, args) {
        let object = MocaFactory.constructObject(args.type, args.primitive);
        context.commit('addObject', object);
    },
    updateObject (context, args) { context.commit('updateObject', {setName: args.type + 's', primitive: args.primitive}) },
    removeObject (context, args) { context.commit('removeObject', {setName: args.type + 's', id: args.id}) },

    // Interface

    setSearchTerm (context, searchTerm) { context.commit('setSearchTerm', searchTerm); },
    setUser (context, wpId) { context.commit('setUser', wpId); }

};


export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    mutations
});

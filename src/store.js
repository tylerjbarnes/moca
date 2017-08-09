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
    route: { view: null, item: null }
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
    management: (state, getters) => getters.members.filter(person => person.canManage),
    contractors: (state, getters) => state.persons.filter(person => person.role === 'contractor'),
    members: (state, getters) => state.persons.filter(person => person.role !== 'client'),
    personsByRoles: (state, getters) => (roles) => state.persons.filter(person => roles.includes(person.role)),
    person: (state, getters) => (id) => {
        return state.persons.find(person => person.id === id);
    },

    // Projects
    project: (state, getters) => (id) => { return state.projects.find(project => project.id === id); },
    projectsByContractor: (state, getters) => (id) => { return state.projects.filter(project => project.contractor_id === id); },
    projectsByManager: (state, getters) => (id) => { return state.projects.filter(project => project.manager_id === id); },
    projectsByClient: (state, getters) => (id) => { return state.projects.filter(project => project.client_id === id); },

    // Times
    timesByContractor: (state, getters) => (id) => { return state.times.filter(time => time.worker_id === id); },
    timesByClient: (state, getters) => (id) => { return state.times.filter(time => time.client_id === id); },
    purchaseForPackage: (state, getters) => (id) => { return state.times.find(time => time.package_id === id); }

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
    setUser(state, wpId) { state.user = state.persons.find(person => person.wp_id == wpId); },
    updateRoute(state, route) { state.route = route; }

};

const actions = {

    // Object Pulling

    addObjects (context, args) {
        let objects = MocaFactory.constructObjects(args.type, args.primitives);
        context.commit('addObjects', {setName: args.type + 's', objects});
    },
    addObject (context, args) {
        let object = MocaFactory.constructObject(args.type, args.primitive);
        context.commit('addObject', {setName: args.type + 's', object});
    },
    updateObject (context, args) { context.commit('updateObject', {setName: args.type + 's', primitive: args.primitive}) },
    removeObject(context, args) { context.commit('removeObject', {setName: args.type + 's', id: args.id}) },

    // Object Pushing

    createObject (context, args) {
        store.dispatch('addObject', args);
        axios.post(ajaxurl, qs.stringify({ action: 'hpm_api', function: 'create_object',
            type: args.type,
            object_data: args.primitive,
            socket_id: pusher.socketId
        })).then((response) => { console.log(response); });
    },

    // Interface

    setSearchTerm (context, searchTerm) { context.commit('setSearchTerm', searchTerm); },
    setUser (context, wpId) { context.commit('setUser', wpId); },
    updateRoute (context, route) { context.commit('updateRoute', route); }

};


export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    mutations
});

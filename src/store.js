import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import Client from './objects/client.js';
import Member from './objects/member.js';
import Message from './objects/message.js';
import Package from './objects/package.js';
import Project from './objects/project.js';
import Resource from './objects/resource.js';
import Time from './objects/time.js';


const state = {
    clients:[],
    members: [],
    messages: [],
    packages: [],
    projects: [],
    resources: [],
    times: []
};

const getters = {

    // Clients & Members
    client: (state, getters) => (id) => {
        return state.clients.find(client => client.id === id);
    },
    member: (state, getters) => (id) => {
        return state.members.find(member => member.id === id);
    },

    // Messages
    messagesByProject: (state, getters) => (id) => {
        return state.messages.filter(message => message.project_id == id);
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

    // Times
    timesByContractor: (state, getters) => (id) => {
        return state.times.filter(time => time.worker_id == id);
    }

};

const mutations = {

    // Add Single
    addProject (state, project) {
        state.projects.push(project);
    },

    // Add Multiple
    addPersons (state, persons) {
        for (const person of persons) {
            if (person.role == 'client') {
                state.clients.push(person);
            } else {
                state.members.push(person);
            }
        }
    },
    addMessages (state, messages) {
        state.messages = [...state.messages, ...messages];
    },
    addPackages (state, packages) {
        state.packages = [...state.packages, ...packages];
    },
    addProjects (state, projects) {
        state.projects = [...state.projects, ...projects];
    },
    addResources (state, resources) {
        state.resources = [...state.resources, ...resources];
    },
    addTimes (state, times) {
        state.times = [...state.times, ...times];
    }

};

const actions = {

    // Add Single
    addProject (context, projectPrimitive) {
        let project = new Project(projectPrimitive);
        context.commit('addProject', project);
    },

    // Add Multiple
    addPersons (context, personPrimitives) {
        let persons = personPrimitives.map(personPrimitive => {
            return personPrimitive.role == 'client' ?
                new Client(personPrimitive) :
                new Member(personPrimitive);
        });
        context.commit('addPersons', persons);
    },
    addMessages (context, messagePrimitives) {
        let messages = messagePrimitives.map(messagePrimitive => new Message(messagePrimitive));
        context.commit('addMessages', messages);
    },
    addPackages (context, packagePrimitives) {
        let packages = packagePrimitives.map(packagePrimitive => new Package(packagePrimitive));
        context.commit('addPackages', packages);
    },
    addProjects (context, projectPrimitives) {
        let projects = projectPrimitives.map(projectPrimitive => new Project(projectPrimitive));
        context.commit('addProjects', projects);
    },
    addResources (context, resourcePrimitives) {
        let resources = resourcePrimitives.map(resourcePrimitive => new Resource(resourcePrimitive));
        context.commit('addResources', resources);
    },
    addTimes (context, timePrimitives) {
        let times = timePrimitives.map(timePrimitive => new Time(timePrimitive));
        context.commit('addTimes', times);
    }

};


export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    mutations
});

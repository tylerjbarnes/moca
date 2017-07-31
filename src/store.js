import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import Project from './objects/project.js';
import Client from './objects/client.js';
import Member from './objects/member.js';

const state = {
    messages: [],
    packages: [],
    members: [],
    clients:[],
    profile: null,
    projects: [],
    resources: [],
    times: []
};

const getters = {
    project: (state, getters) => (id) => {
        return state.projects.find(project => project.id === id);
    },
    client: (state, getters) => (id) => {
        return state.clients.find(client => client.id === id);
    },
    member: (state, getters) => (id) => {
        return state.members.find(member => member.id === id);
    },
    projectsByContractor: (state, getters) => (id) => {
        return state.projects.filter(project => project.contractor_id === id);
    }
};

const mutations = {
    addProject (state, project) {
        state.projects.push(project);
    },
    addProjects (state, projects) {
        state.projects = [...state.projects, ...projects];
    },
    addPersons (state, persons) {
        for (const person of persons) {
            if (person.role == 'client') {
                state.clients.push(person);
            } else {
                state.members.push(person);
            }
        }
    }
};

const actions = {
    addProject (context, projectPrimitive) {
        let project = new Project(projectPrimitive);
        context.commit('addProject', project);
    },
    addProjects (context, projectPrimitives) {
        let projects = projectPrimitives.map((projectPrimitive) => {
            return new Project(projectPrimitive);
        });
        context.commit('addProjects', projects);
    },
    addPersons (context, personPrimitives) {
        let persons = personPrimitives.map((personPrimitive) => {
            return personPrimitive.role == 'client' ?
                new Client(personPrimitive) :
                new Member(personPrimitive);
        });
        context.commit('addPersons', persons);
    }
};

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    mutations
});

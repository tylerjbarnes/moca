import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
    messages: [],
    packages: [],
    persons: [],
    profile: null,
    projects: [],
    resources: [],
    times: []
};

const getters = {
    members () {
        return _.filter(state.persons, function(o){
            let memberRoles = ['administrator', 'manager', 'contractor'];
            return memberRoles.includes(o.role);
        });
    }
};

const mutations = {
    addProjects (state, projects) {
        state.projects = [...state.projects, ...projects];
    },
    addPersons (state, persons) {
        state.persons = [...state.persons, ...persons];
    }
};

const actions = {
    addProjects (context, projects) {
        context.commit('addProjects', projects);
    },
    addPersons (context, persons) {
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

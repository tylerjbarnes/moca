import VueRouter from 'vue-router';
import TeamView from './components/TeamView.vue';
import ProjectCollection from './components/ProjectCollection.vue';

const routes = [
        {
            path: '/projects',
            name: 'projects',
            component: ProjectCollection,
            waitForData: true
        },
        {
            path: '/team',
            name: 'team',
            component: TeamView
        },
        {
            path: '/clients',
            name: 'clients',
            component: require('./components/ClientsView.vue')
        },
        {
            path: '/time',
            name: 'time',
            component: require('./components/TimeView.vue')
        },
        {
            path: '/team/new-project',
            name: 'team-new-project',
            components: {
                default: TeamView,
                modal: require('./components/ProjectEditor.vue')
            },
        },
        {
            path: '/clients/new-project',
            name: 'clients-new-project',
            components: {
                default: require('./components/ClientsView.vue'),
                modal: require('./components/ProjectEditor.vue')
            },
        },
        {
            path: '/team/:id',
            name: 'team-project',
            components: {
                default: TeamView,
                modal: require('./components/ProjectView.vue')
            },
            props: {
                default: false,
                modal: true
            }
        },
        {
            path: '/clients/:id',
            name: 'clients-project',
            components: {
                default: require('./components/ClientsView.vue'),
                modal: require('./components/ProjectView.vue')
            },
            props: {
                default: false,
                modal: true
            }
        }
];

const router = new VueRouter({
    routes,
    linkActiveClass: 'is-active',
    mode: 'history',
    base: '/dashboard/'
});

router.afterEach((hook) => {
    let components = hook.path.split('/').filter(comp => comp != '');
    store.dispatch('updateRoute', {
        view: components[0],
        itemId: components.length > 1 ? components[1] : null
    });
});

router.beforeEach((to, from, next) => {
    let view = store.state.route.view;
    if (view) { localStorage[view + "Scroll"] = document.body.scrollTop; }
    next();
});

window.router = router;
export default router;

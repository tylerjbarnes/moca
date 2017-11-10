import VueRouter from 'vue-router';
import TeamView from './components/TeamView.vue';
import ProjectsView from './components/ProjectsView.vue';
import ArchiveView from './components/ArchiveView.vue';
import Inbox from './components/Inbox.vue';

const routes = [
        {
            path: '/',
            name: 'inbox',
            component: Inbox
        },
        {
            path: '/projects',
            name: 'projects',
            component: ProjectsView,
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
            path: '/archive',
            name: 'archive',
            component: require('./components/ArchiveView.vue')
        },
        {
            path: '/profile',
            name: 'profile',
            component: require('./components/ProfileEditor.vue')
        },
        {
            path: '/team/new-project',
            name: 'team-new-project',
            components: {
                default: TeamView,
                modal: require('./components/ProjectEditor.vue')
            },
            props: {
                default: false,
                modal: true
            }
        },
        {
            path: '/clients/new-project',
            name: 'clients-new-project',
            components: {
                default: require('./components/ClientsView.vue'),
                modal: require('./components/ProjectEditor.vue')
            },
            props: {
                default: false,
                modal: true
            }
        },
        {
            path: '/team/project-editor/:id',
            name: 'team-project-editor',
            components: {
                default: TeamView,
                modal: require('./components/ProjectEditor.vue')
            },
            props: {
                default: false,
                modal: true
            }
        },
        {
            path: '/clients/project-editor/:id',
            name: 'clients-project-editor',
            components: {
                default: require('./components/ClientsView.vue'),
                modal: require('./components/ProjectEditor.vue')
            },
            props: {
                default: false,
                modal: true
            }
        },
        {
            path: '/projects/:id',
            name: 'projects-project',
            components: {
                default: ProjectsView,
                modal: require('./components/ProjectView.vue')
            },
            props: {
                default: false,
                modal: true
            }
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
        },
        {
            path: '/archive/:id',
            name: 'archive-project',
            components: {
                default: ArchiveView,
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

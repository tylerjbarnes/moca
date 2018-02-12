import ArchiveView from './components/ArchiveView.vue';
import ClientsView from './components/ClientsView.vue';
import Inbox from './components/Inbox.vue';
import ProfileEditor from './components/ProfileEditor.vue';
import ProjectCard from './components/ProjectCard.vue';
import ProjectEditor from './components/ProjectEditor.vue';
import ProjectsView from './components/ProjectsView.vue';
import ProjectView from './components/ProjectView.vue';
import TeamView from './components/TeamView.vue';
import TimeView from './components/TimeView.vue';
import VueRouter from 'vue-router';

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
            component: ClientsView
        },
        {
            path: '/time',
            name: 'time',
            component: TimeView
        },
        {
            path: '/archive',
            name: 'archive',
            component: ArchiveView
        },
        {
            path: '/profile',
            name: 'profile',
            component: ProfileEditor
        },
        {
            path: '/team/new-project',
            name: 'team-new-project',
            components: {
                default: TeamView,
                modal: ProjectEditor
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
                default: ClientsView,
                modal: ProjectEditor
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
                modal: ProjectEditor
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
                default: ClientsView,
                modal: ProjectEditor
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
                modal: ProjectView
            },
            props: {
                default: false,
                modal: true
            }
        },
        {
            path: '/inbox/:id',
            name: 'inbox-project',
            components: {
                default: Inbox,
                modal: ProjectView
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
                modal: ProjectView
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
                default: ClientsView,
                modal: ProjectView
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
                modal: ProjectView
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

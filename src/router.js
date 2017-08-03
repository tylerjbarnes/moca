import VueRouter from 'vue-router';

const routes = [
        {
            path: '/team',
            name: 'team',
            component: require('./components/TeamView.vue')
        },
        {
            path: '/clients',
            name: 'clients',
            component: require('./components/ClientsView.vue')
        },
        {
            path: '/team/:id',
            name: 'team-project',
            components: {
                default: require('./components/TeamView.vue'),
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

window.router = router;
export default router;

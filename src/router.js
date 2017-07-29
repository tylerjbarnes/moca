import VueRouter from 'vue-router';

const routes = [
        {
            path: '/team',
            component: require('./components/TeamView.vue')
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

export default {
    computed: {
        route () {
            return this.$store.getters.route;
        },
        user () {
            return this.$store.getters.user;
        },
    }
}

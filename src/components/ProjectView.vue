<template>

    <div class="project-view">
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">{{ project.name }}</p>
                    <button class="delete"></button>
                </header>
                <section class="modal-card-body">
                    <!-- Content ... -->
                </section>
                <footer class="modal-card-foot">
                    <a class="button is-success">Save changes</a>
                    <a class="button">Cancel</a>
                </footer>
            </div>
            <router-link tag="button" class="modal-close is-large" to="/team"></router-link>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'project-view',
        props: ['id'],
        computed: {
            project () {
                return this.$store.getters.project(this.id);
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';



</style>

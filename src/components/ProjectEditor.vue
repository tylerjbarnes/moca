<template>

    <div id="project-editor">
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-card">
                <header class="modal-card-head">
                    <p class="modal-card-title">New Project</p>
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
        name: 'project-editor'
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    #project-editor {

    }

</style>

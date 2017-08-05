<template>

    <div id="project-editor">
        <header class="modal-card-head">
            <div class="inner">
                <p class="modal-card-title">New Project</p>
                <router-link tag="button" :to="{name: $store.state.route.view}" class="delete"></router-link>
            </div>
        </header>
        <section class="modal-card-body">
            <span>{{ testVal }}</span>
            <hours-input v-model="testVal"></hours-input>
        </section>
        <footer class="modal-card-foot">
            <button class="button inverted" tabindex="-1">Cancel</button>
            <button class="button">Save</button>
        </footer>
    </div>

</template>


<script>
    import HoursInput from './inputs/HoursInput.vue';

    export default {
        name: 'project-editor',
        components: {HoursInput},
        data () {
            return {
                testVal: 0.25
            }
        }
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    #project-editor {

        .modal-card-head {
            background: white;
            border: none;
            border-radius: 3px 3px 0 0;
            padding: 0 40px;
            position: relative;

            .inner {
                border-bottom: 1px solid $shadow;
                padding: 40px 0;
                width: 100%;

                .modal-card-title {
                    font-size: 1.4em;
                    font-weight: 900;
                }

                .delete {
                    background-color: $shadow;
                    position: absolute;
                        top: 20px; right: 20px;
                }

            }

        }

        .modal-card-body {
            padding: 40px;

        }

        .modal-card-foot {
            background: $white-ter;
            border: none;
            border-radius: 0 0 3px 3px;
            justify-content: flex-end;
            padding: 20px 40px;
        }

    }

</style>

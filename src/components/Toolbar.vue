<template>
    <div id="toolbar">
        <template v-if="['team','clients','archive'].includes($store.state.route.view)">
            <ceri-icon size="16" name="fa-search" hcenter></ceri-icon>
            <input v-model="searchTerm" type="text" id="search" placeholder="Find a person, project, resource...">
            <div v-if="searchTerm.length" @click="searchTerm = '';" class="clear">
                <ceri-icon size="16" name="fa-times" hcenter></ceri-icon>
            </div>
        </template>
        <template v-if="['team','clients'].includes($store.state.route.view)">
            <div class="actions">
                <router-link tag="button" class="big primary button" :to="{name: this.$store.state.route.view + '-new-project'}">Create Project</router-link>
            </div>
        </template>
        <template v-if="$store.state.route.view == 'time'">
            <div class="actions">
                <button class="big primary button" @click="logTime">Log Time</button>
            </div>
        </template>
    </div>
</template>


<script>
    export default {
        name: 'toolbar',
        props: ['person'],
        data () {return {
            archive: false
        }},
        computed: {
            searchTerm: {
                get () {
                    return this.$store.state.searchTerm;
                },
                set (value) {
                    this.$store.commit('setSearchTerm', value);
                }
            }
        },
        methods: {
            logTime() {
                bus.$emit('logTime');
            }
        },
        watch: {
            archive: (val) => {
                bus.$emit('toolbar-archive', val);
            }
        }
    }
</script>


<style lang="scss">
    @import '~styles/settings.scss';

    #toolbar {
        background: white;
        border-bottom: 1px solid $gray;
        display: flex;
        height: $header-size;
        padding: 0 40px;
        position: fixed;
            top: 0; right: 0; left: $header-size;
        z-index: 3;

        ceri-icon {
            opacity: 0.25;
            padding-right: 10px;

        }

        .clear {
            width: $header-size; height: $header-size;
            display: flex;
            justify-content: center;
            // margin-right: $header-size * -0.5;

            &:hover {

                ceri-icon {
                    opacity: 0.5;

                }

            }

        }

        input#search {
            border: none;
            font-size: 1em;
            flex: 1 1;
            outline: none;
            opacity: 0.5;

            &:focus {
                opacity: 1;
                &::placeholder {
                    opacity: 0;
                }
            }

        }

        .actions {
            align-content: center;
            display: flex;
            flex: 0 1;
            flex-flow: row;
            justify-content: flex-end;

        }

    }

</style>

<template>
    <div id="toolbar">
        <ceri-icon size="16" name="fa-search" hcenter></ceri-icon>
        <input v-model="searchTerm" type="text" id="search" placeholder="Find a person, project, resource...">
        <div v-if="searchTerm.length" @click="searchTerm = '';" class="clear">
            <ceri-icon size="16" name="fa-times" hcenter></ceri-icon>
        </div>
        <div class="actions">
            <router-link tag="button" class="button" :to="{name: this.$store.state.route.view + '-new-project'}">+ New Project</router-link>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'toolbar',
        props: ['person'],
        computed: {
            searchTerm: {
                get () {
                    return this.$store.state.searchTerm;
                },
                set (value) {
                    this.$store.commit('setSearchTerm', value);
                }
            }
        }
    }
</script>


<style lang="scss">
    @import '../theme.scss';

    #toolbar {
        background: white;
        border-bottom: 1px solid $shadow;
        display: flex;
        height: $headerWidth;
        padding: 0 40px;
        position: fixed;
            top: 0; right: 0; left: $headerWidth;
        z-index: 1;

        ceri-icon {
            opacity: 0.25;
            padding-right: 10px;

        }

        .clear {
            width: $headerWidth; height: $headerWidth;
            display: flex;
            justify-content: center;
            // margin-right: $headerWidth * -0.5;

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
            flex: 0 0 200px;
            flex-flow: row;
            justify-content: flex-end;

            button {
                align-self: center;
                background-color: $green;
                border: none;
                color: white;
                font-size: 0.9em;
                font-weight: 900;
                height: 30px;
                padding: 0 15px;
                @include lifts;

            }

        }

    }

</style>

<template>
    <div id="toolbar">
        <ceri-icon size="16" name="fa-search" hcenter></ceri-icon>
        <input v-model="searchTerm" type="text" id="search" placeholder="Find a person, project, resource...">
        <div v-if="searchTerm.length" @click="searchTerm = '';" class="clear">
            <ceri-icon size="16" name="fa-times" hcenter></ceri-icon>
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
        padding: 0 40px;
        width: 100%; height: $headerWidth;

        ceri-icon {
            opacity: 0.25;
            padding-right: 10px;

        }

        .clear {
            width: $headerWidth; height: $headerWidth;
            display: flex;
            justify-content: center;
            margin-right: $headerWidth * -0.5;

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

    }

</style>

<template>

    <div class="files-view">
        <template v-if="loaded">
            <a v-for="file in files" class="file" :href="file.url" target="_blank">{{ file.name }}</a>
            <span class="empty" v-if="loading">Loading Files</span>
            <span class="empty" v-if="!loading && files && !files.length">No Files</span>
            <input :id="'file-' + client.id" @change="upload" type="file" ref="input">
            <label v-if="!loading" :for="'file-' + client.id">Add a File</label>
        </template>
        <button v-else @click="loadFiles" class="button">Show Files</button>
    </div>

</template>


<script>
    // import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'files-view',
        props: ['client'],
        data() { return {
            files: null,
            loading: false,
            loaded: false
        }},
        components: {},
        computed: {
        },
        methods: {
            upload () {

                this.loading = true;
                this.$refs.input.files = null;

                var files = this.$refs.input.files;
                var data = new FormData();
                var self = this;

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    data.append('action', 'hpm_api');
                    data.append('functionName', 'upload_file');
                    data.append('file', file);
                    data.append('args', JSON.stringify({
                        folder: self.client.name,
                        socket_id: null
                    }));

                    $.ajax({
                        type: 'POST',
                        url: ajaxurl,
                        data: data,
                        contentType: false,
                        processData: false,
                        success: function(response){
                            self.loadFiles();
                        }
                    });

                }

            },
            loadFiles () {
                this.loaded = true;
                this.loading = true;
                hpmAPI('list_files', this.client.name).then(data => { this.files = data; this.loading = false; });
            }
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .files-view {
        align-items: flex-start;
        display: flex;
        flex-flow: column;
        margin-top: 10px;

        > button {
            align-self: flex-start;
        }

        span.empty {
            color: $medium;
            display: block;

        }

        .file {
            border-radius: 15px;
            color: $dark;
            font-weight: 700;
            height: 30px;
            line-height: 30px;
            white-space: nowrap;

            &:hover {
                text-decoration: underline;
            }
        }

        input {
            visibility: hidden;
        }
        input + label {
            background: $primary;
            border-radius: 3px;
            color: white;
            cursor: pointer;
            display: block;
            font-size: 0.8em;
            font-weight: 900;
            padding: 5px 10px;
            text-transform: uppercase;
            @include lifts;
        }

        input:focus + label,
        input + label:hover {

        }

    }

</style>

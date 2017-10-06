<template>

    <div class="resource-view">
        <header :style="{backgroundImage: gradientString}">
            <span class="name" v-show="!editingName" @dblclick="startEditingName">{{ resource.name }}</span>
            <input type="text" class="nameEditor" v-show="editingName" ref="nameEditor" v-model="modifiedName" @blur="stopEditingName">
            <span class="delete" @click="deleteResource"></span>
        </header>
        <div class="main">
            <div class="markup" v-html="markup" v-show="!editingContent" @dblclick="startEditingContent"></div>
            <div class="editor-wrapper" ref="dynamicHeight" :class="{open:editingContent}">
                <textarea class="editor" ref="contentEditor" @input="resizeTextarea($event.target.value)" v-model="modifiedBody" @blur="stopEditingContent"></textarea>
                <div class="clone" ref="clone"></div>
            </div>
            <div class="meta">
                created by <strong>{{ resource.author.firstName }}</strong>
                <template v-if="resource.lastEditor"> • edited by <strong>{{ resource.lastEditor.firstName }}</strong></template> {{ resource.datetime | time }} ago
            </div>
        </div>
    </div>

</template>


<script>

    import MocaMutationSet from '../objects/mocaMutationSet.js';

    export default {
        name: 'resource-view',
        props: ['resource'],
        data () { return {
            modifiedBody: this.resource.content.body,
            modifiedName: this.resource.name,
            editingContent: false,
            editingName: false
        }},
        computed: {
            markup () {
                return markdown(this.resource.content.body);
            },
            gradientString () {
                return 'linear-gradient(20deg,' +
                this.resource.project.manager.color + ' 20%,' +
                (this.resource.project.contractor ?
                    this.resource.project.contractor.color :
                    this.resource.project.manager.lightColor)
                    + ' 100%)'
            }
        },
        methods: {
            resizeTextarea (value) {
                let me = this;
                setTimeout(function () {
                    me.$refs.clone.innerHTML = value + ' ';
                    let newHeight = me.$refs.clone.clientHeight;
                    me.$refs.dynamicHeight.style.height = newHeight + 'px';
                }, 0);
            },
            startEditingContent () {
                this.modifiedBody = this.resource.content.body;
                this.resizeTextarea(this.modifiedBody);
                this.editingContent = true;
                let me = this;
                setTimeout(function () { me.$refs.contentEditor.focus(); }, 0);
            },
            stopEditingContent () {
                this.editingContent = false
                if (this.resource.content.body != this.modifiedBody) { this.save(); }
            },
            startEditingName () {
                this.modifiedName = this.resource.name;
                this.editingName = true;
                let me = this; setTimeout(function () { me.$refs.nameEditor.focus(); }, 0);
            },
            stopEditingName () {
                this.editingName = false
                if (this.resource.name != this.modifiedName) { this.save(); }
            },
            save () {
                new MocaMutationSet(
                    'update',
                    'resource',
                    this.resource.id,
                    {
                        datetime: new moment().utc().format('YYYY-MM-DD HH:mm:ss'),
                        last_editor_id: store.state.user.id,
                        name: this.modifiedName,
                        content: {
                            body: this.modifiedBody
                        }
                    }
                ).commit();
            },
            deleteResource () {
                if (confirm("Are you sure you want to delete this resource?")) {
                    new MocaMutationSet(
                        'delete',
                        'resource',
                        this.resource.id
                    ).commit();
                }
            },
        },
        mounted () {
            this.resizeTextarea(this.resource.content.body);
        }
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .resource-view {
        background: white;
        border-radius: 10px;
        box-shadow: 0px 7.5px 25px 0px darken($light,5%);
        overflow: hidden;
        margin-top: 20px;

        header {
            align-items: center;
            color: white;
            display: flex;
            justify-content: space-between;
            padding: 10px 20px;

            &:hover {
                .delete {
                    opacity: 1;
                }
            }

            .name {
                font-size: 1.2em;
                font-weight: 900;
            }

            .nameEditor {
                background: none;
                border: none;
                color: white;
                font: inherit !important;
                font-size: 1.2em !important;
                font-weight: 900 !important;
                outline: none;
                padding: 0;
            }

            .delete {
                opacity: 0;
                transition: 0.2s ease;
            }

        }

        .main {
            padding: 20px 20px 10px 20px;
            position: relative;

            .markup {
                z-index: 2;
                @include markup;
            }

            .editor-wrapper {
                height: 100%;
                position: absolute;
                visibility: hidden;
                &.open {
                    position: relative;
                    visibility: visible;
                }

                .editor {
                    border: none;
                    display: block;
                    font: inherit !important;
                    height: 100%;
                    outline: none;
                    resize: none;
                    width: 100% !important;
                }

                .clone {
                    background: white;
                    color: black;
                    height: auto;
                    position: absolute;
                    width: 100%;
                    visibility: hidden;
                    white-space: pre-wrap;
                }

            }

            .meta {
                border-top: 1px solid $light;
                font-size: 0.8em;
                text-align: right;
                padding-top: 10px;
                margin-top: 20px;
                opacity: 0.5;

            }

        }

    }

</style>

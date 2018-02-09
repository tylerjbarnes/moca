<template>

    <div class="resource-view">
        <header :style="{backgroundImage: gradientString}" @dblclick="edit(null, true)">
            <span class="name" ref="nameEditor" v-show="!editing">{{ resource.name }}</span>
            <input type="text" v-show="editing" class="nameEditor" ref="nameEditor" v-model="primitive.name" placeholder="Resource Name">
            <span class="delete" @click="deleteResource" v-if="!isDraft && user.canManage"></span>
        </header>
        <div class="main" @dblclick="edit">
            <div class="markup" v-html="markup" v-show="!editing"></div>
            <div class="editor-wrapper" ref="dynamicHeight" :class="{open: editing}">
                <textarea class="editor" ref="contentEditor" @input="resizeTextarea($event.target.value)" v-model="primitive.content.body"></textarea>
                <div class="clone" ref="clone"></div>
            </div>
            <div class="meta" v-if="!editing">
                created by <strong>{{ resource.author.firstName }}</strong>
                <template v-if="resource.lastEditor"> • edited by <strong>{{ resource.lastEditor.firstName }}</strong></template> {{ resource.datetime | time }} ago
            </div>
            <div class="actions" v-else>
                <button class="button" @click="closeEditor">Cancel</button>
                <button class="button primary" :disabled="!valid" @click="save">Save</button>
            </div>
        </div>
    </div>

</template>


<script>

    import MocaMutationSet from '../objects/mocaMutationSet.js';
    import MocaFactory from '../objects/mocaFactory.js';

    export default {
        name: 'resource-view',
        props: ['resource', 'isDraft'],
        data () { return {
            editing: false,
            primitive: {
                name: '',
                content: {
                    body: ''
                }
            }
        }},
        computed: {
            markup () {
                return markdown(this.resource.content.body);
            },
            valid () {
                let updated = this.resource && (
                    this.primitive.content.body != this.resource.content.body ||
                    this.primitive.name != this.resource.name
                );
                return this.primitive.name && this.primitive.content.body &&
                    (this.isDraft || updated);
            },
            gradientString () {
                if (!this.resource.project) {
                    return 'linear-gradient(20deg, #333 20%, #777 100%';
                }
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
                    me.$refs.clone.innerHTML = _.escape(value) + ' ';
                    let newHeight = me.$refs.clone.clientHeight;
                    me.$refs.dynamicHeight.style.height = newHeight + 'px';
                }, 0);
            },
            setPrimitiveFromResource () {
                // Clone Deep
                Object.assign(this.primitive, this.resource);
                this.primitive.content = {body: this.resource.content.body};
            },
            edit (e, focusName) {
                let focusRef = focusName !== undefined ? this.$refs.nameEditor : this.$refs.contentEditor;
                setTimeout(function () { focusRef.focus(); }, 0);
                if (this.editing) { return; }
                this.setPrimitiveFromResource();
                this.resizeTextarea(this.primitive.content.body);
                this.editing = true;
            },
            closeEditor () {
                if (this.isDraft) {
                    this.$emit('closeDraft');
                } else {
                    this.editing = false;
                }
            },
            save () {
                this.primitive.datetime = new moment().utc().format('YYYY-MM-DD HH:mm:ss');
                if (!this.isDraft) {
                    this.primitive.last_editor_id = store.getters.user.id;
                    new MocaMutationSet(
                        'update', 'resource',
                        this.primitive.id, this.primitive
                    ).commit();
                    this.closeEditor();
                } else {
                    new MocaMutationSet(
                        'create', 'resource',
                        this.primitive.id, this.primitive
                    ).commit();
                    this.$emit('closeDraft');
                }
            },
            deleteResource () {
                if (confirm("Are you sure you want to delete this resource?")) {
                    new MocaMutationSet('delete', 'resource', this.resource.id).commit();
                }
            },
        },
        mounted () {
            this.isDraft ? this.edit(null, true) : this.setPrimitiveFromResource();
        },
        created () {
            this.resizeTextarea(this.primitive.content.body);
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

                &::placeholder {
                    color: white;
                    opacity: 0.5;
                }

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

            .actions {
                border-top: 1px solid $light;
                display: flex;
                justify-content: flex-end;
                padding-top: 10px;
                margin-top: 20px;

                .button:last-of-type {
                    margin-left: 10px;
                }

            }

        }

    }

</style>

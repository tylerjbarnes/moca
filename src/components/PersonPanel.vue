<template>

    <div class="person-panel card">
        <div class="card-content">
            <header>
                <img :src="person.avatar" class="avatar">
                <div class="titles">
                    <p class="title">{{ person.name }}</p>
                    <p class="subtitle">{{ subtitle }}</p>
                </div>
                <time-bar :person="person"></time-bar>
            </header>
            <template v-if="person.projectsAssigned && person.projectsAssigned.length">
                <h2 class="collection-title" v-if="person.canManage">Assigned</h2>
                <project-collection :projects="person.projectsAssigned"></project-collection>
            </template>
            <template v-if="person.projectsManaged && person.projectsManaged.length">
                <h2 class="collection-title">Managing</h2>
                <project-collection :projects="person.projectsManaged"></project-collection>
            </template>
            <template v-if="person.projectsOwned">
                <project-collection :projects="person.projectsOwned"></project-collection>
            </template>
        </div>
    </div>

</template>


<script>
    import ProjectCollection from '../components/ProjectCollection.vue';
    import TimeBar from '../components/TimeBar.vue';

    export default {
        name: 'person-panel',
        props: ['person'],
        computed: {
            subtitle () {
                return this.person.role == 'client' ?
                    this.person.expirationDescription :
                    capitalizeFirstLetter(this.person.role);
            }
        },
        components: {ProjectCollection, TimeBar}
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .person-panel {
        border-radius: 5px;
        box-shadow: 0px 0px 15px 0px $shadow;
        margin: 20px;

        .card-content {

            & > header {
                align-items: center;
                border-bottom: 1px solid $white-ter;
                display: flex;
                margin-bottom: 20px;
                padding-bottom: 20px;

                img.avatar {
                    border-radius: 25px;
                    flex: 0 0 50px;
                    height: 50px;
                    margin-right: 10px;

                }

                .titles {
                    flex: 0 0 180px;

                    p.title {
                        font-size: 1.2em;
                        font-weight: 900;

                    }
                    p.subtitle {
                        font-size: 0.9em;
                        padding-top: 3px;
                        opacity: 0.9;

                    }

                }

            } // header

            .collection-title {
                font-weight: 700;
                margin-bottom: 10px;
            }

        }

    }

</style>
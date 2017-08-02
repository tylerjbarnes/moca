<template>

    <div class="member-glance card">
        <div class="card-content">
            <header>
                <img :src="member.avatar" class="avatar">
                <div class="titles">
                    <p class="title">{{ member.name }}</p>
                    <p class="subtitle">{{ member.role | capitalize }}</p>
                </div>
                <time-bar :person="member"></time-bar>
            </header>
            <template v-if="member.projectsAssigned.length">
                <h2 class="collection-title" v-if="member.canManage">Assigned</h2>
                <project-collection :projects="member.projectsAssigned"></project-collection>
            </template>
            <template v-if="member.projectsManaged.length">
                <h2 class="collection-title">Managing</h2>
                <project-collection :projects="member.projectsManaged"></project-collection>
            </template>
        </div>
    </div>

</template>


<script>
    import ProjectCollection from './ProjectCollection.vue';
    import TimeBar from './TimeBar.vue';

    export default {
        name: 'member-glance',
        props: ['member'],
        components: {ProjectCollection, TimeBar}
    }

</script>


<style lang="scss">
    @import '../theme.scss';

    .member-glance {
        border-radius: 5px;
        box-shadow: 0px 0px 15px 0px $shadow;
        margin: 30px 20px;

        .card-content {

            & > header {
                align-items: center;
                border-bottom: 1px solid $white-ter;
                display: flex;
                margin-bottom: 20px;
                padding-bottom: 20px;

                img.avatar {
                    border-radius: 25px;
                    margin-right: 10px;
                    width: 50px; height: 50px;

                }

                .titles {
                    float: left;

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

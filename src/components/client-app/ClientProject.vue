<template>

    <div class="client-project" :class="{complete: project.complete}">
        <div class="titles">
            <span class="name">{{ project.name }}</span>
            <span class="date">{{ project.start | date(true) }}</span>
        </div>
        <span class="hours">{{ project.spent | hours }} Hours Spent</span>
        <div class="status">
            <ceri-icon v-if="project.complete" name="fa-check-circle" size="20" h-center></ceri-icon>
            <span>{{ project.complete ? 'Complete' : 'Active' }}</span>
        </div>
    </div>

</template>


<script>

    export default {
        name: 'client-project',
        props: ['project']
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .client-project {
        align-items: center;
        background: white;
        display: flex;
        font-size: 0.9em;
        padding: 20px;

        &:not(:last-of-type) {
            border-bottom: 1px solid $light;

        }

        .titles {
            display: flex;
            flex-flow: column;
            min-width: 150px;
            padding-right: 10px;

            span.name {
                font-size: 1.1em;
                font-weight: 700;

            }

        }

        span.hours {
            background: $light;
            border-radius: 15px;
            font-size: 0.9em;
            font-weight: 700;
            height: 30px;
            line-height: 30px;
            padding: 0 15px;
            white-space: nowrap;

        }

        .status {
            align-items: center;
            display: flex;
            flex: 1;
            justify-content: flex-end;
            padding-left: 10px;

            span {
                color: $medium-dark;
                font-weight: 700;
                padding-left: 5px;

            }

        }
        &.complete .status {
            color: $primary;
            span { color: $primary; }
        }


    }

</style>

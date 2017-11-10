<template>

    <div class="person-tag" :class="{solid:solid}" :style="{
        backgroundColor: !solid ? '' : person.lightColor,
        borderColor: solid ? 'transparent' : person.color,
        color: solid ? person.darkColor : person.color
    }">
        {{ person.firstName }}
        <transition name="scale">
            <div class="online-dot" v-if="person.online"></div>
        </transition>
    </div>

</template>


<script>

    export default {
        name: 'person-tag',
        props: ['person','solid']
    }

</script>


<style lang="scss">
    @import '~styles/settings.scss';

    .person-tag {
        border: 1px solid white;
        border-radius: 2px;
        box-sizing: border-box;
        display: inline-block;
        font-size: 0.9em;
        font-weight: 700;
        margin-right: 2px;
        padding: 4px 8px;
        position: relative;

        &.solid {
            font-weight: 700;

        }

        .online-dot {
            background: $green;
            border: 3px solid white;
            border-radius: 7px;
            position: absolute;
                bottom: -7px; right: -7px;
            width: 14px; height: 14px;
        }
        .scale-enter-active, .scale-leave-active {
            transition: transform 0.4s ease;
        }
        .scale-enter, .scale-leave-to {
            transform: scale(0);
        }

    }

</style>

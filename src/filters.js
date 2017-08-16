import Vue from 'vue';
import showdown from 'showdown';

Vue.filter('capitalize', (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
});

Vue.filter('formatHours', (value) => {
    return value.toFixed(2);
});

window.markdown = (value) => {
    let converter = new showdown.Converter();
    return converter.makeHtml(value);
};

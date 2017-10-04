import Vue from 'vue';
import showdown from 'showdown';

Vue.filter('capitalize', (value) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
});

Vue.filter('hours', (value) => {
    return value.toFixed(2);
});

Vue.filter('date', (value) => {
    return new moment(value).format('MMM D');
});

Vue.filter('time', (value) => {
    return new moment.utc(value).fromNow(true);
});

// Vue.filter('dateRange', (value) => {
//     var hasNone = !this.value[0] && !this.value[1];
//     var hasBoth = this.value[0] && this.value[1];
//     var onlyDate = hasNone || hasBoth ? null : ( this.value[0] ? this.value[0] : this.value[1] );
//
//     if (hasNone) {
//         return "Never";
//     } else if (hasBoth) {
//         if ( moment(value[0]).format("MMM") == moment(value[1]).format("MMM") ) {
//             return moment(value[0]).format("MMM D") + "-" + moment(value[1]).format("D");
//         } else {
//             return moment(value[0]).format("MMM D") + " - " + moment(value[1]).format("MMM D");
//         }
//     } else {
//         return moment(onlyDate).format("MMM D") + ( value[0] ? " • Soft" : "" );
//     }
// });

window.markdown = (value) => {
    let converter = new showdown.Converter({simplifiedAutoLink: true, openLinksInNewWindow: true});
    return converter.makeHtml(value);
};

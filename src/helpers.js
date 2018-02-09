window.capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

window.closestDropZone = (element) => {
    if (element.classList.contains('dropzone')) return element;
    return element.parentNode && element.parentNode.classList ? closestDropZone(element.parentNode) : null;
};

window.dropzonesForElement = (element) => {
    if (!element || !element.classList) return [];
    let dropzones = [];
    if (element.classList.contains('dropzone')) { dropzones.push(element) };
    let iterationElement = element;
    while (iterationElement.parentNode && iterationElement.parentNode.classList) {
        if (iterationElement.parentNode.classList.contains('dropzone')) { dropzones.push(iterationElement.parentNode) };
        iterationElement = iterationElement.parentNode;
    }
    return dropzones;
}

import axios from 'axios';
import qs from 'qs';
window.hpmAPI = (functionName, args) => {
    return new Promise(function(resolve, reject) {
        axios.post(ajaxurl, qs.stringify({
            action: 'hpm_api',
            functionName,
            args: JSON.stringify(args)
        })).then(
            ({data}) => { resolve(data); },
            ({data}) => { reject(data); });
    });
}
window.mocaClientAPI = (functionName, args) => {
    return new Promise(function(resolve, reject) {
        axios.post(ajaxurl, qs.stringify({
            action: 'moca_client_api',
            functionName,
            args: JSON.stringify(args)
        })).then(
            ({data}) => { resolve(data); },
            ({data}) => { reject(data); });
    });
}

// https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
window.offset = (el) => {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

// https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
window.debounce = (func, wait, immediate) => {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

window.booleanToBinary = (val) => {
    if (val === true) return 1;
    if (val === false) return 0;
    return val;
}

window.typifyForIdb = (val) => {
    if (val === null) return val;
    if (typeof(val) === 'object') {
        var typified = {};
        for (let key in val) {
            typified[key] = booleanToBinary(val[key]);
        }
        return typified;
    } else {
        return booleanToBinary(val);
    }
}

window.messageIsResolvable = (messagePrimitive) => {
    if (messagePrimitive.resolved) return false;
    let author = store.getters.person(messagePrimitive.author_id);
    if (!author) return false; // @TODO - only needed for bad data
    return store.getters.user.role == 'contractor' ?
        author.role != 'contractor' :
        author.role == 'contractor';
}

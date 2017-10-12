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

// https://plainjs.com/javascript/styles/get-the-position-of-an-element-relative-to-the-document-24/
window.offset = (el) => {
    var rect = el.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}

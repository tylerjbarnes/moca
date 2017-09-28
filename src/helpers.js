window.capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

window.closestDropZone = (element) => {
    if (element.classList.contains('dropzone')) return element;
    return element.parentNode && element.parentNode.classList ? closestDropZone(element.parentNode) : null;
};

import axios from 'axios';
import qs from 'qs';
window.hpmAPI = (functionName, args) => {
    return new Promise(function(resolve, reject) {
        axios.post(ajaxurl, qs.stringify({
            action: 'hpm_api',
            functionName,
            args: JSON.stringify(args)
        })).then(({data}) => { resolve(data); });
    });
}

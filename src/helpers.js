window.capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

window.closestDropZone = (element) => {
    if (element.classList.contains('dropzone')) return element;
    return element.parentNode && element.parentNode.classList ? closestDropZone(element.parentNode) : null;
}

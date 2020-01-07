// "DOM" as in the browser's "document object model."  This module provides
// some shorthands for operations on the DOM.

define('graphics/dom', function () {

function $(id) {
    return document.getElementById(id);
}

function $class(name) {
    return Array.from(document.getElementsByClassName(name));
}

return {$, $class};

});
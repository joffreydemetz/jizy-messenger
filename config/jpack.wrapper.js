/*! jMessenger v@VERSION | @DATE | [@BUNDLE] */
(function (global) {
    "use strict";

    if (typeof global !== "object" || !global || !global.document) {
        throw new Error("jMessenger requires a window and a document");
    }

    if (typeof global.jMessenger !== "undefined") {
        throw new Error("jMessenger is already defined");
    }

    // @CODE 

    global.jMessenger = jMessenger;

})(typeof window !== "undefined" ? window : this);
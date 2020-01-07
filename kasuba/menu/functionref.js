// A `FunctionRef` is a level of indirection for a function.  It's an object
// whose inner "implementation" function can be set using the `.install` method
// and can be called using the `.invoke` method.  `this` is not used, so the
// `.invoke` method itself is a function that references the "implementation"
// via closure.  For example:
//
//     const newLevel = FunctionRef();
//
//     return {
//         initialize: newLevel.install,
//         newLevel:   newLevel.invoke
//     };
//
// `FunctionRef` is used by menu pages that need to expose in their interface
// functionality that's not available until `setup` is called.  `FunctionRef`
// encapsulates the pattern of having a level of indirection into which an
// implementation can be later injected.
//
define('menu/functionref', function () {

function FunctionRef() {
    let implementation;

    function invoke(...args) {
        return implementation(...args);
    }

    function install (newImplementation) {
        implementation = newImplementation;
    }

    return {invoke, install};
}

return FunctionRef;

});

// This module is a callback registrar for keyboard events.  Any code running
// in the browser environment can add a listener for keyboard events, but I'd
// like to ensure that in Kasuba a particular key does only one thing.  So,
// this module is the sole keyboard event listener, and will register at most
// one handler for each key.
// Other modules can then depend upon this one and call its `on` function to
// register a callback for one or more keys. The keys are identified by their
// `KeyboardEvent.code` values (see 
// https://developer.mozilla.org/docs/Web/API/KeyboardEvent/code/code_values).
// Be sure to use only those keys whose codes are the same across platforms.
// As of this writing, Kasuba will use the following keys:
//
// - 'Digit1' to 'Digit9': `DigitPicker` will use these to select a digit.
// - 'Backspace': `DigitPicker` will use this to blank out the selected digit.
// - 'Escape': `Cube` will use this to unselect the selected cell.
// - 'ArrowLeft', 'ArrowRight', 'ArrowDown', and 'ArrowUp': `Cube` will use
//   these to flip the cube.
define('keyboard', function () {

const registry = {};  // KeyboardEvent.code -> Function

document.addEventListener('keydown', function (event) {
    const code = event.code,
          callback = registry[code];

    if (callback !== undefined) {
        callback(code);
    }
});

// Register the specified `callback` to be called when there is a "keydown"
// event involving one of the specified keyboard `codes`, where `codes` is
// either an array of `KeyboardEvent.code` strings or a single code name
// string.  Throw an exception if any of `codes` is invalid or has already been
// registered.
function on(codes, callback) {
    if (!Array.isArray(codes)) {
        codes = [codes];
    }

    codes.forEach(code => {
        if (code in registry) {
            throw Error(`there's already a callback registered for keyboard ` +
                        `key ${code}`);
        }

        registry[code] = callback;
    });
}

return {on};

});
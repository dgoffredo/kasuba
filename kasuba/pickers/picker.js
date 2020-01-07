define('pickers/picker', ['contracts'], function ({requireArguments}) {

function Picker({
    magnification = 1.3,
    selectedAlpha = 1,
    deselectedAlpha = 0.5,
    hitboxHeight,
    hitboxWidth,
    onSelect = function ({key, previousKey}) {},
    onDeselect = function ({key}) {}
} = {}) {

// colors for hitboxes, in case the developer shows them (for debugging)
const nextColor = (function() {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    let   currentIndex = 0;

    return function() {
        const color = colors[currentIndex];
        currentIndex = (currentIndex + 1) % colors.length;
        return color
    };
}());

const hitboxes          = {},  // TODO: consider changing name
      defaultOnSelect   = onSelect,    // avoids name conflict later on
      defaultOnDeselect = onDeselect;  // avoids name conflict later on

let selectedKey,             // `undefined` if nothing is selected
    keyTouchedMostRecently,  // `undefined` if nothing has been touched
    dragging = false;        // to prevent mouse-over from triggering us

// The user might not always specify a key.  In that case, we need to generate
// unique keys.
function randomHex() {
    let number;
    do {
        number = Math.random();
    } while (number === 0);  // avoid zero (want more digits); this is rare

    return number.toString(16).slice(2);  // hex, but without the leading "0."
}

function generateKey() {
    return Array.from(Array(3)).map(randomHex).join('-');
}

function select({key, fireEvent = true}) {
    const {hitbox, onSelect} = hitboxes[key];
          scale              = magnification,
          alpha              = selectedAlpha,
          node               = hitbox.last(),
          previousKey        = selectedKey;

    deselect({fireEvent: false});

    selectedKey = key;

    node.tween(60).pin({scale, alpha}).ease('quad-in');  // animation

    if (fireEvent) {
        onSelect({key, previousKey});
    }
}

function deselect({fireEvent = true} = {}) {
    if (selectedKey === undefined) {
        return;
    }

    const {hitbox, onDeselect} = hitboxes[selectedKey],
          scale                = 1,
          alpha                = deselectedAlpha,
          key                  = selectedKey,
          node                 = hitbox.last();
   
    selectedKey = undefined;
    
    node.tween(60).pin({scale, alpha}).ease('quad-in');  // animation

    if (fireEvent) {
        onDeselect({key});
    }
}

function add({key, node, options = {}}) {
    if (key in hitboxes) {
        throw new Error(`picker already has a node with the key: ${key}`);
    }

    if (key === undefined) {
        key = generateKey();
    }

    const width       = options.hitboxWidth || hitboxWidth,
          height      = options.hitboxHeight || hitboxHeight,
          onSelect    = options.onSelect || defaultOnSelect,
          onDeselect  = options.onDeselect || defaultOnDeselect,
          color       = nextColor();

    requireArguments({
        hitboxWidth: width,
        hitboxHeight: height,
        onSelect,
        onDeselect
    });

    let toggledWhen = undefined;  // to avoid spurious toggling on click

    function maybeToggle() {
        const stickinessMs = 300,
              now          = new Date();

        if (toggledWhen && now - toggledWhen < stickinessMs) {
            return;  // toggled too recently
        }

        toggledWhen = now;

        if (key === selectedKey) {
            deselect();
        }
        else {
            select({key});
        }
    }

    function onMove() {
        if (dragging && key !== keyTouchedMostRecently) {
            keyTouchedMostRecent = key;
            maybeToggle();
        }
    }

    function onClick() {
        maybeToggle();
    }

    const Mouse  = Stage.Mouse,
          hitbox = Stage.image(color)
                        .pin({width, height, textureAlpha: HITBOX_ALPHA})
                        .stretch()
                        .on(Mouse.START, function () { dragging = true; })
                        .on(Mouse.MOVE,  onMove)
                        .on(Mouse.END,   function () { dragging = false; })
                        .on(Mouse.CLICK, onClick)
                        .append(node.pin({alpha: deselectedAlpha}));
    
    hitboxes[key] = {hitbox, onSelect, onDeselect};

    return hitbox;
}

// This function, `result`, is the object returned.  Invoking the function
// adds a node to the picker, but in addition the function has properties that
// are other functions, such as `select`, `deselect`, etc.
function result(arg, options) {
    // if the first argument is a node, then pass it through as such
    if (arg instanceof Stage) {
        return add({key: undefined, node: arg, options});
    }
    // otherwise, interpret the first argument as a {key: value}
    else {
        const [[key, node]] = Object.entries(arg);
        return add({key, node, options});
    }
};

return Object.assign(result, {
    select, 
    deselect
});
}

return Picker;
});

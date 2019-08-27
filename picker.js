function picker({
    magnification = 1.3,
    selectedAlpha = 1,
    deselectedAlpha = 0.5,
    hitboxHeight,
    hitboxWidth,
    onSelect = function () {},
    onDeselect = function () {}
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

function select(key) {
    deselect();

    const {hitbox, onSelect} = hitboxes[key];
          scale              = magnification,
          alpha              = selectedAlpha,
          node               = hitbox.last();

    selectedKey = key;

    onSelect(key, node.tween(60).pin({scale, alpha}).ease('quad-in'));
}

function deselect() {
    if (selectedKey === undefined) {
        return;
    }

    const {hitbox, onDeselect} = hitboxes[selectedKey],
          scale                = 1,
          alpha                = deselectedAlpha,
          key                  = selectedKey,
          node                 = hitbox.last();
   
    selectedKey = undefined;
          
    onDeselect(key, node.tween(60).pin({scale, alpha}).ease('quad-in'));
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
            select(key);
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
                        .pin({width, height, textureAlpha: 0})
                        .stretch()
                        .on(Mouse.START, function () { dragging = true; })
                        .on(Mouse.MOVE,  onMove)
                        .on(Mouse.END,   function () { dragging = false; })
                        .on(Mouse.CLICK, onClick)
                        .append(node.pin({alpha: deselectedAlpha}));
    
    hitboxes[key] = {hitbox, onSelect, onDeselect};

    return hitbox;
}

function showHitboxes() {
    Object.values(hitboxes).forEach(function (value) {
        value.hitbox.pin({textureAlpha: 0.5});
    });
}

function hideHitboxes() {
    Object.values(hitboxes).forEach(function (value) {
        value.hitbox.pin({textureAlpha: 0});
    });
}

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

return Object.assign(result, {select, deselect, showHitboxes, hideHitboxes});
}
// The "survey" is what is displayed when the player completes a puzzle.  They
// can rate the difficulty of the puzzle.  This menu page is not listed in the
// main menu.
//
define('menu/survey', ['graphics/dom', 'graphics/glyphdetector'],
function ({$class}, GlyphDetector) {

// Detect whether the difficulty rating emoji will render correctly.  If they
// won't, then replace the characters with SVG images instead.
const willRender = GlyphDetector(),
      wontRender = emoji => !willRender(emoji),
      emoji      = {
          '🥱': 'assets/1f971.svg',
          '🤨': 'assets/1f928.svg',
          '🤔': 'assets/1f914.svg',
          '😣': 'assets/1f623.svg',
          '😖': 'assets/1f616.svg',
          '🤯': 'assets/1f92f.svg'
      },
      faceButtonElements = $class('facebutton');

if (Object.keys(emoji).some(wontRender)) {
    // At least one of the `emoji` won't render, so replace all of them with
    // the SVG alternatives.
    faceButtonElements.forEach(button => {
        const face = button.textContent;
              img = document.createElement('img');

        img.src            = emoji[face];
        button.textContent = '';
        button.append(img);
    });
}

// Set up handlers for the difficulty selection buttons.
let selectedButton,
    inGesture = false;

function select(target) {
    faceButtonElements.filter(button => button !== target)
                      .forEach(button => button.style.opacity = 0.2);
    
    target.style.opacity = 1;
    selectedButton       = target;
}

function deselect() {
    faceButtonElements.forEach(button => button.style.opacity = 1);
    selectedButton = undefined;
}

function onPointerMove(event) {
    if (!inGesture) {
        return;
    }

    const button = whichFaceButton(event);

    if (button === selectedButton || button === undefined) {
        return;
    }

    // The mouse is being held down and entered this button's bounding
    // box for the first time.
    select(button);
}

function onPointerDown(event) {
    const button = whichFaceButton(event);

    inGesture = true;
    if (button === selectedButton) {
        deselect();
    }
    else if (button !== undefined) {
        select(button);
    }
}

function onPointerUp() {
    inGesture = false;
}

// Bounding client rectangles and references to the DOM elements, so that
// we can determine for ourselves which button is currently under the
// pointer.  Why?  Because things don't work the same on Chrome.
function whichFaceButton(event) {
    const faceButtons = faceButtonElements.map(button => {
        const {left, top, width, height} = button.getBoundingClientRect();
        return {left, top, width, height, button};
    });

    const match = faceButtons.find(button => {
        const {left, width} = button,
                pointerLeft   = event.clientX;
        
        return pointerLeft >= left && pointerLeft < left + width;
    });

    if (match) {
        return match.button;
    }
};

faceButtonElements.forEach(button => {
    [['pointermove', onPointerMove],
     ['pointerdown', onPointerDown],
     ['pointerup',   onPointerUp]].forEach(([event, handler]) => {
        button.addEventListener(event, handler);
    });
});

function onShow() {
    // TODO: takes arguments about current puzzle, time to solve, etc.
}

return {
    domClass: 'survey',
    onShow
};

});

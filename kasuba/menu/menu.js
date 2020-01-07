define('menu/menu',
['graphics/dom', './about', './levelselect', './rules', './options', './survey'],
function ({$class, $}, ...pageModules) {

// The menu contains "pages."  Each page is a module having the following
// interface:
//
//     {
//         domClass: String
//         name: String (optional)
//         onShow: Function (optional),
//         onHide: Function (optional),
//         setup: Function (optional)
//     }
//
// `domClass` is the value of the `class` attribute for relevant elements
// (rows) in the DOM.  `domClass` is required.
//
// `name` is the name by which the page is referred in Javascript.  To show
// a particular menu page, this module's `show` method is passed the `name` of
// the page.  If `name` is not specified, then it defaults to `domClass`.
//
// `onShow` is a function that is called just _before_ a page is shown.  If the
// call to this module's `show` function included an object of arguments, then
// that object is forwarded as the argument to `onShow`.  If `onShow` is not
// specified, then it defaults to a no-op function.
//
// `onHide` is a function that is called just _after_ a page is hidden.  If
// `onHide` is not specified, then it defaults to a no-op function.
//
// `setup` is a function that is called when this module's `setup` function is
// called.  Its purpose is to inject dependencies into the page, e.g. to give
// the page the capability to alter the game state.
// `setup` is invoked with two arguments:
//
//     setup(forwardedArguments, standardArguments)
//
// `forwardedArguments` is whatever is passed to this module for the page.
// `standardArguments` is:
//
//     {
//         hide: Function that hides the menu
//     }

const noOp = () => {},
      Mouse = Stage.Mouse;

// {<page name>: <page module>}
// Additionally, assign default values for missing properties.
const pages = pageModules.reduce((byName, page) => {
    page.setup = page.setup || noOp;
    page.onShow = page.onShow || noOp;
    page.onHide = page.onHide || noOp;
    page.name = page.name || page.domClass;

    byName[page.name] = page;
    return byName;
}, {});

const MainMenu = {
    domClass: 'mainMenu',
    name: 'mainMenu',
    onHide: noOp,
    onShow: noOp
};

let selected,  // `undefined` if menu is hidden.  A page module otherwise.
    touchAnywhereToCloseHandler;  // installed when menu is open

function showClass(domClass) {
    $class(domClass).forEach(element => element.style.display = 'block');
}

function hideClass(domClass) {
    $class(domClass).forEach(element => element.style.display = 'none');
}

// Showing and hiding are throttled to no more than twice per second.  This is
// a hack to prevent "flickering" when the menu is closed by pressing the
// hamburger or question mark.  These "buttons" compete with the "click
// anywhere to close" handler.  Rather than fiddle with the event registration
// system, I just say "if a menu-show-or-hide action happened very recently,
// ignore this one."
function Throttler({thresholdMs}) {
    let previous;

    return function () {
        // Return `true` if it's "too soon" (i.e. if it "was throttled").
        // Return `false` otherwise (i.e. if it's "ok, not throttled").
        const now = new Date();

        if (previous === undefined || now - previous > thresholdMs) {
            previous = now;
            return false;
        }
        else {
            return true;
        }
    };
}

const throttle = Throttler({thresholdMs: 500});

function show(name, args) {
    if (throttle()) {
        console.log('throttling show()');
        return;
    }

    const canvas = $('stage');

    if (selected !== undefined) {
        // Moving between two pages in the menu.
        hideClass(selected.domClass);
    }

    selected = name === undefined ? MainMenu : pages[name];
    console.log(`Going to show page ${selected.name}: ${selected}`);
    selected.onShow(args);
    showClass(selected.domClass);

    $('menu').style.visibility = 'visible';
    canvas.style.opacity = 0.5;

    if (touchAnywhereToCloseHandler === undefined) {
        touchAnywhereToCloseHandler = () => hide();
        canvas.addEventListener('pointerdown', touchAnywhereToCloseHandler);
    }
}

// Note that closing the menu resets which page is active.
function hide() {
    const canvas = $('stage');

    if (touchAnywhereToCloseHandler !== undefined) {
        canvas.removeEventListener('pointerdown', touchAnywhereToCloseHandler);
        touchAnywhereToCloseHandler = undefined;
    }

    if (throttle()) {
        console.log('throttling hide()');
        return;
    }

    if (selected === undefined) {
        console.log('already hidden');
        // already hidden
        return;
    }

    console.log('going to hide the menu');

    $('menu').style.visibility = 'hidden';
    canvas.style.opacity = 1;

    hideClass(selected.domClass);
    selected.onHide();

    selected = undefined;
}

// Note that closing the menu resets which page is active.
function toggle(pageName) {
    console.log('Menu toggle called, and selected ===', selected);

    if (selected === undefined) {
        show(pageName);
    }
    else {
        hide();
    }
}

function setup({stage}, argsByPage) {
    // Check for fictitious pages in `argsByPage`.
    const extraArgs = Object.keys(argsByPage).filter(key => !(key in pages));
    if (extraArgs.length !== 0) {
        throw Error('These pages specified in menu setup() do not exist: ' +
                    JSON.stringify(extraArgs));
    }

    // Call `setup` on all of the pages.
    Object.entries(pages).forEach(([name, page]) => {
        page.setup(argsByPage[name], {hide});
    });

    setupMenuButtons(stage);
}

// Menus are entirely in the DOM, but the controls on the canvas that open the
// menu, such as the hamburger (menu) and the question mark (rules) exist in
// the Stage.js world, so the `stage` object is passed into this module by
// `setup` so that we can set up those controls.
function setupMenuButtons(stage) {
    // TODO: hack hack.  Playing with an initial "click here" for the rules.
    // const {removePointer} = setupHelpPointer(stage);

    const helpHitbox =
        Stage.image('red')
             .appendTo(stage)
             .pin({width: 45, height: 30, textureAlpha: HITBOX_ALPHA})
             .stretch()
             .on(Mouse.CLICK, () => toggle('rules'));
             // .on(Mouse.CLICK, removePointer);

    Stage.image('help')
         .appendTo(helpHitbox)
         .pin({offsetX: 10, offsetY: 5});

    const menuHitbox =
        Stage.image('blue')
             .appendTo(stage)
             .pin({width: 45,
                   height: 30,
                   alignX: 1,
                   textureAlpha: HITBOX_ALPHA})
             .stretch()
             .on(Mouse.CLICK, () => toggle());

    Stage.image('menu')
         .appendTo(menuHitbox)
         .pin({alignX: 1, offsetX: -17, offsetY: 5});
}

// TODO: hack hack.  Playing with an initial "click here" for the rules.
function setupHelpPointer(stage) {
    const {onSwellDone, removePointer} = (function () {
        let direction = 'expanding',  // or 'contracting', or 'removing'
            node;  // set by initial call to `toggle`

        const magnification = 2.3;

        function toggle() {
            node = this;

            if (direction === 'removing') {
                return;
            }

            const durationMs = 700,
                  tween      = node.tween(durationMs).done(toggle);
            
            if (direction === 'expanding') {
                tween.pin({scale: magnification}).ease('quad-in');
                direction = 'contracting';
            }
            else if (direction === 'contracting') {
                tween.pin({scale: 1}).ease('quad-out');
                direction = 'expanding';
            }
        }

        function remove() {
            if (direction === 'removing') {
                return;
            }

            const durationMs = 250;

            node.tween(durationMs).pin({scale: 0}).ease('quad-in').remove();
            direction = 'removing';
        }

        return {onSwellDone: toggle, removePointer: remove};
    }());

    const pointer = Stage.image('back')
                         .appendTo(stage)
                         .pin({offsetX: 30, offsetY: 5, pivot: 0.5})
                         .on(Mouse.CLICK, removePointer);

    onSwellDone.call(pointer);

    return {removePointer};
}

function back() {
    // The back button will go from a menu page to the main menu.  If we're
    // already on the main menu, then it will close the menu.
    if (selected === MainMenu) {
        hide();
    }
    else {
        show();  // no argument means main menu
    }
}

// Prevent form submission (e.g. clicking a button) from reloading the page.
$('menuForm').addEventListener('submit', function (event) {
    event.target.checkValidity();
    event.preventDefault();
    event.stopPropagation();
});

return {
    show,
    hide,
    toggle,
    back,
    setup,
    pages
};

});

// This module is the root of the module dependency tree.  It is the main
// `stage.js` UI entity (it "owns" the viewbox).  It contains the cube, the
// plane picker, the number picker, and the menu buttons.
//
define('main',
['cube', 'pickers/digitpicker', 'pickers/planepicker', 'puzzles', 'graphics/dom'],
function (Cube, DigitPicker, PlanePicker, Puzzles, {$}) {

Stage(function(stage) {
    stage.viewbox(720 / 4, 1280 / 4);

    let table,
        cube,
        digitPicker,
        planePicker,
        currentLevel = 1;

    table = Stage.column()
                 .appendTo(stage)
                 .spacing(1)
                 .pin({alignX: 0.5,
                       handleY: 1.0,
                       alignY: 1,
                       offsetY: -10});

    function onSelectPlane({plane}) {
        cube.selectPlane({plane});
    }

    function onDeselectPlane() {
        cube.deselectPlane();
    }

    function onSelectCell({digit}) {
        digitPicker.show();
        digitPicker.select({key: digit, fireEvent: false});
    }

    function onDeselectCell() {
        digitPicker.deselect({fireEvent: false});
        digitPicker.hide();
    }

    function onFlipCube({direction}) {
        planePicker.flip({direction});
    }

    function onSelectDigit({digit}) {
        cube.setDigitOfSelected({digit});
    }

    function onDeselectDigit() {
        cube.setDigitOfSelected({digit: 0});
    }

    function onWin() {
        tada();

        setTimeout(function () {
            currentLevel = Math.min(4, currentLevel + 1);
            newLevel(currentLevel);
        }, 3000);
    }

    cube = Cube({parent:     table,
                 onWin,
                 onFlip:     onFlipCube,
                 onSelect:   onSelectCell,
                 onDeselect: onDeselectCell});

    function newLevel (level) {
        // Hide the title. The new level number will appear after an animation.
        const title = $('title');
        title.style.visibility = 'hidden';

        // Reset the cube with a randomly selected puzzle of `level`.
        cube.reset({
            digits: Puzzles.random(level),
            onDone: function () {
                currentLevel = level;
                title.innerText = 'Level ' + currentLevel;
                title.style.visibility = 'visible';
            }
        });
    };

    digitPicker = DigitPicker({parent: table,
                               onSelect: onSelectDigit,
                               onDeselect: onDeselectDigit});

    planePicker = PlanePicker({parent: table,
                               onSelect: onSelectPlane,
                               onDeselect: onDeselectPlane});

    function toggleMistakes() {
        cube.toggleMistakes();
    }

    Menu.setup({stage}, {
        options: {
            toggleShadows: cube.toggleShadows,
            toggleMistakes: toggleMistakes
        },
        levelSelect: {
            selectNewLevel: newLevel
        }
    });

    // `Stage.tween` considers a duration of zero to mean "use the default
    // duration."  So, to get real zero-like behavior, use a tiny duration.
    const ε = Number.EPSILON;

    stage.tween(ε, 500, true).done(() => {
        cube.reset({
            digits: Puzzles.default(),
            onDone: function () {
                $('title').style.visibility = 'visible';
            }
        });
    });
});

return {};
});

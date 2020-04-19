// A `Cube` instance is the cube of numbered cells with which the user
// interacts to play the game.
//
define('cube',
[
    'cell',
    'gestures/dragdetector',
    'gestures/swipedetector',
    'geometry/planes',
    'geometry/matrix',
    'geometry/rotations',
    'contracts',
    'keyboard'
],
function (Cell, DragDetector, SwipeDetector, Planes, Matrix, Rotations, {requireArguments}, Keyboard) {

function Cube({
    parent,
    onWin,
    onFlip = function ({direction}) {
        console.log('cube flipped', direction);
    },
    onSelect = function ({digit}) {
        console.log('A cell was selected.  It has digit', digit);
    },
    onDeselect = function () {
        console.log('The selected cell was deselected.');
    }
} = {}) {
    requireArguments({parent, onFlip, onSelect, onDeselect, onWin});

    const Mouse = Stage.Mouse;

    let cells               = [],
        cellsByHomePosition = {},
        cubeHitbox,
        cube,
        selectedCell;

    function toggle(onEnable, onDisable, initial = false) {
        let state = initial;
        return function () {
            if (state) {
                state = false;
                return onDisable();
            }
            else {
                state = true;
                return onEnable();
            }
        }
    }

    const toggleShadows =
        toggle(function () {
                   cells.forEach(cell => cell.hideShadow());
               },
               function () {
                   cells.forEach(cell => cell.showShadow());
               });

    const toggleMistakes =
        toggle(function () {
                   cells.forEach(cell => cell.showingMistakes = false);
                   cells.forEach(cell => cell.updateUi());
               },
               function () {
                   cells.forEach(cell => cell.showingMistakes = true);
                   cells.forEach(cell => cell.updateUi());
               });


    function* coordinates() {
        // back to front
        for (let depth of [2, 1, 0]) {
            // top down
            for (let row of [0, 1, 2]) {
                // left to right
                for (let column of [0, 1, 2]) {
                    yield {row, column, depth};
                }
            }
        }
    }

    function cellToMatrix({row, column, depth}) {
        return [[column - 1, depth - 1, 1 - row]];
    }

    function matrixToCell([[x, y, z]]) {
        return {
            row: 1 - z,
            column: x + 1,
            depth: y + 1
        };
    }

    // When we start a new level, "catch up" to the current view using this.
    let currentRotation = Rotations.identity;

    function flip(direction) {
        // Before we start, let's make sure that the z-order is correct
        // (maybe we interrupted a previous tween).
        reparentCells();

        const rotation = Rotations[direction];
        
        currentRotation = Matrix.multiply(currentRotation, rotation);

        const onDone = (function () {
            let count = 0;
            return function () {
                if (++count !== cells.length) {
                    return;
                }

                // last one triggers reparenting, so that z-order is correct
                reparentCells();
            };
        }());

        cells.forEach(function (cell) {
            const {row, column, depth} = cell,
                  vector               = cellToMatrix({row, column, depth}),
                  rotatedVector        = Matrix.multiply(vector, rotation);

            cell.flyTo(matrixToCell(rotatedVector), {onDone});
        });

        onFlip({direction});
    }

    // Arrow keys flip the cube.
    ['Up', 'Down', 'Left', 'Right'].forEach(suffix => {
        Keyboard.on('Arrow' + suffix, code => {
            const direction = code.slice('Arrow'.length).toLowerCase();
            flip(direction);
        });
    });

    // This bool is used to prevent drag gestures from happening when a
    // "new level" animation is playing.  The animations of dragging and flying
    // around (the "tweens") were stepping on each others' toes.
    let draggingDisabled = false;

    const onDrag = (function () {
        function withStickiness(offset) {
            const power = 0.7;
            return offset ? offset / Math.pow(Math.abs(offset), 1 - power) : 0;
        }

        let previousTimestamp;  // prevent excessive animation

        return function ({offsetX, offsetY, deltaX, deltaY, timestamp}) {
            if (draggingDisabled) {
                return;
            }
            // TODO: change name of `timestamp` to reflect units
            else if (previousTimestamp === undefined) {
                previousTimestamp = timestamp;
            }
            else if (timestamp - previousTimestamp < 100) {
                return;
            }
            else {
                previousTimestamp = timestamp;
            }

            cells.forEach(cell => {
                cell.dragOffsetX = withStickiness(offsetX);
                cell.dragOffsetY = withStickiness(offsetY);

                cell.flyTo(cell, {clearDragOffset: false,
                                  ease: 'linear',
                                  durationMs: 200});
            });
        }
    }());

    function onDragEnd() {
        if (draggingDisabled) {
            return;
        }

        // Fly back to where you were.
        // Note that the use of `appendAnimation: true` here is to play nice
        // with cell select/deselect.  If a cell is selected at the same time
        // that we want to fly back after dragging, first emphasize the cell
        // and only afterward fly back.
        cells.forEach(cell => cell.flyTo(cell, {durationMs: 750,
                                                appendAnimation: true}));
    }

    const swipe = SwipeDetector({onSwipe: flip}),
          drag  = DragDetector({onDrag, onDragEnd});

    cube = Stage.image('purple')
                .appendTo(parent)
                .pin({alignX: 0.5,
                      width: 180,
                      height: 200,
                      offsetX: -5,
                      textureAlpha: HITBOX_ALPHA})
                .stretch();
                // we might have interrupted a swipe, so "fix" the z-order
    
    // The hitbox for the cube is wider than the screen, to support desktops.
    cubeHitbox = Stage.image('green')
                      .appendTo(cube)
                      .pin({alignX: 0.5,
                            width: 4 * cube.width(), 
                            height: cube.height(),
                            textureAlpha: HITBOX_ALPHA})
                      .stretch()
                      .on(Mouse.START, function () { reparentCells(); })
                      .on(Mouse.START, swipe.onStart)
                      .on(Mouse.END,   swipe.onEnd)
                      .on(Mouse.START, drag.onStart)
                      .on(Mouse.MOVE,  drag.onMove)
                      .on(Mouse.END,   drag.onEnd);


    function parseHomePosition(key) {
        const [row, column, depth] = key.split(',').map(Number);
        return {row, column, depth};
    }

    function wrongers() {
        // This inefficient, but simple.  Getting the data structures to look
        // nice in JS for the optimal solution was giving me a headache.
        const result = new Set();

        Planes.required.forEach(plane => {
            const inPlane      = Planes.predicates[plane],
                  cellsByDigit = {};

            for (let {row, column, depth} of coordinates()) {
                if (!inPlane({row, column, depth})) {
                    continue;
                }

                const cell  = cellsByHomePosition[[row, column, depth]],
                      digit = cell.digit;
                if (digit) {
                    let cells = cellsByDigit[digit];
                    if (cells === undefined) {
                        cellsByDigit[digit] = cells = [];
                    }
                    cells.push(cell);
                }
            }

            Object.values(cellsByDigit)
                  .filter(cells => cells.length > 1)
                  .forEach(cells => cells.forEach(cell => result.add(cell)));
        });

        return result;
    }

    function selectPlane({plane}) {
        const inPlane = Planes.predicates[plane];

        Object.entries(cellsByHomePosition)
              .map(([key, cell]) => [parseHomePosition(key), cell])
              .forEach(([{row, column, depth}, cell]) => {
                  cell.planeState = inPlane({row, column, depth})    ?
                                                       'selected'    :
                                                       'deemphasized';
                  cell.updateUi();
              });
    }

    function deselectPlane() {
        cells.forEach(cell => {
            cell.planeState = 'normal';
            cell.updateUi();
        });
    }

    // Remove cells from the cube and add them back again in such an order that
    // cells in the back (greater `depth` values) are drawn first.
    function reparentCells() {
        console.log('reparenting cells...');

        [2, 1, 0].forEach(function (depth) {
            cells.filter(cell => cell.depth === depth)
                 .forEach(cell => cell.reparent());
        });
    }

    function onSelectCell(cell) {
        if (selectedCell !== undefined) {
            selectedCell.deselect();
        }

        selectedCell = cell;
        onSelect({digit: cell.digit});
    }

    function onDeselectCell() {
        selectedCell = undefined;
        onDeselect();
    }

    function setDigitOfSelected({digit}) {
        if (selectedCell === undefined) {
            throw Error(
                `Can't setDigitOfSelected(${JSON.stringify({digit})}) ` +
                `because there isn't currently a cell selected.`);
        }

        selectedCell.digit = digit;
        selectedCell.updateUi();

        const wrong = wrongers();
        
        cells.forEach(cell => {
            cell.isWrong = wrong.has(cell);
            cell.updateUi();
        });

        if (wrong.size === 0 && !cells.some(cell => cell.digit === 0)) {
            // We won!
            onWin();
        }
    }

    function updateUi() {
        cells.forEach(cell => cell.updateUi());
    }
   
    function collapse({onDone = function () {}} = {}) {
        const completionHandler = (function () {
            let count = 0;
            return function () {
                if (++count === 27) {
                    setTimeout(onDone, 300);
                }
            };
        }());

        cells.forEach(cell => {
            cell.flyTo({row: 1, column: 1, depth: 1},
                       {durationMs: 500,
                        ease: 'quad-in',
                        onDone: completionHandler});
        });
    }

    function reset({digits, onDone = function () {}}) {
        draggingDisabled = true;

        // Make sure that no cell is selected, and notify the digit picker.
        if (selectedCell !== undefined) {
            selectedCell.deselect();
            selectedCell = undefined;
            onDeselect();
        }

        collapse({onDone: function () {
            for (let {row, column, depth} of coordinates()) {
                const digit = digits[[row, column, depth]] || 0,
                      cell  = cellsByHomePosition[[row, column, depth]];
    
                cell.digit    = digit;
                cell.isWrong  = false;
                cell.isPreset = digit !== 0;
    
                cell.updateUi();
            }

            const completionHandler = (function () {
                let count = 0;
                return function () {
                    if (++count === 27) {
                        draggingDisabled = false;
                        onDone();
                    }
                }
            }());

            for (let {row, column, depth} of coordinates()) {
                // We want to fly to the cell's "home position," _except_ that
                // we might be rotated, so first apply the `currentRotation`.
                const cell          = cellsByHomePosition[[row, column, depth]],
                      vector        = cellToMatrix({row, column, depth}),
                      rotatedVector = Matrix.multiply(vector, currentRotation);

                cell.flyTo(matrixToCell(rotatedVector),
                           {onDone: completionHandler, appendAnimation: true});
            }
        }});
    }
   
    for (let {row, column, depth} of coordinates()) {
        const cell = Cell({
            cubeUi: cube,
            row,
            column,
            depth,
            isPreset: false,
            digit: 0,
            onSelect: onSelectCell,
            onDeselect: onDeselectCell
        });

        cells.push(cell);
        cellsByHomePosition[[row, column, depth]] = cell;
    }

    // Now that all of the cells and their shadows have been added to the cube,
    // reparent the cells so that all cells are drawn after all shadows.
    cells.forEach(cell => cell.reparent());

    return {
        selectPlane,
        deselectPlane,
        setDigitOfSelected,
        reset,
        toggleShadows,
        toggleMistakes,
        updateUi
    };
}

return Cube;

});

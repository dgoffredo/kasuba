define('cell', ['contracts'], function ({requireArguments}) {

// Coordinates are row, column, and depth, each taking on any of the values
// 0, 1, or 2.  Rows start at the top and go down.  Columns start on the
// left and go right.  Depth starts at the front and goes back.
//
// Keep in mind that the "pixel" coordinate system used by stage.js has the
// origin at the top left of the parent, with increasing x going to the
// right and increasing y going down.
//
// One more thing to keep in mind.  Because stage.js doesn't implement
// "z-order," in order to make sure that the cells in the back are drawn
// first (and thus can be occluded by cells drawn later), they have to be
// added to the parent node first.  So, cells are added back to front.
   
const spacing                = 56;              // spacing between cells
const spacingX               = spacing;
const spacingY               = 1.1 * spacing;
const shear                  = 0.32 * spacing;  // sideways drift going back
const perspective            = 0.18;            // shrinkage per level of depth
const baseMagnification      = 1.4;             // general magnification
const selectionMagnification = 1.3;             // additional when selected

function defaultCellPosition({row, column, depth}) {
    requireArguments({row, column, depth});

    const pow = Math.pow;

    return {
        offsetX: spacingX * column + shear * pow(depth, 0.9),
        offsetY: spacingY * row    - shear * pow(depth, 0.9) + 0.6 * spacingY
    };
}

function cellScale({depth, isSelected}) {
    requireArguments({depth, isSelected});

    const scale = baseMagnification * (1 - perspective * depth);
    if (isSelected) {
        return scale * selectionMagnification;
    }
    else {
        return scale;
    }
}

// how much a shadow shrinks due to the thing casting it being higher up
function shadowHeightScaling({row, dragHeightOffset}) {
    // Shadows closer to the floor are larger.  As `row` gets larger, we get
    // closer to the floor.  As `dragHeightOffset` gets larger, we get further
    // away from the floor.
    const gain = 0.1;  // the "strength" of the effect
    
    if (dragHeightOffset < -20) {
        // disappear when the cell gets too close to the shadow
        return 0;
    }
    
    return 1 - ((2 - row) + 5 * dragHeightOffset / spacingY) * gain;
}

const hitboxWidth = 48;
const hitboxHeight = 22;

function Cell({
    cubeUi,
    row,
    column,
    depth,
    isPreset = false,
    digit = 0,              // zero means no value
    onSelect,               // function (cell)
    onDeselect,             // function (cell)
    isWrong = false,
    planeState = 'normal',  // 'normal', 'selected', or 'deemphasized'
    dragOffsetX = 0,        // from the user dragging the cube around
    dragOffsetY = 0
}) {
    requireArguments({cubeUi, onSelect, onDeselect, row, column, depth});

    let instance,  // `instance` is the object returned by this function
        isSelected = false,
        showingMistakes = true;

    function deselect() {
        isSelected = false;

        const durationMs = 200,
              ease       = 'cubic';

        updateUi({
            fill:       fillUi  .tween(durationMs).ease(ease),
            shadowFill: shadowUi.tween(durationMs).ease(ease)
        });

        return instance;
    }

    function select() {
        isSelected = true;

        const durationMs = 500,
              ease       = 'elastic';

        updateUi({
            fill:       fillUi  .tween(durationMs).ease(ease),
            shadowFill: shadowUi.tween(durationMs).ease(ease)
        });

        return instance;
    }

    function onClick() {
        if (isPreset) {
            return;  // TODO: maybe wiggle duplicates if `isWrong`
        }

        console.log('in onClick with this:', this);

        if (isSelected) {
            console.log('deselecting.');
            deselect();
            onDeselect(instance);
        }
        else {
            console.log('selecting.');
            select();
            onSelect(instance);
        }

        return true;  // TODO: Seems to lead to fewer no-op clicks.  Why?
    }

    // What follows is initial setup of the UI nodes relevant to this cell.
    // Some of the parameters are immediately modified by an initial call to
    // `updateUi` (such as the texture of the `fillUi`), while others remain
    // unchanged (such as the width of the `hitboxUi`).

    // area that reacts to touch (larger than visible cell)
    const hitboxUi = Stage.image('orange')
                          .appendTo(cubeUi)
                          .pin({width: hitboxWidth,
                                height: hitboxHeight,
                                textureAlpha: HITBOX_ALPHA})
                          .stretch()
                          .on(Stage.Mouse.CLICK, onClick);

    // the colored square
    const fillUi = Stage.image('blank')  // first update will change image
                        .appendTo(hitboxUi)
                        .pin({align: 0.5})
    // around the colored square
    const borderUi = Stage.image('border box').appendTo(fillUi);
    // the number displayed (or blank if the number is zero)
    const digitUi = Stage.string('digit').appendTo(fillUi).value(digit);
    // Shadow is on the floor.  Shadows don't get touched, so they don't need a
    // hitbox for that.  Instead, they have a hitbox so that they are rendered
    // analogously to how the cell is rendered.
    const shadowHitboxUi = Stage.image('red')
                                .appendTo(cubeUi)
                                .pin({textureAlpha: HITBOX_ALPHA,
                                      width: hitboxWidth,
                                      height: hitboxHeight})
                                .stretch();

    // the actual image for the shadow
    const shadowUi = Stage.image('shadow')
                          .appendTo(shadowHitboxUi)
                          .pin({align: 0.5,
                                skewX: -1});

    // `Stage.tween` considers a duration of zero milliseconds to mean "use
    // some default," which is bad.  So, instead of zero, I pass some teeny
    // tiny positive number.
    const ε = Number.EPSILON;

    function updateUi({hitbox = hitboxUi.tween(ε),
                       fill = fillUi.tween(ε),
                       shadowHitbox = shadowHitboxUi.tween(ε),
                       shadowFill = shadowUi.tween(ε)} = {}) {

        let scale = cellScale({depth, isSelected});
        
        // Of we're in the front of the cube, then we get dragged in the same
        // direction as the user's finger.  If we're on the back on the cube,
        // then we get dragged in the opposite direction.  If we're in the
        // center layer, then we don't get dragged at all.
        const dragSign = 1 - depth;

        // the shadow
        const shadowPosition = defaultCellPosition({row: 2, column, depth});
        shadowPosition.offsetY += 0.4 * spacingY;
        shadowPosition.offsetX += dragSign * dragOffsetX;

        shadowHitbox.pin({offsetX: shadowPosition.offsetX,
                          offsetY: shadowPosition.offsetY,
                          width: hitboxWidth,
                          height: hitboxHeight});

        const heightScale = shadowHeightScaling({
            row,
            dragHeightOffset: -dragSign * dragOffsetY
        });

        shadowFill.pin({scaleX: heightScale * scale,
                        scaleY: heightScale * scale / 2,
                        textureAlpha: 0.1 + 0.4 * row / 2});  // 0.1 to 0.5

        // the cell
        let {offsetX, offsetY} = defaultCellPosition({row, column, depth});
        offsetX += dragSign * dragOffsetX;
        offsetY += dragSign * dragOffsetY;

        hitbox.pin({offsetX,
                    offsetY,
                    width: hitboxWidth,
                    height: hitboxHeight});

        fill.pin({scale});

        // cell color, if `fill` is something whose image can be set.  `fill`
        // might be a tween rather than an image (e.g. on cell click).
        // TODO: Now that the default arguments are all tweens, this branch
        //       is no longer necessary.  However, I like the ability to pass
        //       either a node or a tween, even if it's not used.
        function fillImage(name) {
            if (fill.image !== undefined) {
                return fill.image(name);
            }
            else {
                return fill.done(function () {
                    this.image(name);
                });
            }
        }

        if (planeState === 'selected' && (isPreset || !isWrong)) {
            fillImage('teal box');
        }
        else if (showingMistakes && isWrong && !isPreset) {
            fillImage('red box');
        }
        else if (isPreset) {
            fillImage('blue box');
        }
        else {
            fillImage('light box');
        }

        // cell opacity
        if (planeState === 'deemphasized') {
            fill.pin({alpha: 0.3});
        }
        else {
            fill.pin({alpha: 1});
        }

        // cell border color
        if (isSelected && planeState !== 'selected') {
            let color;
            if (showingMistakes && isWrong) {
                color = 'red';
            }
            else {
                color = 'teal';
            }
            borderUi.image(color + ' border box');
        }
        else if (showingMistakes && isPreset && isWrong) {
            borderUi.image('red border box');
        }
        else {
            borderUi.image('border box');
        }

        // the number (digit)
        digitUi.value(digit);
    }

    function flyTo(coordinates, {
                       onDone = function () {},
                       durationMs = 900,
                       ease = 'elastic(1, 0.75)',
                       clearDragOffset = true,
                       appendAnimation = false,  // as opposed to _replace_
                   } = {}) {
        row    = coordinates.row;
        column = coordinates.column;
        depth  = coordinates.depth;

        if (clearDragOffset) {
            // When the user flicks the cube, we want the cells to end up in
            // the canonical place for the given `coordinates`, so we zero any
            // current drag offset.
            dragOffsetX = dragOffsetY = 0;
        }
        
        function animated(ui) {
            const delayMs = 0;
            return ui.tween(durationMs, delayMs, appendAnimation).ease(ease)
        }

        // We could attach `onDone` to any one of the tweens, doesn't matter.
        updateUi({
            hitbox:       animated(hitboxUi).done(onDone),
            fill:         animated(fillUi),
            shadowHitbox: animated(shadowHitboxUi),
            shadowFill:   animated(shadowUi)
        });

        return instance;
    }

    // The cube (parent) needs to be able to momentarily remove and then re-add
    // each cell in order to change their relative order.  When the cube is
    // flipped, we want to make sure that cells/shadows in front are always
    // drawn last; therefore, the cube will go through its cells and call
    // `reparent` and `reparentShadow` in these situations.
    function reparent() {
        hitboxUi.remove().appendTo(cubeUi);
        return instance;
    }

    function reparentShadow() {
        shadowHitboxUi.remove().appendTo(cubeUi);
        return instance;
    }

    function showShadow() {
        shadowHitboxUi.pin({alpha: 1});
    }

    function hideShadow() {
        shadowHitboxUi.pin({alpha: 0});
    }

    updateUi();  // initial pins

    instance = {
        updateUi,
        flyTo,
        reparent,
        reparentShadow,
        showShadow,
        hideShadow,
        select,
        deselect,
        get row()                  { return row; },
        set row(value)             { return row = value; },
        get column()               { return column; },
        set column(value)          { return column = value; },
        get depth()                { return depth; },
        set depth(value)           { return depth = value; },
        get isPreset()             { return isPreset; },
        set isPreset(value)        { return isPreset = value; },
        get digit()                { return digit; },
        set digit(value)           { return digit = value; },
        get isSelected()           { return isSelected; },
        get isWrong()              { return isWrong; },
        set isWrong(value)         { return isWrong = value; },
        get planeState()           { return planState; },
        set planeState(value)      { return planeState = value; },
        get dragOffsetX()          { return dragOffsetX; },
        set dragOffsetX(value)     { return dragOffsetX = value; },
        get dragOffsetY()          { return dragOffsetY; },
        set dragOffsetY(value)     { return dragOffsetY = value; },
        get showingMistakes()      { return showingMistakes; },
        set showingMistakes(value) { return showingMistakes = value; },
    };

    return instance;
}

return Cell;

});
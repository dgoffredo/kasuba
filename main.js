Stage(function(stage) {
    const Mouse = Stage.Mouse;

    stage.viewbox(720 / 4, 1280 / 4);

    const table = Stage.column().appendTo(stage).spacing(10);

    const controls = Stage.row().appendTo(table).spacing(10);

    let   cells   = [];
    let   shadows = [];
    let   floor;
    const floorAlpha = 0.1;
    const hitboxWidth = 48;
    const hitboxHeight = 16;

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

    Stage.string('letter').value('A')
         .appendTo(controls)
         .on(Mouse.CLICK, toggle(function () {
                                     cells.forEach(function (cell) {
                                         cell.last().image('blue');
                                     });
                                     return true;
                                 },
                                 function () {
                                     cells.forEach(function (cell) {
                                         cell.last().image('blue box');
                                     });
                                     return true;
                                 }));


    Stage.string('letter').value('B')
         .appendTo(controls)
         .on(Mouse.CLICK, function () {
             const skipBrowserCache = true;
             location.reload(skipBrowserCache);
             return true;
         });

    function invokeMethod(methodName, ...args) {
        return function (instance) {
            instance[methodName](...args);
        };
    }

    Stage.string('letter').value('C')
         .appendTo(controls)
         .on(Mouse.CLICK, toggle(function () {
                                     shadows.forEach(invokeMethod('hide'));
                                     floor.hide();
                                     return true;
                                 },
                                 function () {
                                     shadows.forEach(invokeMethod('show'));
                                     floor.show();
                                     return true;
                                 }));

    Stage.string('letter').value('D')
         .appendTo(controls)
         .on(Mouse.CLICK, toggle(function () {
                                     cells.forEach(function (cell) {
                                         cell.pin({textureAlpha: 0.5});
                                     });
                                     return true;
                                 },
                                 function () {
                                     cells.forEach(function (cell) {
                                         cell.pin({textureAlpha: 0});
                                     });
                                     return true;
                                }));
 
    Stage.string('letter').value('E')
         .appendTo(controls)
         .on(Mouse.CLICK, toggle(function () {
                                     shadows.forEach(function (cell) {
                                         cell.pin({textureAlpha: 0.3});
                                     });
                                     return true;
                                 },
                                 function () {
                                     shadows.forEach(function (cell) {
                                         cell.pin({textureAlpha: 0});
                                     });
                                     return true;
                                }));
                                
    Stage.string('letter').value('F')
         .appendTo(controls)
         .on(Mouse.CLICK, 
             toggle(function () { floor.pin({textureAlpha: 0}); },
                    function () { floor.pin({textureAlpha: floorAlpha}); }));

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
   
    const spacing     = 50;
    const spacingX    = spacing;
    const spacingY    = spacing;
    const shear       = 0.32 * spacing;
    const perspective = 0.15;

    function cellPosition({row, column, depth}) {
        return {
            offsetX: spacingX * column + shear * depth,
            offsetY: spacingY * row    - shear * depth + spacingY,
        };
    }

    function cellScale(depth) {
        return 1 - perspective * depth;
    }

    function scale(node, amount) {
        const durationMs = 300;

        return node.tween(durationMs)
                   .scale(amount)
                   .ease('bounce-in');
    }

    let selectedImage;

    function expand(image, amount) {
        return scale(image.image('green box'), 1.5 * amount);
    }

    function shrink(image, amount) {
        return scale(image.image('blue box'), amount);
    }

    function onClick(depth) {
        return function (point) {
            // `this` is the cell. We want to change the color and size of the
            // color texture containing the number. This is the cell's last
            // child (the shadow is drawn first so that it can be overdrawn).
            console.log(point);
            console.log(this);

            const image = this.last();
            console.log(image);

            const depthScale = cellScale(depth);

            if (selectedImage === image) {
                shrink(image, depthScale);
                selectedImage = undefined;
            }
            else {
                if (selectedImage !== undefined) {
                    shrink(selectedImage, depthScale);
                }
                expand(image, depthScale);
                selectedImage = image;
            }

            return true;
        }
    }

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

    const cube = Stage.image('purple')
                      .appendTo(table)
                      .pin({align: 0.5,
                            width: 175,
                            height: 200,
                            textureAlpha: 0})
                      .stretch();

    floor = Stage.image('floor')
                 .appendTo(cube)
                 .pin({textureAlpha: floorAlpha,
                       scale: 1.1,
                       offsetX: -7,
                       offsetY: 138});

    for (let {row, column, depth} of coordinates()) {
        const position = cellPosition({row, column, depth});
        
        // `cell` is the parent node of each cell, and represents the "hit box"
        // for selecting that cell.  Its descendants will be: the background
        // texture, the shadow, the digit, etc.
        const cell = Stage.image('orange')
                          .appendTo(cube)
                          .pin({width: hitboxWidth,
                                height: hitboxHeight,
                                textureAlpha: 0})
                          .stretch()
                          .pin(position)
                          .on(Mouse.CLICK, onClick(depth));

        cells.push(cell);

        // shadows
        const heightScale    = 1 - (2 - row) * 0.1;
        const shadowPosition = cellPosition({row: 2, column, depth});
        shadowPosition.offsetY += 0.4 * spacingY;

        const shadowBox = Stage.image('red')
                               .appendTo(cube)
                               .pin({textureAlpha: 0})
                               .pin(shadowPosition)
                               .pin({width: hitboxWidth, height: hitboxHeight})
                               .stretch();

        shadows.push(shadowBox);

        Stage.image('shadow')
             .appendTo(shadowBox)
             .pin({scaleX: heightScale * cellScale(depth),
                   scaleY: heightScale * cellScale(depth) / 2,
                   align: 0.5,
                   skewX: -1});


        // The visible part of the cell.
        const cellFill = Stage.image('blue box')
                              .appendTo(cell)
                              .pin({scale: cellScale(depth),
                                    align: 0.5});

        // The number inside of the visible part of the cell.
        Stage.string('digit')
             .appendTo(cellFill)
             // .pin({align: 0.5})
             .value(Math.floor(Math.random() * 10));
    }
});
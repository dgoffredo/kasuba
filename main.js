var toggleShadows,
    toggleFloor,
    toggleHitboxes;

Stage(function(stage) {
    const Mouse = Stage.Mouse;

    stage.viewbox(720 / 4, 1280 / 4);

    const controlBox = Stage.column()
                            .appendTo(stage)
                            .pin({alignX: 1, offsetY: 10});

    let controls;

    function $(id) {
        return document.getElementById(id);
    }

    let menuDisabled = false;

    Stage.image('menu')
         .appendTo(controlBox)
         .pin({'alignX': 1, offsetX: -17})
         .on([Mouse.START, Mouse.END], function () {
             if (menuDisabled) {
                 return;
             }

             $('menu').style.visibility = 'visible';
             $('stage').style.opacity   = 0.5;
             menuDisabled               = true;

             console.log('registering first stop');
             stage.on(Mouse.END, function handlerStop () {
                 console.log('registering next start');
                 stage.off(Mouse.END, handlerStop);
                 stage.on(Mouse.START, function handlerStart() {
                     $('menu').style.visibility = 'hidden';
                     $('stage').style.opacity   = 1;
                     stage.off(Mouse.START, handlerStart);
    
                     console.log('registering next stop');
                     stage.on(Mouse.END, function restore() {
                         console.log('enabling menu clickability');
                         menuDisabled = false;
                         stage.off(Mouse.END, restore);
                     });
                 });
             });
         });

    controls = Stage.row()
                    .appendTo(controlBox)
                    .spacing(10);

    controls.hide();

    const editable = 'light box';
    const preset   = 'blue box';
    const selected = 'green box'; // editable;
    let   cells    = [];
    let   shadows  = [];
    let   floor;
    let   cube;
    let   digitPicker;
    let   planePicker;
    const cellHitboxWidth = 48;
    const cellHitboxHeight = 16;

    function showDigitPicker() {
        digitPicker.container.tween(500).pin({scaleX: 1}).ease('elastic');
    }

    function hideDigitPicker() {
        digitPicker.container.tween(200).pin({scaleX: 0}).ease('cubic');
    }

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
                                         cell.last().image(editable);
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

    toggleShadows = toggle(function () {
                               shadows.forEach(invokeMethod('hide'));
                               return true;
                           },
                           function () {
                               shadows.forEach(invokeMethod('show'));
                               return true;
                           });

    Stage.string('letter').value('C')
         .appendTo(controls)
         .on(Mouse.CLICK, toggleShadows);

    toggleHitboxes = toggle(function () {
                        cells.forEach(function (cell) {
                            cell.pin({textureAlpha: 0.5});
                        });
                        shadows.forEach(function (cell) {
                            cell.pin({textureAlpha: 0.3});
                        });
                        cube.pin({textureAlpha: 0.2});
                        digitPicker.showHitboxes();
                        planePicker.showHitboxes();
                        showDigitPicker();
                        return true;
                    },
                    function () {
                        cells.forEach(function (cell) {
                            cell.pin({textureAlpha: 0});
                        });
                        shadows.forEach(function (cell) {
                            cell.pin({textureAlpha: 0});
                        });
                        cube.pin({textureAlpha: 0});
                        digitPicker.hideHitboxes();
                        planePicker.hideHitboxes();
                        return true;
                    });

    Stage.string('letter').value('D')
         .appendTo(controls)
         .on(Mouse.CLICK, toggleHitboxes);

    toggleFloor = toggle(function () { floor.show() },
                         function () { floor.hide(); });
                    
    Stage.string('letter').value('E')
         .appendTo(controls)
         .on(Mouse.CLICK, toggleFloor);

    const table = Stage.column()
                       .appendTo(stage)
                       .spacing(2)
                       .pin({alignX: 0.5,
                             handleY: 1.0,
                             alignY: 1,
                             offsetY: -20});

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
    const perspective = 0.15; // 0.1;

    function defaultCellPosition({row, column, depth}) {
        return {
            offsetX: spacingX * column + shear * depth,
            offsetY: spacingY * row    - shear * depth + spacingY,
        };
    }

    function cellScale(depth) {
        return 1 - perspective * depth;
    }

    function scale(node, scaleX, scaleY = scaleX) {
        const durationMs = 500;

        return node.tween(durationMs)
                   .pin({scaleX, scaleY})
                   .ease('elastic');
    }

    let selectedIndex;

    function heightScaling(row) {
        return 1 - (2 - row) * 0.1;
    }

    // TODO: hack hack hack
    function onClick(depth, row, digitValue) {
        return function (point) {
            // `this` is the cell. We want to change the color and size of the
            // color texture containing the number. This is the cell's last
            // child (the shadow is drawn first so that it can be overdrawn).
            console.log(point);
            console.log(this);

            const depthScale    = cellScale(depth);
            const heightScale   = heightScaling(row);
            const magnification = 1.3;

            function expandCell(image) {
                return scale(image.image(selected),
                             magnification * depthScale);
            }

            function shrinkCell(image) {
                return scale(image.image(editable), depthScale);
            }

            function expandShadow(image) {
                return scale(image,
                             magnification * depthScale * heightScale,
                             magnification * depthScale * heightScale * 0.5);
            }

            function shrinkShadow(image) {
                return scale(image,
                             depthScale * heightScale,
                             depthScale * heightScale * 0.5);
            }

            const image  = this.last();
            const index  = cells.indexOf(this);
            const shadow = shadows[index].last();

            if (selectedIndex === index) {
                shrinkCell(image);
                shrinkShadow(shadow);
                selectedIndex = undefined;
                digitPicker.deselect();
                hideDigitPicker();
            }
            else {
                if (digitValue === 0) {
                    digitPicker.deselect();
                }
                else {
                    digitPicker.select(digitValue);
                }

                showDigitPicker();

                if (selectedIndex !== undefined) {
                    const selectedShadow = shadows[selectedIndex].last();
                    shrinkCell(cells[selectedIndex].last());
                    shrinkShadow(selectedShadow);
                }

                expandCell(image);
                expandShadow(shadow);
                selectedIndex = index;
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

    const swipe = swipeDetector();

    cube = Stage.image('purple')
                .appendTo(table)
                .pin({alignX: 0.5,
                      width: 175,
                      height: 190,
                      textureAlpha: 0})
                .stretch()
                .on(Mouse.START, swipe.onStart)
                .on(Mouse.END,   swipe.onEnd);

    // digit picker
    digitPicker = (function () {
        const height    = 28,
              container = Stage.image('red')
                               .appendTo(table)
                               .pin({alignX: 0.5,
                                     width: 175,
                                     height,
                                     textureAlpha: 0,
                                     scaleX: 0})  // invisible when not in use
                               .stretch(),
              pick      = picker({hitboxHeight: height,
                                  hitboxWidth: 16,
                                  magnification: 1.5,
                                  selectedAlpha: 0.7,
                                  deselectedAlpha: 0.5});
                                    
        Stage.row()
             .appendTo(container)
             .spacing(1)
             .pin({alignX: 0.5})
             .append(Array.from('123456789').map(function (digit) {
                 return pick({
                     [digit]: Stage.string('digit')
                                   .value(digit)
                                   .pin({alignX: 0.5,
                                         alignY: 0.3,
                                         alpha: 0.5})
                 });
             }));

        return {
            container,
            showHitboxes: pick.showHitboxes,
            hideHitboxes: pick.hideHitboxes,
            select:       pick.select,
            deselect:     pick.deselect
        };
    }());

    // plane picker
    planePicker = (function () {  // TODO, put in their own files (maybe)
        const pick = picker({hitboxHeight: 24, hitboxWidth: 22});
    
        function plane(name) {
            return pick(Stage.image(name).pin({alignX: 0.5, alignY: 0.33}));
        }
   
        Stage.column().appendTo(table)
                      .spacing(6)
                      .pin({alignX: 0.5})
                      .append([
            Stage.row().spacing(10).append([
                Stage.row().append(['depth0', 'depth1', 'depth2'].map(plane)),
                Stage.row().append(['column0', 'column1', 'column2'].map(plane))
            ]),
            Stage.row().spacing(10).append([
                Stage.row().append(['row2', 'row1', 'row0'].map(plane)),
                // TODO: special planes, whatever they end up being
                Stage.row().append(['depth2', 'depth1', 'depth0'].map(plane))
            ])
        ]);

        return pick;
    }());

    // the floor (hidden by default)
    floor = Stage.image('floor')
                 .appendTo(cube)
                 .pin({textureAlpha: 0.1,
                       scale: 1.1,
                       offsetX: -7,
                       offsetY: 138})
                 .hide();

    for (let {row, column, depth} of coordinates()) {
        const position = defaultCellPosition({row, column, depth});
        
        const digitValue = Math.floor(Math.random() * 9 + 1);  // TODO: hack

        // `cell` is the parent node of each cell, and represents the "hit box"
        // for selecting that cell.  Its descendants will be: the background
        // texture, the shadow, the digit, etc.
        const cell = Stage.image('orange')
                          .appendTo(cube)
                          .pin({width: cellHitboxWidth,
                                height: cellHitboxHeight,
                                textureAlpha: 0})
                          .stretch()
                          .pin(position)
                          .on(Mouse.CLICK, onClick(depth, row, digitValue));

        cells.push(cell);

        // shadows
        const shadowPosition = defaultCellPosition({row: 2, column, depth});
        shadowPosition.offsetY += 0.4 * spacingY;

        const shadowBox = Stage.image('red')
                               .appendTo(cube)
                               .pin({textureAlpha: 0})
                               .pin(shadowPosition)
                               .pin({width: cellHitboxWidth,
                                     height: cellHitboxHeight})
                               .stretch();

        shadows.push(shadowBox);

        const heightScale = heightScaling(row);

        Stage.image('shadow')
             .appendTo(shadowBox)
             .pin({scaleX: heightScale * cellScale(depth),
                   scaleY: heightScale * cellScale(depth) / 2,
                   textureAlpha: 0.1 + 0.4 * row / 2,  // from 0.1 to 0.5
                   align: 0.5,
                   skewX: -1});

        // TODO: blah blah blah
        let fillTexture;
        if (digitValue < 4) {
            fillTexture = editable;
        }
        // else if (digitValue === 9) {
        //     fillTexture = 'red border box';  // just for flavor
        // }
        else {
            fillTexture = preset;
        }

        // The visible part of the cell.
        const cellFill = Stage.image(fillTexture)
                              .appendTo(cell)
                              .pin({scale: cellScale(depth),
                                    align: 0.5});

        // The cell border.
        Stage.image('border box').appendTo(cellFill);

        // The number inside of the visible part of the cell.
        Stage.string(digitValue < 4 ? 'digit' : 'digit')
             .appendTo(cellFill)
             .value(digitValue);
    }
});
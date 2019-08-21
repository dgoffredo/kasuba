Stage(function(stage) {
    const Mouse = Stage.Mouse;

    stage.viewbox(720 / 4, 1280 / 4);

    const controlBox = Stage.column()
                            .appendTo(stage)
                            .pin({alignX: 1, offsetY: 10});

    let controls;

    Stage.image('menu')
         .appendTo(controlBox)
         .pin({'alignX': 1, offsetX: -10})
         .on(Mouse.CLICK,
             toggle(function () { controls.show(); },
                    function () { controls.hide(); }));

    controls = Stage.row()
                    .appendTo(controlBox)
                    .spacing(10);

    controls.hide();

    const editable = 'light box';
    const preset   = 'blue box';
    const selected = editable;
    let   cells    = [];
    let   shadows  = [];
    let   floor;
    let   cube;
    let   digitPicker;
    let   digitHitboxes = [];
    const cellHitboxWidth = 48;
    const cellHitboxHeight = 16;

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

    Stage.string('letter').value('C')
         .appendTo(controls)
         .on(Mouse.CLICK, toggle(function () {
                                     shadows.forEach(invokeMethod('hide'));
                                     return true;
                                 },
                                 function () {
                                     shadows.forEach(invokeMethod('show'));
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
             toggle(function () { floor.show() },
                    function () { floor.hide(); }));

    Stage.string('digit').value(7)
         .appendTo(controls)
         .on(Mouse.CLICK,
             toggle(function () {
                        cube.pin({textureAlpha: 0.2});
                        digitPicker.pin({textureAlpha: 0.2});
                        digitHitboxes.forEach(function (hitbox) {
                            hitbox.pin({textureAlpha: 0.8});
                        });
                    },
                    function () {
                        cube.pin({textureAlpha: 0});
                        digitPicker.pin({textureAlpha: 0});
                        digitHitboxes.forEach(function (hitbox) {
                            hitbox.pin({textureAlpha: 0});
                        });
                    }));;

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
    const perspective = 0.1;

    function cellPosition({row, column, depth}) {
        return {
            offsetX: spacingX * column + shear * depth,
            offsetY: spacingY * row    - shear * depth + spacingY,
        };
    }

    function cellScale(depth) {
        return 1 - perspective * depth;
    }

    function scale(node, scaleX, scaleY = scaleX) {
        const durationMs = 250;

        return node.tween(durationMs)
                   .pin({scaleX, scaleY})
                   .ease('bounce-in');
    }

    let selectedIndex;

    function heightScaling(row) {
        return 1 - (2 - row) * 0.1;
    }

    function showDigitPicker() {
        digitPicker.tween(500).pin({scaleX: 1}).ease('elastic');
    }

    function hideDigitPicker() {
        digitPicker.tween(200).pin({scaleX: 0}).ease('cubic');
    }

    function onClick(depth, row) {
        return function (point) {
            // `this` is the cell. We want to change the color and size of the
            // color texture containing the number. This is the cell's last
            // child (the shadow is drawn first so that it can be overdrawn).
            console.log(point);
            console.log(this);

            const depthScale    = cellScale(depth);
            const heightScale   = heightScaling(row);
            const magnification = 1.25;

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
                hideDigitPicker();
            }
            else {
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

    cube = Stage.image('purple')
                .appendTo(table)
                .pin({alignX: 0.5,
                      width: 175,
                      height: 190,
                      textureAlpha: 0})
                .stretch();

    // digit picker
    const digitPickerHeight = 28;

    digitPicker = Stage.image('red')
                       .appendTo(table)
                       .pin({alignX: 0.5,
                             width: 175,
                             height: digitPickerHeight,
                             textureAlpha: 0,
                             scaleX: 0})  // invisible when not in use
                       .stretch();
    const digits = Stage.row()
                        .appendTo(digitPicker)
                        .spacing(1)
                        .pin({alignX: 0.5});

    let chosenDigit;

    function scaleDigit(digit, {scale, alpha}) {
        return digit.tween(60).pin({scale, alpha}).ease('quad-in');
    }

    let touchedMostRecent;
    let dragging = false;
    function onTouch() {
        let toggledWhen = undefined;

        return function (event) {
            // console.log('touchy touchy:', event);
    
            if (event.type.endsWith('end') || event.type.endsWith('up')) {
                dragging = false;
                return true;
            }
    
            if (event.type.endsWith('start') || event.type.endsWith('down')) {
                dragging = true;
            }
            else if (!dragging && event.type !== 'click') {
                return true;
            }
    
            if (this === touchedMostRecent && event.type !== 'click') {
                return true;
            }
    
            touchedMostRecent = this;

            const stickinessMs = 300;
            const now = new Date();
            if (toggledWhen && now - toggledWhen < stickinessMs) {
                return true;
            }

            toggledWhen = now;
    
            if (this === chosenDigit) {
                console.log('shrinking my number');
                scaleDigit(this.last(), {scale: 1, alpha: 0.5});
                chosenDigit = undefined;
            }
            else {
                if (chosenDigit) {
                    console.log('shrinking previous number');
                    scaleDigit(chosenDigit.last(), {scale: 1, alpha: 0.5});
                }
                console.log('expanding my number');
                scaleDigit(this.last(), {scale: 1.5, alpha: 0.7});
                chosenDigit = this;
            }
            return true;
        };
    }
   
    Array.from('123456789').forEach(function (digit) {
        const colors = ['blue', 'purple', 'red', 'orange', 'yellow', 'green'];
        const digitHitbox =
            Stage.image(colors[digit % 6])
                 .appendTo(digits)
                 .pin({height: digitPickerHeight, width: 16, textureAlpha: 0})
                 .stretch()
                 .on([Mouse.START, Mouse.MOVE, Mouse.END, Mouse.CLICK],
                     onTouch());

        digitHitboxes.push(digitHitbox);

        // the digit itself (inside of the hitbox)
        Stage.string('digit')
             .appendTo(digitHitbox)
             .value(digit)
             .pin({alignX: 0.5, alignY: 0.3, alpha: 0.5});
    });

    // plane picker
    /*
    const planePicker = Stage.box()
                             .appendTo(stage)
                             .pin({alignX: 0.5,
                                   alignY: 1,
                                   handleY: 1,
                                   // height: 40,
                                   // width: 175,
                                   textureAlpha: 0.5 });
    */

    function fadedImage(name) {
        return Stage.image(name).pin({alpha: 0.5});
    }

    Stage.column().appendTo(table)
                  .spacing(10)
                  .pin({alignX: 0.5})
                  .append([
        Stage.row().spacing(20).append([
            Stage.row().spacing(5).append([
                fadedImage('depth0'),
                Stage.image('depth1').pin({scale: 1.2}),
                fadedImage('depth0'),
            ]),
            Stage.row().spacing(7).append(
                ['depth1', 'depth0', 'depth1'].map(fadedImage)
            )
        ]),
        Stage.row().spacing(20).append([
            Stage.row().spacing(5).append(
                ['depth1', 'depth0', 'depth1'].map(fadedImage)
            ),
            Stage.row().spacing(7).append(
                ['depth0', 'depth1', 'depth0'].map(fadedImage)
            )
        ])
    ]);

    /*
    <column>
      <row>
        <row><icon/><icon/><icon/></row>
        <row><icon/><icon/><icon/></row>
      </row>

      <row>
        <row><icon/><icon/><icon/></row>
        <row><icon/><icon/><icon/></row>
      </row>
    </column>
    */

    /*
    const pickerIcons = Stage.row()
                             .appendTo(planePicker)
                             .spacing(30)
                             .pin({align: 0.5});
 
    Stage.image('depth0').appendTo(pickerIcons);
    Stage.image('depth1').appendTo(pickerIcons).pin({alpha: 0.5});
    */

    floor = Stage.image('floor')
                 .appendTo(cube)
                 .pin({textureAlpha: 0.1,
                       scale: 1.1,
                       offsetX: -7,
                       offsetY: 138});

    floor.hide();

    for (let {row, column, depth} of coordinates()) {
        const position = cellPosition({row, column, depth});
        
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
                          .on(Mouse.CLICK, onClick(depth, row));

        cells.push(cell);

        // shadows
        const shadowPosition = cellPosition({row: 2, column, depth});
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
        const digitValue = Math.floor(Math.random() * 9 + 1);
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

        // The number inside of the visible part of the cell.
        const digit = Stage.string(digitValue < 4 ? 'digit' : 'digit')
                           .appendTo(cellFill)
                           .value(digitValue);
    }
});
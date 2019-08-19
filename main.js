Stage(function(stage) {
    const Mouse = Stage.Mouse;

    stage.viewbox(720 / 4, 1280 / 4);

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
    const shear       = 0.32 * spacing;
    const perspective = 0.15;

    function cellPosition({row, column, depth}) {
        return {
            offsetX: spacing * column + shear * depth,
            offsetY: spacing * row    - shear * depth + spacing,
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
        return scale(image.image('green'), 1.3 * amount);
    }

    function shrink(image, amount) {
        return scale(image.image('blue'), amount);
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

    const cube = Stage.image('blank')
                      .appendTo(stage)
                      .pin({align: 0.5, width: 175, height: 200})
                      .stretch();

    // TODO: have an optional "floor" with shadows, to aid perspective.
    const floor = Stage.image('floor').appendTo(cube)
                       .pin({width: 135,
                             textureAlpha: 0.5,
                             offsetY: 2.7 * spacing,
                             // offsetX: -20,
                             height: 55,
                             skewX: -0.85})
                       .stretch();

    for (let {row, column, depth} of coordinates()) {
        const position = cellPosition({row, column, depth});
        
        // `cell` is the parent node of each cell, and represents the "hit box"
        // for selecting that cell.  Its descendants will be: the background
        // texture, the shadow, the digit, etc.
        const cell = Stage.image('blank')
                          .appendTo(cube)
                          .pin({width: 45, height: 16})
                          .stretch()
                          .pin(position)
                          .on(Mouse.CLICK, onClick(depth));

        // TODO: trying out shadow.
        // Here's how the cell position is calculated, as an offset from the
        // top left of the cube:
        //
        //     offsetX: spacing * column + shear * depth,
        //     offsetY: spacing * row    - shear * depth + spacing,
        //     scale:   1 - perspective * depth
        //
        const heightScale = 1 - (2 - row) * 0.1;
        const shadowPosition = {
            // It's the scaling that's doing it!
            // offsetY: cellPosition({row: 0, column, depth}).offsetY + spacing * (2 - row),
            offsetY: spacing * (2 - row) + 0.5 * spacing,
            offsetX: shear,
            scaleY:  0.5 * heightScale * cellScale(depth),
            scaleX:  heightScale * cellScale(depth)
        };

        Stage.image('shadow')
             .appendTo(cell)
             .pin(shadowPosition)
             .pin({skewX: -1});

        // The visible part of the cell.
        const cellFill = Stage.image('blue')
                              .appendTo(cell)
                              .pin({scale: cellScale(depth),
                                    pivot: 0.5,
                                    alignX: 0.5,
                                    alignY: 0.5});

        // The number inside of the visible part of the cell.
        Stage.string('digit')
             .appendTo(cellFill)
             .pin({alignX: 0.4, alignY: 0.2, scale: 1.7, pivot: 0})
             .value(Math.floor(Math.random() * 10));
    }
});
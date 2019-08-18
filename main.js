Stage(function(stage) {
    const Mouse = Stage.Mouse;

    stage.viewbox(400, 100);

    const colors = ['green', 'blue', 'orange'];
    const spacing = 30;

    const column =
        Stage.column(0.5).appendTo(stage).pin('align', 0.5).spacing(spacing);

    let turns = 0;

    setInterval(() => {
        ++turns;
        column.tween(2000)
              .pin({rotation: turns * Math.PI / 2})
              .ease('elastic-in');
    }, 3000);

    function scale(node, amount) {
        const durationMs = 250;

        return node.tween(durationMs)
            .pin({scaleX: amount, scaleY: amount})
            .ease('bounce-in');
    }

    function expand(image) {
        return scale(image, 1.2);
    }

    function shrink(image) {
        return scale(image, 1.0);
    }

    let selectedImage;

    colors.forEach(() => {
        const row =
            Stage.row(0.5).appendTo(column).spacing(spacing);

        colors.forEach(color => {
            const box = Stage.image('blank').appendTo(row);

            Stage.image(color)
                .appendTo(box)
                .pin('align', 0.5)
                .on(Mouse.CLICK, function(point) {
                    console.log(point);
                    console.log(this);

                    if (selectedImage === this) {
                        shrink(this);
                        selectedImage = undefined;
                    }
                    else {
                        if (selectedImage !== undefined) {
                            shrink(selectedImage);
                        }
                        expand(this);
                        selectedImage = this;
                    }

                    // testing to see what this does
                    this.remove();
                    this.appendTo(box);

                    return true;
                });
        });
    });
});
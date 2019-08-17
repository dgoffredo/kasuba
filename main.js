Stage(function(stage) {
    const Mouse = Stage.Mouse;

    stage.viewbox(400, 100);

    const colors = ['green', 'blue', 'purple', 'red', 'orange', 'yellow'];

    const row = Stage.row(0.5).appendTo(stage).pin('align', 0.5).spacing(10);

    function scale(node, amount) {
        const durationMs = 250;

        return node.tween(durationMs)
            .pin({scaleX: amount, scaleY: amount})
            .ease('bounce-in');
    }

    function expand(image) {
        return scale(image, 1.5);
    }

    function shrink(image) {
        return scale(image, 1.0);
    }

    let selectedImage;

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

                return true;
            });
    });
});
function swipeDetector () {
    let startPoint;

    function onStart(event) {
        console.log('swipe detector START:', event);
        startPoint = {timestamp: event.timeStamp, x: event.x, y: event.y};
    }

    // The angle of the specified point in polar form where the y-axis points
    // _up_.  Note that this is contrary to the natural coordinate system of
    // the browser, where the y-axis points down.
    function angleOf({x, y}) {
        const magnitude    = Math.sqrt(x * x + y * y);
              angleRadians = Math.acos(x / magnitude);
    
        // Here's the special part to make the y-axis point up.
        if (y > 0) {
            return 2 * Math.PI - angleRadians;
        }
        else {
            return angleRadians;
        }
    }

    // Return the vector difference `point1 - point2`.
    function difference(point1, point2) {
        const x1 = point1.x, y1 = point1.y,
              x2 = point2.x, y2 = point2.y;

        return {x: x1 - x2, y: y1 - y2};
    }

    function onEnd(event) {
        console.log('swipe detector END:', event);

        const endPoint   = {x: event.x, y: event.y},
              durationMs = event.timeStamp - startPoint.timestamp;

        console.log('gesture duration was', durationMs, 'ms.');

        // If the gesture was too short, too long, or if we ended up where we
        // started, then do nothing.
        if (durationMs < 100) {
            console.log('Gesture was too short, at', durationMs, 'ms.');
            return;
        }
        if (durationMs > 400) {
            console.log('Gesture was too long, at', durationMs, 'ms.');
            return;
        }
        if (endPoint.x === startPoint.x && endPoint.y === startPoint.y) {
            console.log('Gesture ended up where it started.');
            return;
        }

        const angleRadians = angleOf(difference(endPoint, startPoint));
        console.log('Detected a swipe gesture with angle',
                    angleRadians / Math.PI * 180,
                    'degrees.');

        // Each direction is a 45 degree triangle emanating from the origin.
        // Imagine starting at 3 o'clock and going backwards in time an hour
        // and a half each step until you get back to where you started.  Then
        // `direction` tells you which way you're pointing at each step.
        const direction = [
            'right', 'up', 'up', 'left', 'left', 'down', 'down', 'right'
        ][Math.floor(angleRadians / (Math.PI / 4))];

        console.log('Swiped', direction);
        // TODO: do something with it.
    }

    return {onStart, onEnd};
}

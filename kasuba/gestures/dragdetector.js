// A `DragDetector` instance contains the state to keep track of when a
// pointer is placed down, moved around, and then lifted back up.
// Dragging is used to "rotate" the cube slightly.  This is distinct from
// the "swipe" gesture (see `gestures/swipe`) used to flip the cube.
//
// `DragDetector` doesn't register itself as an event handler.  It's just a
// state machine.  The caller must register its methods as event handlers as
// appropriate.
//
define('gestures/dragdetector', function () {

function DragDetector({
    onDrag = function ({originX, originY, offsetX, offsetY}) {
        console.log('DragDetector onDrag:',
                    {originX, originY, offsetX, offsetY});
    },
    onDragEnd = function () {
        console.log('DragDetector onEnd');
    }
} = {}) {

    let dragging = false,
        originX,
        originY,
        previousOffsetX = 0,
        previousOffsetY = 0;
    
    function onStart(event) {
        dragging        = true;
        originX         = event.x;
        originY         = event.y;
        previousOffsetX = 0;
        previousOffsetY = 0;
    }

    function onMove(event) {
        if (!dragging) {
            return;
        }

        const callbackArgs = {
            originX,
            originY,
            offsetX:   event.x - originX,
            offsetY:   event.y - originY,
            timestamp: event.timeStamp
        };

        callbackArgs.deltaX = callbackArgs.offsetX - previousOffsetX;
        callbackArgs.deltaY = callbackArgs.offsetY - previousOffsetY;

        previousOffsetX = callbackArgs.offsetX;
        previousOffsetY = callbackArgs.offsetY;
        
        return onDrag(callbackArgs);
    }

    function onEnd() {
        if (!dragging) {
            return;  // We get some ends without starts, for some reason.
        }

        dragging = false;
        return onDragEnd();
    }

    return {onStart, onMove, onEnd};
}

return DragDetector;
});

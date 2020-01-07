define('tada', function () {

const tada = (function () {
    const sound = new Audio('assets/tada.wav');

    return function () {
        sound.play();

        setTimeout(function () {
            // The `confetti` function is defined by the confetti.js library.
            confetti({
                particleCount: 150,
                origin: {y: 1},
                startVelocity: 55
            });
        }, 300);  // timeout roughed-in for the right feel
    };
}());

return {tada};

});
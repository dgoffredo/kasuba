const toggleFullscreen = (fscreen => {
    let currentlyFullscreen = false;

    fscreen.onfullscreenchange = arg => {
        console.log("fullscreen changed. Here's the arg:", arg);
        currentlyFullscreen = !currentlyFullscreen;
    };

    return (element) => {
        if (currentlyFullscreen) {
            console.log("exiting fullscreen");
            fscreen.exitFullscreen(element);
        }
        else {
            console.log("requesting fullscreen");
            fscreen.requestFullscreen(element);
        }
    };
})(fscreen);

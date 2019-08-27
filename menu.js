// This file is script that I moved out of `index.html`.

function refresh() {
    const skipBrowserCache = true;
    location.reload(skipBrowserCache);
    return true;
}

(function () {
    let selected;

    document.menu.color.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (radio !== selected) {
                selected = radio;
                document.body.style.backgroundColor = {
                    manila: '#e4c9af',
                    antiqueWhite: '#faebd7',
                    gray: '#ededed'
                }[radio.id];
            }
        });
    });
}());


// This file is script that I moved out of `index.html`.

const {refresh, toggleRules} = (function () {

function $(id) {
    return document.getElementById(id);
}

function $class(name) {
    return Array.from(document.getElementsByClassName(name));
}

// the click handler of the "new game" button calls this function
function refresh() {
    const skipBrowserCache = true;
    location.reload(skipBrowserCache);
    return true;
}

const toggleRules = (function () {
    let rulesShowing = false;

    return function () {
        let toShow, toHide;
        if (rulesShowing) {
            toShow = $class('options');
            toHide = $class('rules');
            $('rules').innerText = 'Rules';
        }
        else {
            toShow = $class('rules');
            toHide = $class('options');
            $('rules').innerText = 'Options';
        }

        toHide.forEach(function (element) {
            console.log('going to hide element:', element);
            element.style.display = 'none';
        });

        toShow.forEach(function (element) {
            console.log('going to show element:', element);
            element.style.display = 'block';
        });

        rulesShowing = !rulesShowing;
    };
}());

// background color selecting radio buttons
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

// prevent form submission (e.g. clicking a button) from reloading the page
$('menuForm').addEventListener('submit', function (event) {
    event.target.checkValidity();
    event.preventDefault();
    event.stopPropagation();
});

return {refresh, toggleRules};

}());
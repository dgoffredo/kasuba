// This menu page exposes settings that the user can modify.
//
define('menu/options', ['./functionref'], function (FunctionRef) {

const toggleShadows = FunctionRef(),
      toggleMistakes = FunctionRef();

function setup(spec) {
    toggleShadows.install(spec.toggleShadows);
    toggleMistakes.install(spec.toggleMistakes);
}

// background-color-selecting radio buttons
{
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
}

return {
    domClass: 'options',
    setup,
    toggleShadows: toggleShadows.invoke,
    toggleMistakes: toggleMistakes.invoke
};

});

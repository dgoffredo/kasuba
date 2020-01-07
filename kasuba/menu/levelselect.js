// This menu page allows the user to select a new puzzle to play, by
// difficulty level.
//
define('menu/levelselect', ['./functionref'], function (FunctionRef) {

const selectNewLevel = FunctionRef();
    
function setup(spec, {hide}) {
    selectNewLevel.install(function (level) {
        spec.selectNewLevel(level);
        hide();
    });
}

return {
    domClass: 'levelselect',
    name: 'levelSelect',
    setup,
    selectNewLevel: selectNewLevel.invoke
};

});

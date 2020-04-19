// The `DigitPicker` is the control that appears when an editable cell is
// selected.  It allows the user to pick which number is in the cell.  It
// uses `Picker` under the hood.
//
define('pickers/digitpicker', ['./picker', 'contracts', 'keyboard'],
function (Picker, {requireArguments}, Keyboard) {

function DigitPicker({
    parent,
    onSelect = function ({digit, previousDigit}) {
        console.log('selected digit:', digit, 'from', previousDigit);
    },
    onDeselect = function ({digit}) {
        console.log('deselected digit:', digit);
    }
}) {
    requireArguments({parent});

    const height    = 28,
          container = Stage.image('red')
                           .appendTo(parent)
                           .pin({alignX: 0.5,
                                 height,
                                 textureAlpha: HITBOX_ALPHA,
                                 scaleX: 0})  // invisible when not in use
                           .stretch(),
          pick      = Picker({hitboxHeight: height,
                              hitboxWidth: 18,
                              magnification: 1.5,
                              selectedAlpha: 0.7,
                              deselectedAlpha: 0.5,
                              onSelect: ({key, previousKey}) => onSelect({
                                  digit: Number(key),
                                  previousDigit:
                                      previousKey === undefined ?
                                                      undefined :
                                                      Number(previousKey)
                              }),
                              onDeselect: ({key}) => onDeselect({
                                  digit: Number(key),
                              })});
                                
    Stage.row()
         .appendTo(container)
         .pin({alignX: 0.5})
         .append(Array.from('123456789').map(function (digit) {
             return pick({
                 [digit]: Stage.string('digit')
                               .value(digit)
                               .pin({alignX: 0.5,
                                     alignY: 0.3,
                                     alpha: 0.5})
             });
         }));

    let showing = false;
    
    function show() {
        if (!showing) {
            container.tween(500).pin({scaleX: 1}).ease('elastic');
            showing = true;
        }
    }

    function hide() {
        if (showing) {
            container.tween(200).pin({scaleX: 0}).ease('cubic');
            showing = false;
        }
    }

    function select(args) {
        console.log('select(args) for args:', args);

        // Number -> String
        args.key = args.key.toString();

        if (args.key === '0') {
            pick.deselect(args);
        }
        else {
            pick.select(args);
        }
    }

    // If we're showing, then interpret digit keypresses as number selections,
    // and backspace as "clear."
    [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(digit => {
        Keyboard.on('Digit' +  digit, () => {
            if (showing) {
                select({key: digit});
            }
        });
    });

    Keyboard.on('Backspace', () => {
        if (showing) {
            select({key: 0});
        }
    });

    return {
        container,
        show,
        hide,
        select,
        deselect:       pick.deselect,
        showHitboxes:   pick.showHitboxes,
        hideHitboxes:   pick.hideHitboxes,
        toggleHitboxes: pick.toggleHitboxes
    };
}

return DigitPicker;

});

define('pickers/planepicker', ['./picker', 'geometry/planes', 'contracts'],
function (Picker, Planes, {requireArguments}) {
    
// {[plane]: {up, down, left, right}}
const transitions = Planes.transitions;

function PlanePicker({
    parent,
    onSelect = function ({plane, previousPlane}) {
        console.log('selected plane:', plane, 'from', previousPlane);
    },
    onDeselect = function ({plane}) {
        console.log('deselected plane:', plane);
    }
}) {
    requireArguments({parent});

    const pick = Picker({
        hitboxHeight: 24,
        hitboxWidth: 22,
        onSelect: ({key, previousKey}) => onSelect({
            plane: key,
            previousPlane: previousKey
        }),
        onDeselect: ({key}) => onDeselect({
            plane: key
        })
    });

    const images = {};  // {[key]: {node, currentImageName}}

    function plane(name) {
        const image = Stage.image(name).pin({alignX: 0.5, alignY: 0.33});

        images[name] = {node: image, currentImageName: name};

        return pick({[name]: image});
    }

    function rowOfPlanes(names) {
        return Stage.row().append(names.map(plane));
    }
   
    Stage.column().appendTo(parent)
                  .spacing(6)
                  .pin({alignX: 0.5})
                  .append([
        Stage.row().spacing(10).append([
            rowOfPlanes(['depth=0', 'depth=1', 'depth=2']),
            rowOfPlanes(['column=0', 'column=1', 'column=2'])
        ]),
        Stage.row().spacing(10).append([
            rowOfPlanes(['row=2', 'row=1', 'row=0']),
            rowOfPlanes(['row=2-column', 'row=depth', 'column=depth'])
        ])
    ]);

    pick.flip = function ({direction}) {
        Object.values(images).forEach(value => {
            const {node, currentImageName} = value,
                  nextImageName  = transitions[currentImageName][direction],
                  fadeDurationMs = 500;

            if (currentImageName === nextImageName) {
                return;
            }

            // Create another image so that the current image appears to fade.
            Stage.image(currentImageName)
                 .appendTo(node)
                 .tween(fadeDurationMs)
                 .pin({textureAlpha: 0})
                 .remove();

            // Change the actual image to the new image, but fade it in.
            node.image(nextImageName)
                .pin({textureAlpha: 0})
                .tween(fadeDurationMs)
                .pin({textureAlpha: 1});

            value.currentImageName = nextImageName;
        });
    }

    return pick;
}

return PlanePicker;

});
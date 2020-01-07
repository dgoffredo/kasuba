define('geometry/rotations', ['./matrix'], function (Matrix) {

// These rotations use a different coordinate system than the cube.  The cube
// has rows going down from 0 to 2, columns going to the right from 0 to 2, and
// depth going back from 0 to 2.
//
// The coordinate system instead used by these rotations is (x, y, z), where
// the origin (0, 0, 0) is at the _center_ of the cube.  x goes to the right
// (like column), y goes back (like depth), and z goes _up_.
// Each of x, y, and z can take on any of the values -1, 0, or 1.

function rotateInXyPlane(radians) {
    const {sin, cos} = Math;
    return [
        [ cos(radians),  sin(radians), 0],
        [-sin(radians),  cos(radians), 0],
        [            0,             0, 1]
    ];
}

function rotateInYzPlane(radians) {
    const {sin, cos} = Math;
    return [
        [1,             0,            0],
        [0,  cos(radians), sin(radians)],
        [0, -sin(radians), cos(radians)]
    ];
}

const identity = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
];

const halfPi = Math.PI / 2,
      up     = Matrix.map(rotateInYzPlane(-halfPi), Math.round),
      down   = Matrix.map(rotateInYzPlane(halfPi),  Math.round),
      left   = Matrix.map(rotateInXyPlane(-halfPi), Math.round),
      right  = Matrix.map(rotateInXyPlane(halfPi),  Math.round);

return {up, down, left, right, identity, rotateInXyPlane, rotateInYzPlane};

});

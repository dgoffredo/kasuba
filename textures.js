Stage({
    name: 'example',
    image: {src: 'assets/example4.png', ratio: 4},
    trim: 0.2,
    textures: {
        shadow: {x: 0 * 16, y: 0, width: 16, height: 16},
        light: {x: 1 * 16, y: 0, width: 16, height: 16},
        blue: {x: 2 * 16, y: 0, width: 16, height: 16},
        purple: {x: 3 * 16, y: 0, width: 16, height: 16},
        red: {x: 4 * 16, y: 0, width: 16, height: 16},
        orange: {x: 5 * 16, y: 0, width: 16, height: 16},
        yellow: {x: 6 * 16, y: 0, width: 16, height: 16},
        green: {x: 7 * 16, y: 0, width: 16, height: 16},
        blank: {x: 8 * 16, y: 0, width: 16, height: 16},

        rainbow: [
            'light',
            'blue',
            'purple',
            'red',
            'orange',
            'yellow',
            'green'
        ],

        digit: {
            0: {x: 0 * 16, y: 16, width: 16, height: 16},
            1: {x: 1 * 16, y: 16, width: 16, height: 16},
            2: {x: 2 * 16, y: 16, width: 16, height: 16},
            3: {x: 3 * 16, y: 16, width: 16, height: 16},
            4: {x: 4 * 16, y: 16, width: 16, height: 16},
            5: {x: 5 * 16, y: 16, width: 16, height: 16},
            6: {x: 6 * 16, y: 16, width: 16, height: 16},
            7: {x: 7 * 16, y: 16, width: 16, height: 16},
            8: {x: 8 * 16, y: 16, width: 16, height: 16},
            9: {x: 9 * 16, y: 16, width: 16, height: 16},
        },

        "gray box": { x: 0 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "blue box": { x: 1 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "green box": { x: 6 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },

        letter: {
            A: {x: 0 * 16, y: 48, width: 16, height: 16},
            B: {x: 1 * 16, y: 48, width: 16, height: 16},
            C: {x: 2 * 16, y: 48, width: 16, height: 16},
            D: {x: 3 * 16, y: 48, width: 16, height: 16},
            E: {x: 4 * 16, y: 48, width: 16, height: 16},
            F: {x: 5 * 16, y: 48, width: 16, height: 16},
        },

        floor: {x:0, y: 64, width: 166, height: 42}
    }
});

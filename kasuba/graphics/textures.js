define('graphics/textures', function () {

Stage({
    name: 'assets',
    image: {src: 'assets/textures.png', ratio: 4},
    trim: 0.2,
    textures: {
        shadow: {x: 0 * 16, y: 0, width: 16, height: 16},
        light:  {x: 1 * 16, y: 0, width: 16, height: 16},
        blue:   {x: 2 * 16, y: 0, width: 16, height: 16},
        purple: {x: 3 * 16, y: 0, width: 16, height: 16},
        red:    {x: 4 * 16, y: 0, width: 16, height: 16},
        orange: {x: 5 * 16, y: 0, width: 16, height: 16},
        yellow: {x: 6 * 16, y: 0, width: 16, height: 16},
        green:  {x: 7 * 16, y: 0, width: 16, height: 16},
        black:  {x: 8 * 16, y: 0, width: 16, height: 16},
        gray:   {x: 9 * 16, y: 0, width: 16, height: 16},

        blank: {x: 0 * 16, y: 16, width: 16, height: 16},  // same as digit.0

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

        "gray box":       { x: 0 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "blue box":       { x: 1 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "light box":      { x: 2 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "light blue box": { x: 3 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "border box":     { x: 4 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "red border box": { x: 5 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "green box":      { x: 6 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "red box":        { x: 7 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        "teal box":       { x: 8 * 16, y: 32, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },
        
        menu: { x: 9 * 16, y: 32, width: 16, height: 16 },
        back: { x: 8 * 16, y: 48, width: 16, height: 16 },
        help: { x: 9 * 16, y: 48, width: 16, height: 16 },

        "teal border box": {x: 0 * 16, y: 48, width: 16, height: 16, top: 4, bottom: 4, left: 4, right: 4 },

        // The names of these planes must match up with those used in
        // `geometry/planes.js` and in `cube.js`.
        "depth=0":        {x: 3 * 16, y: 64, width: 16, height: 16},
        "depth=1":        {x: 4 * 16, y: 64, width: 16, height: 16},
        "depth=2":        {x: 5 * 16, y: 64, width: 16, height: 16},
        "row=2":          {x: 6 * 16, y: 64, width: 16, height: 16},
        "row=1":          {x: 7 * 16, y: 64, width: 16, height: 16},
        "row=0":          {x: 8 * 16, y: 64, width: 16, height: 16},
        "column=0":       {x: 0 * 16, y: 80, width: 16, height: 16},
        "column=1":       {x: 1 * 16, y: 80, width: 16, height: 16},
        "column=2":       {x: 2 * 16, y: 80, width: 16, height: 16},
        "row=column":     {x: 3 * 16, y: 80, width: 16, height: 16},
        "row=depth":      {x: 4 * 16, y: 80, width: 16, height: 16},
        "column=depth":   {x: 5 * 16, y: 80, width: 16, height: 16},
        "row=2-column":   {x: 6 * 16, y: 80, width: 16, height: 16},
        "row=2-depth":    {x: 7 * 16, y: 80, width: 16, height: 16},
        "column=2-depth": {x: 8 * 16, y: 80, width: 16, height: 16}
    }
});

return {};

});

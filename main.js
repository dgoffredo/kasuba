var config = {
    type: Phaser.AUTO,
    // type: Phaser.CANVAS,
    width: 800,
    height: 600,
    physics: {
        default: 'matter',
        // arcade: {
        //     gravity: { y: 200 }
        // },
        matter: {
            gravity: { y: 1 },
            setBounds: {
                width: 800,
                height: 600
            }
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};

var game = new Phaser.Game(config);

function preload() {
    // this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
    this.load.image('logo', 'assets/sprites/phaser3-logo.png');
    this.load.image('red', 'assets/particles/red.png');
}

function create() {
    this.add.image(400, 300, 'sky');

    var particles = this.add.particles('red');

    var emitter = particles.createEmitter({
        speed: 200,
        scale: { start: 1, end: 0 },
        blendMode: 'ADD'
    });

    console.log(this);
    console.log(this.matter);
    // var logo = this.physics.add.image(400, 100, 'logo');
    var logo = this.matter.add.image(400, 100, 'logo');
    // var logo = this.add.image(400, 100, 'logo');

    // logo.setVelocity(100, 200);
    logo.setBounce(2);
    // logo.setFrictionAir(0.01);
    // logo.setCollideWorldBounds(true);
    // logo.setFriction(100);

    emitter.startFollow(logo);
    const game = this.game;
    const scene = this;
    let counter = 0;

    this.events.on('update', function(time, delta) {
        ++counter;
        if (counter <= 3) {
            console.log(time, delta);
            console.log(game.scene.keys);
            console.log(game.textures.list);
        }
        if (counter == 180) {
            // Object.values(game.textures.list).forEach(texture => texture.dirty = false);

            // scene.scene.sleep();

            // scene.scene.pause();

            // game.loop.raf.stop();
            // game.loop.running = false;

            // game.loop.stop();

            // game.loop.sleep();

            // game.loop.pause();

            // game.scene.pause('default');

            // const removeCanvas = false;
            // game.destroy(removeCanvas);
        }
    });
}

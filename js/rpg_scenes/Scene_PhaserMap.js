function Scene_PhaserMap() {
    this.initialize.apply(this, arguments);
}

Scene_PhaserMap.prototype = Object.create(Scene_Base.prototype);
Scene_PhaserMap.prototype.constructor = Scene_PhaserMap;

Scene_PhaserMap.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_PhaserMap.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    
    // Initialize Phaser Game instance if it doesn't exist
    if (!Graphics.phaser) {
        // We pass 'null' for renderer/canvas as the Bridge handles that via Graphics global
        Graphics.phaser = new Phaser.Game(Graphics.width, Graphics.height, Phaser.AUTO, '', null);
    }
    
    // Add a specific Phaser State for this RMMV Scene
    Graphics.phaser.state.add('GameWorld', {
        preload: this.phaserPreload.bind(this),
        create: this.phaserCreate.bind(this),
        update: this.phaserUpdate.bind(this)
    });
    
    Graphics.phaser.state.start('GameWorld');
    
    // Add Phaser World container to RMMV Scene
    // Graphics.phaser.world is a PIXI.Container (via Group)
    this.addChild(Graphics.phaser.stage); 
};

Scene_PhaserMap.prototype.phaserPreload = function(game) {
    // Phaser code
    // game.load.image('hero', 'img/characters/Actor1.png');
};

Scene_PhaserMap.prototype.phaserCreate = function(game) {
    // Phaser code
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    this.hero = game.add.sprite(100, 100, 'hero'); // Uses PZ_Sprite logic
    game.physics.arcade.enable(this.hero);
    
    this.hero.body.gravity.y = 300;
    this.hero.body.collideWorldBounds = true;
};

Scene_PhaserMap.prototype.phaserUpdate = function(game) {
    // Phaser code
    // Input handling
    if (Input.isPressed('ok')) { // Use RMMV Input
        this.hero.body.velocity.y = -300;
    }
};
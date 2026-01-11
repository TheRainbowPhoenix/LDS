//=============================================================================
// Scene_PhaserTest
// A "Hello World" scene to verify the RPG Maker <-> Phaser Bridge
//=============================================================================

function Scene_PhaserTest() {
    this.initialize.apply(this, arguments);
}

Scene_PhaserTest.prototype = Object.create(Scene_Base.prototype);
Scene_PhaserTest.prototype.constructor = Scene_PhaserTest;

Scene_PhaserTest.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
};

Scene_PhaserTest.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createWindowLayer(); // If you want RMMV windows on top
    
    // Phaser should already be init by Scene_Boot
    if (Graphics.phaser && Graphics.phaser.stage) {
        // Unpause the game and ensure the renderer is active
        Graphics.phaser.paused = false;

        this.runPhaserLogic();
        // Add the Phaser Stage (which is a PIXI.Container) to this Scene
        this.addChild(Graphics.phaser.stage);
    } else {
        console.error("Phaser not initialized in Scene_Boot!");
    }
};

Scene_PhaserTest.prototype.runPhaserLogic = function() {
    var game = Graphics.phaser;
    
    // Clear previous state/world children if you want a fresh start
    game.world.removeAll(); 

    // Define the state logic
    var state = {
        create: function() {
            // -- Texture Generation --
            var bmd = game.add.bitmapData(64, 64);
            bmd.ctx.fillStyle = '#00FF00'; // Green box
            bmd.ctx.fillRect(0,0,64,64);
            
            // Keyboard input
            this.cursors = game.input.keyboard.createCursorKeys();

            // Optional WASD support
            this.wasd = {
                up: game.input.keyboard.addKey(Phaser.Keyboard.W),
                down: game.input.keyboard.addKey(Phaser.Keyboard.S),
                left: game.input.keyboard.addKey(Phaser.Keyboard.A),
                right: game.input.keyboard.addKey(Phaser.Keyboard.D),
            };

            // Start Physics
            game.physics.startSystem(Phaser.Physics.ARCADE);
            
            // -- Sprite --
            this.box = game.add.sprite(game.world.centerX, 50, bmd);
            this.box.anchor.set(0.5);
            
            game.physics.arcade.enable(this.box);
            this.box.body.gravity.y = 500;
            this.box.body.collideWorldBounds = true;
            this.box.body.bounce.set(0.7);
            
            // Add some text
            var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
            this.text = game.add.text(game.world.centerX, 100, "Phaser running in RMMV!", style);
            this.text.anchor.set(0.5, 0);

            // Add a button to go back to the menu
            var button = game.add.text(game.world.centerX, game.world.centerY, "Back to Menu", { font: "24px Arial", fill: "#fff", backgroundColor: "#333", padding: 10 });
            button.anchor.set(0.5);
            button.inputEnabled = true;
            button.events.onInputDown.add(function() {
                // SceneManager.pop();
		        SceneManager.goto(Scene_Title);
            });

            // Add a timer to go back to the menu after 30 seconds
            game.time.events.add(Phaser.Timer.SECOND * 120, function() {
		        console.log("ttt");
		        SceneManager.goto(Scene_Title);
                // SceneManager.pop();
            });
        },

        update: function(game) {
            // Rotate the box
            const speed = 200;

            // Stop previous velocity
            this.box.body.velocity.x = 0;

            // Arrow keys
            if (this.cursors.left.isDown) {
                this.box.body.velocity.x = -speed;
            }
            else if (this.cursors.right.isDown) {
                this.box.body.velocity.x = speed;
            }

            // WASD (optional)
            if (this.wasd.left.isDown) {
                this.box.body.velocity.x = -speed;
            }
            else if (this.wasd.right.isDown) {
                this.box.body.velocity.x = speed;
            }

            // Jump (up arrow or W)
            if ((this.cursors.up.isDown || this.wasd.up.isDown) && this.box.body.touching.down) {
                this.box.body.velocity.y = -350;
            }

            // Rotate for fun
            this.box.rotation += 0.01;
        }
    };

    game.state.add('TestLevel', state);
    game.state.start('TestLevel');
};

Scene_PhaserTest.prototype.update = function() {
    // Run RMMV Scene update
    Scene_Base.prototype.update.call(this);

    // Escape Key to return to Title/Map
    if (Input.isTriggered('cancel') || Input.isTriggered('menu')) {
        // this.popScene();
        SceneManager.goto(Scene_Title);
    }
};

Scene_PhaserTest.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    // Detach stage so RMMV doesn't destroy the singleton Phaser stage
    if (Graphics.phaser && Graphics.phaser.stage) {
        // Detach the stage so it doesn't get destroyed by RMMV scene cleanup
        // if you want to persist the Phaser state.
        this.removeChild(Graphics.phaser.stage); 

        // Pause the Phaser game
        Graphics.phaser.paused = true;
    }
};

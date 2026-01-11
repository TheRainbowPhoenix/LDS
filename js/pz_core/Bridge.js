//=============================================================================
// PhaserBridge.js
// Adapts Phaser CE Core to run inside RPG Maker MV (Pixi v7)
//=============================================================================

var Phaser = Phaser || {};
Phaser.VERSION = 'CE-Bridge';
Phaser.GAMES = [];

// ---------------------------------------------------------------------------
// 1. Phaser.Game Adaptation
// ---------------------------------------------------------------------------

if (!PIXI.blendModes) {
    PIXI.blendModes = {"NORMAL":0,"ADD":1,"MULTIPLY":2,"SCREEN":3,"OVERLAY":4,"DARKEN":5,"LIGHTEN":6,"COLOR_DODGE":7,"COLOR_BURN":8,"HARD_LIGHT":9,"SOFT_LIGHT":10,"DIFFERENCE":11,"EXCLUSION":12,"HUE":13,"SATURATION":14,"COLOR":15,"LUMINOSITY":16}
}

if (!PIXI.blendModesCanvas)
{
    var b = [];
    var modes = PIXI.blendModes;
    var useNew = true;

    b[modes.NORMAL] = 'source-over';
    b[modes.ADD] = 'lighter';
    b[modes.MULTIPLY] = (useNew) ? 'multiply' : 'source-over';
    b[modes.SCREEN] = (useNew) ? 'screen' : 'source-over';
    b[modes.OVERLAY] = (useNew) ? 'overlay' : 'source-over';
    b[modes.DARKEN] = (useNew) ? 'darken' : 'source-over';
    b[modes.LIGHTEN] = (useNew) ? 'lighten' : 'source-over';
    b[modes.COLOR_DODGE] = (useNew) ? 'color-dodge' : 'source-over';
    b[modes.COLOR_BURN] = (useNew) ? 'color-burn' : 'source-over';
    b[modes.HARD_LIGHT] = (useNew) ? 'hard-light' : 'source-over';
    b[modes.SOFT_LIGHT] = (useNew) ? 'soft-light' : 'source-over';
    b[modes.DIFFERENCE] = (useNew) ? 'difference' : 'source-over';
    b[modes.EXCLUSION] = (useNew) ? 'exclusion' : 'source-over';
    b[modes.HUE] = (useNew) ? 'hue' : 'source-over';
    b[modes.SATURATION] = (useNew) ? 'saturation' : 'source-over';
    b[modes.COLOR] = (useNew) ? 'color' : 'source-over';
    b[modes.LUMINOSITY] = (useNew) ? 'luminosity' : 'source-over';

    PIXI.blendModesCanvas = b;
}

// ---------------------------------------------------------------------------
// 3. Phaser.Sprite Adaptation (Inherit from PIXI.Sprite v7)
// ---------------------------------------------------------------------------

Phaser.Sprite = function (game, x, y, key, frame) {
    // Determine texture from key
    var texture = PIXI.Texture.EMPTY;
    if (typeof key === 'string' && game.cache.checkImageKey(key)) {
        // Assume basic integration with RMMV ImageManager or Phaser Cache
        // For now, let's assume standard Pixi texture
        texture = PIXI.Texture.from(key); 
    }
    
    PIXI.Sprite.call(this, texture);

    this.game = game;
    this.x = x || 0;
    this.y = y || 0;
    this.key = key;
    this.alive = true;
    this.exists = true;
    this.anchor.set(0); // Default anchor

    // Physics Body
    this.body = null;
    this.health = 1;
    
    // Input
    this.input = null;
    this.inputEnabled = false;
};

Phaser.Sprite.prototype = Object.create(PIXI.Sprite.prototype);
Phaser.Sprite.prototype.constructor = Phaser.Sprite;

// Add generic Phaser Component mixins here (Life, Health, Input, Physics)
Phaser.Sprite.prototype.preUpdate = function() {
    if (this.body) this.body.preUpdate();
    if (this.inputEnabled && this.input) this.input.preUpdate();
    
    // Pixi v7 children update
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].preUpdate) this.children[i].preUpdate();
    }
};

Phaser.Sprite.prototype.postUpdate = function() {
    if (this.body) this.body.postUpdate();
    for (var i = 0; i < this.children.length; i++) {
        if (this.children[i].postUpdate) this.children[i].postUpdate();
    }
};

Phaser.Sprite.prototype.update = function() {
    // User code usually goes here
};

// ---------------------------------------------------------------------------
// 4. Utility Stubs (Required for Phaser to boot)
// ---------------------------------------------------------------------------

// Utils.Debug stub (stripped down)
Phaser.Utils = Phaser.Utils || {};
// Phaser.Utils.Debug = function(game) { this.game = game; };
// Phaser.Utils.Debug.prototype = {
//     boot: function() {},
//     preUpdate: function() {},
//     reset: function() {},
//     text: function() {},
//     geom: function() {}
// };

// ---------------------------------------------------------------------------
// 5. RPG Maker / Phaser Shared Input Handling
// ---------------------------------------------------------------------------
// This allows Phaser Input to read from RPG Maker's document listeners
// ---------------------------------------------------------------------------

// Override Phaser.Input.prototype.startPointer to use RMMV input data if needed
// Or let Phaser attach its own listeners to the Canvas.
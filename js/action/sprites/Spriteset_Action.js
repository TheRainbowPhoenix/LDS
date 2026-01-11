//=============================================================================
// Spriteset_Action - Action Scene Spriteset
//=============================================================================

/**
 * Manages all sprites for the action scene.
 * Handles rendering layers, camera, and sprite pooling.
 * 
 * @class Spriteset_Action
 * @extends Sprite
 */
function Spriteset_Action() {
    this.initialize.apply(this, arguments);
}

Spriteset_Action.prototype = Object.create(Sprite.prototype);
Spriteset_Action.prototype.constructor = Spriteset_Action;

Spriteset_Action.prototype.initialize = function() {
    Sprite.prototype.initialize.call(this);
    
    /**
     * Reference to game world
     * @type {ACT_World}
     */
    this.world = null;
    
    /**
     * Sprite containers by layer
     */
    this._baseSprite = null;
    this._tilemap = null;
    this._entityLayer = null;
    this._bulletLayer = null;
    this._effectLayer = null;
    this._hudLayer = null;
    
    /**
     * Entity sprite map
     * @type {Map<ACT_Entity, Sprite_ACT_Entity>}
     */
    this._entitySprites = new Map();
    
    /**
     * Bullet sprite pool
     */
    this._bulletSprites = [];
    this._bulletSpritePool = [];
    
    this.createLayers();
};

/**
 * Create rendering layers
 */
Spriteset_Action.prototype.createLayers = function() {
    // Base container (affected by camera)
    this._baseSprite = new Sprite();
    this.addChild(this._baseSprite);
    
    // Background layer
    this._backgroundSprite = new Sprite();
    this._baseSprite.addChild(this._backgroundSprite);
    
    // Tilemap layer
    this._tilemapContainer = new Sprite();
    this._baseSprite.addChild(this._tilemapContainer);
    
    // Entity layer
    this._entityLayer = new Sprite();
    this._baseSprite.addChild(this._entityLayer);
    
    // Bullet layer
    this._bulletLayer = new Sprite();
    this._baseSprite.addChild(this._bulletLayer);
    
    // Effect layer (particles, etc.)
    this._effectLayer = new Sprite();
    this._baseSprite.addChild(this._effectLayer);
    
    // HUD layer (not affected by camera)
    this._hudLayer = new Sprite();
    this.addChild(this._hudLayer);
    
    // Pre-allocate bullet sprites
    for (var i = 0; i < 100; i++) {
        var bulletSprite = new Sprite_ACT_Bullet(null);
        bulletSprite.visible = false;
        this._bulletSpritePool.push(bulletSprite);
        this._bulletLayer.addChild(bulletSprite);
    }
};

/**
 * Set the game world
 */
Spriteset_Action.prototype.setWorld = function(world) {
    this.world = world;
    
    // Clear existing sprites
    this.clearSprites();
    
    // Create tilemap
    this.createTilemap();
    
    // Create entity sprites
    this.createEntitySprites();
    
    // Create HUD
    this.createHUD();
};

/**
 * Clear all sprites
 */
Spriteset_Action.prototype.clearSprites = function() {
    // Clear entity sprites
    this._entitySprites.forEach(function(sprite) {
        this._entityLayer.removeChild(sprite);
    }, this);
    this._entitySprites.clear();
    
    // Reset bullet sprites
    for (var i = 0; i < this._bulletSprites.length; i++) {
        this._bulletSprites[i].visible = false;
        this._bulletSprites[i].entity = null;
    }
    this._bulletSprites = [];
};

/**
 * Create tilemap from world data
 */
Spriteset_Action.prototype.createTilemap = function() {
    // Remove existing tilemap
    if (this._tilemap) {
        this._tilemapContainer.removeChild(this._tilemap);
    }
    
    // Use RPG Maker's tilemap if available
    if ($gameMap && $dataMap) {
        this._tilemap = new Tilemap();
        this._tilemap.tileWidth = $gameMap.tileWidth();
        this._tilemap.tileHeight = $gameMap.tileHeight();
        this._tilemap.setData($gameMap.width(), $gameMap.height(), $gameMap.data());
        this._tilemap.horizontalWrap = $gameMap.isLoopHorizontal();
        this._tilemap.verticalWrap = $gameMap.isLoopVertical();
        
        this.loadTileset();
        
        this._tilemapContainer.addChild(this._tilemap);
    }
};

/**
 * Load tileset
 */
Spriteset_Action.prototype.loadTileset = function() {
    if (!this._tilemap) return;
    
    var tileset = $gameMap.tileset();
    if (tileset) {
        var tilesetNames = tileset.tilesetNames;
        for (var i = 0; i < tilesetNames.length; i++) {
            this._tilemap.bitmaps[i] = ImageManager.loadTileset(tilesetNames[i]);
        }
        
        var newTilesetFlags = $gameMap.tilesetFlags();
        this._tilemap.refreshTileset();
        if (!this._tilemap.flags.equals(newTilesetFlags)) {
            this._tilemap.refresh();
        }
        this._tilemap.flags = newTilesetFlags;
    }
};

/**
 * Create sprites for all entities
 */
Spriteset_Action.prototype.createEntitySprites = function() {
    if (!this.world) return;
    
    for (var i = 0; i < this.world.entities.length; i++) {
        this.createEntitySprite(this.world.entities[i]);
    }
};

/**
 * Create sprite for a single entity
 */
Spriteset_Action.prototype.createEntitySprite = function(entity) {
    if (this._entitySprites.has(entity)) return;
    
    var sprite = null;
    
    switch (entity.type) {
        case 'player':
            sprite = new Sprite_ACT_Player(entity);
            break;
        case 'enemy':
            sprite = new Sprite_ACT_Enemy(entity);
            break;
        default:
            sprite = new Sprite_ACT_Entity(entity);
    }
    
    this._entitySprites.set(entity, sprite);
    this._entityLayer.addChild(sprite);
    
    // Add HP gauge for enemies
    if (entity.type === 'enemy') {
        var gauge = new Sprite_ACT_HpGauge(entity);
        sprite.addChild(gauge);
        gauge.y = -entity.height / 2 - 8;
    }
    
    return sprite;
};

/**
 * Create HUD elements
 */
Spriteset_Action.prototype.createHUD = function() {
    // Player HP bar
    this._playerHpBar = new Sprite();
    this._playerHpBar.bitmap = new Bitmap(200, 20);
    this._playerHpBar.x = 10;
    this._playerHpBar.y = 10;
    this._hudLayer.addChild(this._playerHpBar);
};

/**
 * Update spriteset
 */
Spriteset_Action.prototype.update = function() {
    Sprite.prototype.update.call(this);
    
    if (!this.world) return;
    
    this.updateCamera();
    this.updateEntitySprites();
    this.updateBulletSprites();
    this.updateTilemap();
    this.updateHUD();
};

/**
 * Update camera position
 */
Spriteset_Action.prototype.updateCamera = function() {
    this._baseSprite.x = -Math.round(this.world.cameraX);
    this._baseSprite.y = -Math.round(this.world.cameraY);
};

/**
 * Update entity sprites
 */
Spriteset_Action.prototype.updateEntitySprites = function() {
    // Add sprites for new entities
    for (var i = 0; i < this.world.entities.length; i++) {
        var entity = this.world.entities[i];
        if (!this._entitySprites.has(entity)) {
            this.createEntitySprite(entity);
        }
    }
    
    // Update existing sprites
    this._entitySprites.forEach(function(sprite, entity) {
        if (!entity.active) {
            // Remove inactive entity sprites
            this._entityLayer.removeChild(sprite);
            this._entitySprites.delete(entity);
        } else {
            // Update position
            sprite.x = entity.x;
            sprite.y = entity.y;
            sprite.update();
        }
    }, this);
};

/**
 * Update bullet sprites
 */
Spriteset_Action.prototype.updateBulletSprites = function() {
    var activeBullets = this.world.bullets.getActive();
    
    // Match sprites to bullets
    for (var i = 0; i < activeBullets.length; i++) {
        var bullet = activeBullets[i];
        var sprite = this._bulletSprites[i];
        
        if (!sprite) {
            // Get from pool
            sprite = this._bulletSpritePool.pop();
            if (!sprite) {
                sprite = new Sprite_ACT_Bullet(null);
                this._bulletLayer.addChild(sprite);
            }
            this._bulletSprites[i] = sprite;
        }
        
        sprite.entity = bullet;
        sprite.visible = bullet.active && bullet.visible;
        sprite.x = bullet.x;
        sprite.y = bullet.y;
        sprite.update();
    }
    
    // Hide unused sprites
    for (var j = activeBullets.length; j < this._bulletSprites.length; j++) {
        var unusedSprite = this._bulletSprites[j];
        if (unusedSprite) {
            unusedSprite.visible = false;
            unusedSprite.entity = null;
            this._bulletSpritePool.push(unusedSprite);
        }
    }
    this._bulletSprites.length = activeBullets.length;
};

/**
 * Update tilemap
 */
Spriteset_Action.prototype.updateTilemap = function() {
    if (this._tilemap) {
        this._tilemap.origin.x = this.world.cameraX;
        this._tilemap.origin.y = this.world.cameraY;
    }
};

/**
 * Update HUD
 */
Spriteset_Action.prototype.updateHUD = function() {
    if (!this.world.player) return;
    
    var player = this.world.player;
    var bitmap = this._playerHpBar.bitmap;
    
    bitmap.clear();
    
    // Background
    bitmap.fillRect(0, 0, 200, 20, '#333333');
    
    // HP fill
    var hpRate = player.hp / player.maxHp;
    var fillWidth = Math.floor(196 * hpRate);
    var color = hpRate > 0.5 ? '#00ff00' : hpRate > 0.25 ? '#ffff00' : '#ff0000';
    bitmap.fillRect(2, 2, fillWidth, 16, color);
    
    // Text
    bitmap.fontSize = 14;
    bitmap.textColor = '#ffffff';
    bitmap.drawText('HP: ' + player.hp + '/' + player.maxHp, 4, 0, 192, 20, 'left');
};

/**
 * Destroy spriteset
 */
Spriteset_Action.prototype.destroy = function() {
    this.clearSprites();
    Sprite.prototype.destroy.call(this);
};
